import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCustomerSchema, 
  insertVehicleSchema, 
  insertServiceSchema, 
  insertAppointmentSchema,
  insertServiceOrderSchema,
  insertSettingsSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Customer routes
  app.get("/api/customers", async (req, res) => {
    try {
      const customers = await storage.getCustomers();
      res.json(customers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customers" });
    }
  });

  app.get("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch customer" });
    }
  });

  app.post("/api/customers", async (req, res) => {
    try {
      const data = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(data);
      res.status(201).json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create customer" });
    }
  });

  app.patch("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertCustomerSchema.partial().parse(req.body);
      const customer = await storage.updateCustomer(id, data);
      if (!customer) {
        return res.status(404).json({ error: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update customer" });
    }
  });

  app.delete("/api/customers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteCustomer(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete customer" });
    }
  });

  // Vehicle routes
  app.get("/api/customers/:customerId/vehicles", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const vehicles = await storage.getVehiclesByCustomer(customerId);
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch vehicles" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
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

  app.patch("/api/vehicles/:id", async (req, res) => {
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

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteVehicle(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete vehicle" });
    }
  });

  // Service routes
  app.get("/api/services", async (req, res) => {
    try {
      const activeOnly = req.query.active === 'true';
      const services = activeOnly ? await storage.getActiveServices() : await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.get("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const service = await storage.getService(id);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const data = insertServiceSchema.parse(req.body);
      const service = await storage.createService(data);
      res.status(201).json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  app.patch("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertServiceSchema.partial().parse(req.body);
      const service = await storage.updateService(id, data);
      if (!service) {
        return res.status(404).json({ error: "Service not found" });
      }
      res.json(service);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update service" });
    }
  });

  app.delete("/api/services/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteService(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service" });
    }
  });

  // Appointment routes
  app.get("/api/appointments", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const appointments = await storage.getAppointments(date);
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointments" });
    }
  });

  app.get("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const appointment = await storage.getAppointment(id);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch appointment" });
    }
  });

  app.post("/api/appointments", async (req, res) => {
    try {
      const data = insertAppointmentSchema.parse(req.body);
      const appointment = await storage.createAppointment(data);
      res.status(201).json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create appointment" });
    }
  });

  app.patch("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertAppointmentSchema.partial().parse(req.body);
      const appointment = await storage.updateAppointment(id, data);
      if (!appointment) {
        return res.status(404).json({ error: "Appointment not found" });
      }
      res.json(appointment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update appointment" });
    }
  });

  app.delete("/api/appointments/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAppointment(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete appointment" });
    }
  });

  // Service Order routes
  app.get("/api/service-orders", async (req, res) => {
    try {
      const orders = await storage.getServiceOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch service orders" });
    }
  });

  app.post("/api/service-orders", async (req, res) => {
    try {
      const data = insertServiceOrderSchema.parse(req.body);
      const order = await storage.createServiceOrder(data);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create service order" });
    }
  });

  app.patch("/api/service-orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertServiceOrderSchema.partial().parse(req.body);
      const order = await storage.updateServiceOrder(id, data);
      if (!order) {
        return res.status(404).json({ error: "Service order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update service order" });
    }
  });

  // Settings routes
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settings" });
    }
  });

  app.patch("/api/settings", async (req, res) => {
    try {
      const data = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(data);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update settings" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  // Public booking endpoint (no auth required)
  app.post("/api/public/book", async (req, res) => {
    try {
      const { customer: customerData, vehicle: vehicleData, appointment: appointmentData } = req.body;

      // Check if customer already exists by phone
      const existingCustomers = await storage.getCustomers();
      const existingCustomer = existingCustomers.find((c) => c.phone === customerData.phone);

      let customer;
      if (existingCustomer) {
        customer = existingCustomer;
      } else {
        customer = await storage.createCustomer({
          name: customerData.name,
          phone: customerData.phone,
          email: customerData.email || null,
          status: "active",
        });
      }

      // Check if vehicle already exists
      const existingVehicles = await storage.getVehiclesByCustomer(customer.id);
      const existingVehicle = existingVehicles.find((v) => 
        v.plate && vehicleData.plate && v.plate.toLowerCase() === vehicleData.plate.toLowerCase()
      );

      let vehicle;
      if (existingVehicle) {
        vehicle = existingVehicle;
      } else {
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

  // Seed database (for development only)
  app.post("/api/seed", async (req, res) => {
    try {
      // Create services
      const services = await Promise.all([
        storage.createService({
          name: "Lavagem Simples",
          category: "Lavagem",
          price: "40.00",
          duration: 40,
          description: "Lavagem completa do veículo",
          features: ["Shampoo neutro", "Limpeza de rodas", "Aspiração interna", "Pretinho nos pneus"],
          isPopular: true,
          isActive: true,
        }),
        storage.createService({
          name: "Lavagem Detalhada",
          category: "Lavagem",
          price: "80.00",
          duration: 90,
          description: "Lavagem detalhada com cera",
          features: ["Tudo da simples", "Cera líquida", "Limpeza de cantos", "Hidratação plásticos externos"],
          isPopular: false,
          isActive: true,
        }),
        storage.createService({
          name: "Polimento Comercial",
          category: "Estética",
          price: "250.00",
          duration: 240,
          description: "Polimento para remover riscos",
          features: ["Remoção riscos leves", "Brilho intenso", "Proteção 3 meses"],
          isPopular: true,
          isActive: true,
        }),
        storage.createService({
          name: "Higienização Interna",
          category: "Estética",
          price: "180.00",
          duration: 180,
          description: "Higienização completa do interior",
          features: ["Bancos e teto", "Carpetes", "Eliminação odores", "Hidratação couro"],
          isPopular: false,
          isActive: true,
        }),
      ]);

      // Create customers
      const customers = await Promise.all([
        storage.createCustomer({
          name: "João Silva",
          phone: "(11) 99999-9999",
          email: "joao@email.com",
          status: "vip",
        }),
        storage.createCustomer({
          name: "Maria Oliveira",
          phone: "(11) 98888-8888",
          email: "maria@email.com",
          status: "active",
        }),
        storage.createCustomer({
          name: "Carlos Souza",
          phone: "(11) 97777-7777",
          status: "active",
        }),
      ]);

      // Create vehicles
      const vehicles = await Promise.all([
        storage.createVehicle({
          customerId: customers[0].id,
          brand: "Honda",
          model: "Civic",
          plate: "ABC-1234",
          color: "Preto",
          year: 2022,
        }),
        storage.createVehicle({
          customerId: customers[1].id,
          brand: "Toyota",
          model: "Corolla",
          plate: "XYZ-5678",
          color: "Branco",
          year: 2021,
        }),
        storage.createVehicle({
          customerId: customers[2].id,
          brand: "Jeep",
          model: "Compass",
          plate: "DEF-9012",
          color: "Prata",
          year: 2023,
        }),
      ]);

      // Create appointments for today
      const today = new Date();
      today.setHours(14, 0, 0, 0);
      
      const appointments = await Promise.all([
        storage.createAppointment({
          customerId: customers[0].id,
          vehicleId: vehicles[0].id,
          serviceId: services[0].id,
          scheduledAt: today,
          duration: services[0].duration,
          status: "confirmed",
        }),
        storage.createAppointment({
          customerId: customers[1].id,
          vehicleId: vehicles[1].id,
          serviceId: services[2].id,
          scheduledAt: new Date(today.getTime() + 3600000), // +1 hour
          duration: services[2].duration,
          status: "in-progress",
        }),
      ]);

      // Create service orders
      await Promise.all([
        storage.createServiceOrder({
          appointmentId: appointments[0].id,
          customerId: customers[0].id,
          vehicleId: vehicles[0].id,
          serviceId: services[0].id,
          amount: services[0].price,
          paymentStatus: "paid",
          paymentMethod: "pix",
        }),
      ]);

      res.json({ message: "Database seeded successfully" });
    } catch (error) {
      console.error("Seed error:", error);
      res.status(500).json({ error: "Failed to seed database" });
    }
  });

  return httpServer;
}
