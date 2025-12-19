import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerSchema, 
  insertVehicleSchema, 
  insertServiceSchema, 
  insertAppointmentSchema,
  insertServiceOrderSchema,
  insertBusinessSchema,
  insertLeadSchema,
  loginSchema,
  type User,
  type Business
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Extend Express Request to include user and business
declare global {
  namespace Express {
    interface Request {
      user?: User;
      business?: Business;
      sessionId?: string;
    }
  }
}

// Secure password hashing with bcrypt
function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

// Legacy SHA-256 hash for migration (temporary)
function legacyHashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify password - supports both bcrypt and legacy SHA-256
function verifyPassword(password: string, hash: string): boolean {
  // Check if it's a bcrypt hash (starts with $2a$ or $2b$)
  if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return bcrypt.compareSync(password, hash);
  }
  // Legacy SHA-256 verification
  return legacyHashPassword(password) === hash;
}

// Auth middleware
async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.sessionId;
  
  if (!sessionId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const session = await storage.getSession(sessionId);
  if (!session || session.expiresAt < new Date()) {
    return res.status(401).json({ error: "Session expired" });
  }

  const user = await storage.getUser(session.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  const business = await storage.getBusiness(user.businessId);
  if (!business) {
    return res.status(401).json({ error: "Business not found" });
  }

  req.user = user;
  req.business = business;
  req.sessionId = sessionId;
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ==================== AUTH ROUTES ====================
  
  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Email ou senha incorretos" });
      }

      if (!verifyPassword(password, user.passwordHash)) {
        return res.status(401).json({ error: "Email ou senha incorretos" });
      }

      // Auto-upgrade legacy SHA-256 hash to bcrypt
      if (!user.passwordHash.startsWith('$2a$') && !user.passwordHash.startsWith('$2b$')) {
        const newHash = hashPassword(password);
        await storage.updateUser(user.id, { passwordHash: newHash });
      }

      const session = await storage.createSession(user.id);
      const business = await storage.getBusiness(user.businessId);

      res.cookie("sessionId", session.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/",
      });

      res.json({ 
        user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
        business: business
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Erro ao fazer login" });
    }
  });

  // Logout
  app.post("/api/auth/logout", async (req, res) => {
    const sessionId = req.cookies?.sessionId;
    if (sessionId) {
      await storage.deleteSession(sessionId);
    }
    res.clearCookie("sessionId", { path: "/" });
    res.json({ success: true });
  });

  // Update profile
  app.patch("/api/auth/update-profile", authMiddleware, async (req, res) => {
    try {
      const { name } = req.body;
      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: "Nome é obrigatório" });
      }
      const updatedUser = await storage.updateUser(req.user!.id, { name: name.trim() });
      if (!updatedUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, avatarUrl: updatedUser.avatarUrl });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
  });

  // Change password
  app.post("/api/auth/change-password", authMiddleware, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: "Preencha todos os campos" });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({ error: "Nova senha deve ter pelo menos 6 caracteres" });
      }
      
      // Verify current password
      if (!verifyPassword(currentPassword, req.user!.passwordHash)) {
        return res.status(400).json({ error: "Senha atual incorreta" });
      }
      
      // Update password
      const newHash = hashPassword(newPassword);
      await storage.updateUser(req.user!.id, { passwordHash: newHash });
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Erro ao alterar senha" });
    }
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    const sessionId = req.cookies?.sessionId;
    
    if (!sessionId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = await storage.getSession(sessionId);
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ error: "Session expired" });
    }

    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const business = await storage.getBusiness(user.businessId);

    res.json({ 
      user: { id: user.id, name: user.name, email: user.email, role: user.role, avatarUrl: user.avatarUrl },
      business: business
    });
  });

  // Upload avatar
  app.post("/api/auth/upload-avatar", authMiddleware, async (req, res) => {
    try {
      const { avatarUrl } = req.body;
      if (!avatarUrl || typeof avatarUrl !== 'string') {
        return res.status(400).json({ error: "URL da imagem é obrigatória" });
      }
      
      // Validate data URL format and image type
      const dataUrlPattern = /^data:image\/(png|jpeg|jpg|gif|webp);base64,/;
      if (!dataUrlPattern.test(avatarUrl)) {
        return res.status(400).json({ error: "Formato de imagem inválido. Use PNG, JPEG, GIF ou WebP." });
      }
      
      // Validate size (max 2MB for base64, which is ~1.5MB actual file)
      const maxSizeBytes = 2 * 1024 * 1024;
      if (avatarUrl.length > maxSizeBytes) {
        return res.status(400).json({ error: "Imagem muito grande. Máximo permitido: 1.5MB" });
      }
      
      const updatedUser = await storage.updateUser(req.user!.id, { avatarUrl });
      if (!updatedUser) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }
      res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, role: updatedUser.role, avatarUrl: updatedUser.avatarUrl });
    } catch (error) {
      res.status(500).json({ error: "Erro ao atualizar foto" });
    }
  });

  // ==================== LEAD ROUTES (Public) ====================
  
  app.post("/api/leads", async (req, res) => {
    try {
      const data = insertLeadSchema.parse(req.body);
      const lead = await storage.createLead(data);
      res.status(201).json(lead);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create lead" });
    }
  });

  // Note: adminOnly middleware is defined after the protected routes section,
  // so we need to check role inline here temporarily
  app.get("/api/leads", authMiddleware, async (req, res) => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  // ==================== PUBLIC BOOKING ROUTES ====================
  
  // Get business by slug (public)
  app.get("/api/public/business/:slug", async (req, res) => {
    try {
      const business = await storage.getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      res.json({
        id: business.id,
        name: business.name,
        slug: business.slug,
        phone: business.phone,
        address: business.address,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch business" });
    }
  });

  // Get services for a business (public)
  app.get("/api/public/business/:slug/services", async (req, res) => {
    try {
      const business = await storage.getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const services = await storage.getActiveServices(business.id);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  // Get public appointments for availability check (only returns booked times, no personal data)
  app.get("/api/public/business/:slug/appointments", async (req, res) => {
    try {
      const business = await storage.getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }
      const dateStr = req.query.date as string;
      const date = dateStr ? new Date(dateStr) : undefined;
      const appointments = await storage.getAppointments(business.id, date);
      // Only return scheduledAt and duration for availability checking (no personal data)
      res.json(appointments.map(a => ({ scheduledAt: a.scheduledAt, duration: a.duration })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  // Create public booking
  app.post("/api/public/book/:slug", async (req, res) => {
    try {
      const business = await storage.getBusinessBySlug(req.params.slug);
      if (!business) {
        return res.status(404).json({ error: "Business not found" });
      }

      const { customer: customerData, vehicle: vehicleData, appointment: appointmentData } = req.body;

      // Validate that the service belongs to this business
      const service = await storage.getService(appointmentData.serviceId);
      if (!service || service.businessId !== business.id) {
        return res.status(400).json({ error: "Serviço não encontrado ou não pertence a este estabelecimento" });
      }

      // Check if customer already exists by phone
      let customer = await storage.getCustomerByPhone(business.id, customerData.phone);

      if (!customer) {
        customer = await storage.createCustomer({
          businessId: business.id,
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email || null,
          status: "active",
        });
      }

      // Check if vehicle already exists
      const existingVehicles = await storage.getVehiclesByCustomer(customer.id);
      let vehicle = existingVehicles.find((v) => 
        v.plate && vehicleData.plate && v.plate.toLowerCase() === vehicleData.plate.toLowerCase()
      );

      if (!vehicle) {
        vehicle = await storage.createVehicle({
          customerId: customer.id,
          brand: vehicleData.brand,
          model: vehicleData.model,
          plate: vehicleData.plate || null,
          color: vehicleData.color || null,
          year: null,
        });
      }

      // Create the appointment
      const appointment = await storage.createAppointment({
        businessId: business.id,
        customerId: customer.id,
        vehicleId: vehicle.id,
        serviceId: appointmentData.serviceId,
        scheduledAt: new Date(appointmentData.scheduledAt),
        duration: appointmentData.duration,
        status: "pending",
      });

      res.json({ 
        success: true, 
        appointment,
        customer: { id: customer.id, name: customer.name },
        vehicle: { id: vehicle.id, brand: vehicle.brand, model: vehicle.model }
      });
    } catch (error) {
      console.error("Public booking error:", error);
      res.status(500).json({ error: "Failed to create booking" });
    }
  });

  // ==================== PROTECTED ROUTES ====================

  // Customer routes
  app.get("/api/customers", authMiddleware, async (req, res) => {
    try {
      const customers = await storage.getCustomers(req.business!.id);
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer || customer.businessId !== req.business!.id) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", authMiddleware, async (req, res) => {
    try {
      const { businessId: _, ...clientData } = req.body;
      const data = insertCustomerSchema.parse({ ...clientData, businessId: req.business!.id });
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getCustomer(id);
      if (!existing || existing.businessId !== req.business!.id) {
        return res.status(404).json({ error: "Customer not found" });
      }
      const { businessId: _, ...clientData } = req.body;
      const data = insertCustomerSchema.partial().parse(clientData);
      const customer = await storage.updateCustomer(id, data);
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getCustomer(id);
      if (!existing || existing.businessId !== req.business!.id) {
        return res.status(404).json({ error: "Customer not found" });
      }
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // Vehicle routes
  app.get("/api/customers/:customerId/vehicles", authMiddleware, async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const vehicles = await storage.getVehiclesByCustomer(customerId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", authMiddleware, async (req, res) => {
    try {
      const data = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(data);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create vehicle" });
    }
  });

  app.patch("/api/vehicles/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(id, data);
      if (!vehicle) {
        return res.status(404).json({ error: "Vehicle not found" });
      }
      res.json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update vehicle" });
    }
  });

  app.delete("/api/vehicles/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVehicle(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Service routes
  app.get("/api/services", authMiddleware, async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const services = activeOnly 
        ? await storage.getActiveServices(req.business!.id) 
        : await storage.getServices(req.business!.id);
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      if (!service || service.businessId !== req.business!.id) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.post("/api/services", authMiddleware, async (req, res) => {
    try {
      const data = insertServiceSchema.parse({ ...req.body, businessId: req.business!.id });
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.patch("/api/services/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getService(id);
      if (!existing || existing.businessId !== req.business!.id) {
        return res.status(404).json({ error: "Service not found" });
      }
      const data = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, data);
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getService(id);
      if (!existing || existing.businessId !== req.business!.id) {
        return res.status(404).json({ error: "Service not found" });
      }
      await storage.deleteService(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", authMiddleware, async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const appointments = await storage.getAppointments(req.business!.id, date);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment || appointment.businessId !== req.business!.id) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", authMiddleware, async (req, res) => {
    try {
      const data = insertAppointmentSchema.parse({ ...req.body, businessId: req.business!.id });
      const appointment = await storage.createAppointment(data);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getAppointment(id);
      if (!existing || existing.businessId !== req.business!.id) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      const data = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, data);
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getAppointment(id);
      if (!existing || existing.businessId !== req.business!.id) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      await storage.deleteAppointment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // Service Order routes
  app.get("/api/service-orders", authMiddleware, async (req, res) => {
    try {
      const orders = await storage.getServiceOrders(req.business!.id);
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service orders" });
    }
  });

  app.post("/api/service-orders", authMiddleware, async (req, res) => {
    try {
      const data = insertServiceOrderSchema.parse({ ...req.body, businessId: req.business!.id });
      const order = await storage.createServiceOrder(data);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create service order" });
    }
  });

  app.patch("/api/service-orders/:id", authMiddleware, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const existing = await storage.getServiceOrder(id);
      if (!existing || existing.businessId !== req.business!.id) {
        return res.status(404).json({ error: "Service order not found" });
      }
      const data = insertServiceOrderSchema.partial().parse(req.body);
      const order = await storage.updateServiceOrder(id, data);
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update service order" });
    }
  });

  // Settings routes (business settings)
  app.get("/api/settings", authMiddleware, async (req, res) => {
    try {
      const business = req.business!;
      res.json({
        businessName: business.name,
        customUrl: business.slug,
        address: business.address,
        phone: business.phone,
        email: business.email,
        whatsappReminders: business.whatsappReminders,
        delayAlerts: business.delayAlerts,
        dailyReport: business.dailyReport,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", authMiddleware, async (req, res) => {
    try {
      const updates: any = {};
      if (req.body.businessName !== undefined) updates.name = req.body.businessName;
      if (req.body.customUrl !== undefined) updates.slug = req.body.customUrl;
      if (req.body.address !== undefined) updates.address = req.body.address;
      if (req.body.phone !== undefined) updates.phone = req.body.phone;
      if (req.body.email !== undefined) updates.email = req.body.email;
      if (req.body.whatsappReminders !== undefined) updates.whatsappReminders = req.body.whatsappReminders;
      if (req.body.delayAlerts !== undefined) updates.delayAlerts = req.body.delayAlerts;
      if (req.body.dailyReport !== undefined) updates.dailyReport = req.body.dailyReport;

      const business = await storage.updateBusiness(req.business!.id, updates);
      res.json({
        businessName: business!.name,
        customUrl: business!.slug,
        address: business!.address,
        phone: business!.phone,
        email: business!.email,
        whatsappReminders: business!.whatsappReminders,
        delayAlerts: business!.delayAlerts,
        dailyReport: business!.dailyReport,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", authMiddleware, async (req, res) => {
    try {
      const stats = await storage.getDashboardStats(req.business!.id);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // ==================== ADMIN ROUTES ====================
  
  // Admin role check middleware
  function adminOnly(req: Request, res: Response, next: NextFunction) {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
    }
    next();
  }
  
  // Get all businesses (admin only - for super admin view)
  app.get("/api/admin/businesses", authMiddleware, adminOnly, async (req, res) => {
    try {
      const allBusinesses = await storage.getAllBusinesses();
      res.json(allBusinesses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch businesses" });
    }
  });

  // Onboard new customer (create business + user)
  app.post("/api/admin/onboard", authMiddleware, adminOnly, async (req, res) => {
    try {
      const { businessName, slug, phone, address, userName, userEmail, userPassword } = req.body;

      if (!businessName || !slug || !userEmail || !userPassword) {
        return res.status(400).json({ error: "Campos obrigatórios: businessName, slug, userEmail, userPassword" });
      }

      // Check if slug is already taken
      const existingBusiness = await storage.getBusinessBySlug(slug);
      if (existingBusiness) {
        return res.status(400).json({ error: "Este slug já está em uso" });
      }

      // Check if email is already taken
      const existingUser = await storage.getUserByEmail(userEmail);
      if (existingUser) {
        return res.status(400).json({ error: "Este email já está cadastrado" });
      }

      // Create business
      const business = await storage.createBusiness({
        name: businessName,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        phone: phone || null,
        address: address || null,
      });

      // Create user (regular user, not admin)
      const passwordHash = hashPassword(userPassword);
      const user = await storage.createUser({
        businessId: business.id,
        name: userName || businessName,
        email: userEmail,
        passwordHash,
        role: 'user',
      });

      res.status(201).json({
        success: true,
        business: { id: business.id, name: business.name, slug: business.slug },
        user: { id: user.id, email: user.email, name: user.name },
      });
    } catch (error) {
      console.error("Onboard error:", error);
      res.status(500).json({ error: "Falha ao cadastrar cliente" });
    }
  });

  // Update lead status (admin only)
  app.patch("/api/leads/:id", authMiddleware, adminOnly, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const lead = await storage.updateLead(id, req.body);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: "Failed to update lead" });
    }
  });

  // Seed/Init test account
  app.post("/api/init", async (req, res) => {
    try {
      const passwordHash = hashPassword("senha123");
      const { business, user } = await storage.seedTestBusiness("arthurmsanttos@gmail.com", passwordHash);
      res.json({ 
        message: "Test account created successfully",
        business: { id: business.id, name: business.name, slug: business.slug },
        user: { id: user.id, email: user.email }
      });
    } catch (error) {
      console.error("Init error:", error);
      res.status(500).json({ error: "Failed to initialize test account" });
    }
  });

  return httpServer;
}
