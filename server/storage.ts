import { 
  type Business, type InsertBusiness,
  type User, type InsertUser,
  type Session, type InsertSession,
  type Lead, type InsertLead,
  type Customer, type InsertCustomer,
  type Vehicle, type InsertVehicle,
  type Service, type InsertService,
  type Appointment, type InsertAppointment,
  type ServiceOrder, type InsertServiceOrder,
  businesses, users, sessions, leads,
  customers, vehicles, services, appointments, serviceOrders
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and, gte, lte, desc, sql, ne } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // Business methods
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessBySlug(slug: string): Promise<Business | undefined>;
  getAllBusinesses(): Promise<Business[]>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined>;
  
  // User/Auth methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUsersByBusiness(businessId: number): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<void>;
  
  // Session methods
  getSession(id: string): Promise<Session | undefined>;
  createSession(userId: number): Promise<Session>;
  deleteSession(id: string): Promise<void>;
  cleanExpiredSessions(): Promise<void>;
  
  // Lead methods
  getLeads(): Promise<Lead[]>;
  getArchivedLeads(): Promise<Lead[]>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, lead: Partial<Lead>): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<Lead | undefined>;
  
  // Customer methods (business-scoped)
  getCustomers(businessId: number): Promise<(Customer & { vehicleCount: number })[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  getCustomerByPhone(businessId: number, phone: string): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<void>;
  
  // Vehicle methods
  getVehiclesByCustomer(customerId: number): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<void>;
  
  // Service methods (business-scoped)
  getServices(businessId: number): Promise<Service[]>;
  getActiveServices(businessId: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;
  
  // Appointment methods (business-scoped)
  getAppointments(businessId: number, date?: Date, status?: string): Promise<any[]>;
  getAppointmentCountsByMonth(businessId: number, year: number, month: number): Promise<Record<string, number>>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<void>;
  
  // Service Order methods (business-scoped)
  getServiceOrders(businessId: number): Promise<any[]>;
  getServiceOrder(id: number): Promise<ServiceOrder | undefined>;
  getServiceOrderByAppointmentId(appointmentId: number): Promise<ServiceOrder | undefined>;
  createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder>;
  updateServiceOrder(id: number, order: Partial<InsertServiceOrder>): Promise<ServiceOrder | undefined>;
  
  // Dashboard statistics (business-scoped)
  getDashboardStats(businessId: number): Promise<any>;
  
  // Seed test data
  seedTestBusiness(email: string, password: string): Promise<{ business: Business; user: User }>;
}

export class DrizzleStorage implements IStorage {
  private db;

  constructor(connectionString: string) {
    const pool = new pg.Pool({ 
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    this.db = drizzle(pool);
  }

  // Business methods
  async getBusiness(id: number): Promise<Business | undefined> {
    const result = await this.db.select().from(businesses).where(eq(businesses.id, id));
    return result[0];
  }

  async getBusinessBySlug(slug: string): Promise<Business | undefined> {
    const result = await this.db.select().from(businesses).where(eq(businesses.slug, slug));
    return result[0];
  }

  async getAllBusinesses(): Promise<Business[]> {
    return await this.db.select().from(businesses).orderBy(desc(businesses.id));
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const result = await this.db.insert(businesses).values(business).returning();
    return result[0];
  }

  async updateBusiness(id: number, business: Partial<InsertBusiness>): Promise<Business | undefined> {
    const result = await this.db.update(businesses).set(business).where(eq(businesses.id, id)).returning();
    return result[0];
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  async updateUser(id: number, data: Partial<InsertUser>): Promise<User | undefined> {
    const result = await this.db.update(users).set(data).where(eq(users.id, id)).returning();
    return result[0];
  }

  async getUsersByBusiness(businessId: number): Promise<User[]> {
    return await this.db.select().from(users).where(eq(users.businessId, businessId)).orderBy(desc(users.id));
  }

  async deleteUser(id: number): Promise<void> {
    await this.db.delete(users).where(eq(users.id, id));
  }

  // Session methods
  async getSession(id: string): Promise<Session | undefined> {
    const result = await this.db.select().from(sessions).where(eq(sessions.id, id));
    return result[0];
  }

  async createSession(userId: number): Promise<Session> {
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const result = await this.db.insert(sessions).values({
      id: sessionId,
      userId,
      expiresAt,
    }).returning();
    return result[0];
  }

  async deleteSession(id: string): Promise<void> {
    await this.db.delete(sessions).where(eq(sessions.id, id));
  }

  async cleanExpiredSessions(): Promise<void> {
    await this.db.delete(sessions).where(lte(sessions.expiresAt, new Date()));
  }

  // Lead methods
  async getLeads(): Promise<Lead[]> {
    return await this.db.select().from(leads).where(ne(leads.status, 'archived')).orderBy(desc(leads.createdAt));
  }

  async getArchivedLeads(): Promise<Lead[]> {
    return await this.db.select().from(leads).where(eq(leads.status, 'archived')).orderBy(desc(leads.createdAt));
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const result = await this.db.insert(leads).values(lead).returning();
    return result[0];
  }

  async updateLead(id: number, lead: Partial<Lead>): Promise<Lead | undefined> {
    const result = await this.db.update(leads).set(lead).where(eq(leads.id, id)).returning();
    return result[0];
  }

  async deleteLead(id: number): Promise<Lead | undefined> {
    const result = await this.db.delete(leads).where(eq(leads.id, id)).returning();
    return result[0];
  }

  // Customer methods
  async getCustomers(businessId: number): Promise<(Customer & { vehicleCount: number })[]> {
    const result = await this.db
      .select({
        id: customers.id,
        businessId: customers.businessId,
        name: customers.name,
        phone: customers.phone,
        email: customers.email,
        status: customers.status,
        notes: customers.notes,
        vehicleCount: sql<number>`cast(count(${vehicles.id}) as int)`,
      })
      .from(customers)
      .leftJoin(vehicles, eq(vehicles.customerId, customers.id))
      .where(eq(customers.businessId, businessId))
      .groupBy(customers.id)
      .orderBy(desc(customers.id));
    
    return result as (Customer & { vehicleCount: number })[];
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await this.db.select().from(customers).where(eq(customers.id, id));
    return result[0];
  }

  async getCustomerByPhone(businessId: number, phone: string): Promise<Customer | undefined> {
    const result = await this.db.select().from(customers).where(
      and(eq(customers.businessId, businessId), eq(customers.phone, phone))
    );
    return result[0];
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const result = await this.db.insert(customers).values(customer).returning();
    return result[0];
  }

  async updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const result = await this.db.update(customers).set(customer).where(eq(customers.id, id)).returning();
    return result[0];
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.db.delete(customers).where(eq(customers.id, id));
  }

  // Vehicle methods
  async getVehiclesByCustomer(customerId: number): Promise<Vehicle[]> {
    return await this.db.select().from(vehicles).where(eq(vehicles.customerId, customerId));
  }

  async getVehicle(id: number): Promise<Vehicle | undefined> {
    const result = await this.db.select().from(vehicles).where(eq(vehicles.id, id));
    return result[0];
  }

  async createVehicle(vehicle: InsertVehicle): Promise<Vehicle> {
    const result = await this.db.insert(vehicles).values(vehicle).returning();
    return result[0];
  }

  async updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const result = await this.db.update(vehicles).set(vehicle).where(eq(vehicles.id, id)).returning();
    return result[0];
  }

  async deleteVehicle(id: number): Promise<void> {
    await this.db.delete(vehicles).where(eq(vehicles.id, id));
  }

  // Service methods
  async getServices(businessId: number): Promise<Service[]> {
    return await this.db.select().from(services)
      .where(eq(services.businessId, businessId))
      .orderBy(services.category, services.name);
  }

  async getActiveServices(businessId: number): Promise<Service[]> {
    return await this.db.select().from(services)
      .where(and(eq(services.businessId, businessId), eq(services.isActive, true)))
      .orderBy(services.category, services.name);
  }

  async getService(id: number): Promise<Service | undefined> {
    const result = await this.db.select().from(services).where(eq(services.id, id));
    return result[0];
  }

  async createService(service: InsertService): Promise<Service> {
    const result = await this.db.insert(services).values(service).returning();
    return result[0];
  }

  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const result = await this.db.update(services).set(service).where(eq(services.id, id)).returning();
    return result[0];
  }

  async deleteService(id: number): Promise<void> {
    await this.db.delete(services).where(eq(services.id, id));
  }

  // Appointment methods
  async getAppointments(businessId: number, date?: Date, status?: string): Promise<any[]> {
    const selectFields = {
      id: appointments.id,
      businessId: appointments.businessId,
      scheduledAt: appointments.scheduledAt,
      duration: appointments.duration,
      status: appointments.status,
      notes: appointments.notes,
      createdAt: appointments.createdAt,
      customer: {
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
      },
      vehicle: {
        id: vehicles.id,
        brand: vehicles.brand,
        model: vehicles.model,
        plate: vehicles.plate,
      },
      service: {
        id: services.id,
        name: services.name,
        price: services.price,
      },
    };

    const conditions = [eq(appointments.businessId, businessId)];

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      conditions.push(gte(appointments.scheduledAt, startOfDay));
      conditions.push(lte(appointments.scheduledAt, endOfDay));
    }

    if (status) {
      conditions.push(eq(appointments.status, status));
    }

    return await this.db
      .select(selectFields)
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(vehicles, eq(appointments.vehicleId, vehicles.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .where(and(...conditions))
      .orderBy(appointments.scheduledAt);
  }

  async getAppointmentCountsByMonth(businessId: number, year: number, month: number): Promise<Record<string, number>> {
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
    
    const result = await this.db
      .select({
        date: sql<string>`TO_CHAR(${appointments.scheduledAt}, 'YYYY-MM-DD')`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          gte(appointments.scheduledAt, startOfMonth),
          lte(appointments.scheduledAt, endOfMonth)
        )
      )
      .groupBy(sql`TO_CHAR(${appointments.scheduledAt}, 'YYYY-MM-DD')`);
    
    return result.reduce((acc, row) => {
      acc[row.date] = row.count;
      return acc;
    }, {} as Record<string, number>);
  }

  async getAppointment(id: number): Promise<Appointment | undefined> {
    const result = await this.db.select().from(appointments).where(eq(appointments.id, id));
    return result[0];
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const result = await this.db.insert(appointments).values(appointment).returning();
    return result[0];
  }

  async updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const result = await this.db.update(appointments).set(appointment).where(eq(appointments.id, id)).returning();
    return result[0];
  }

  async deleteAppointment(id: number): Promise<void> {
    await this.db.delete(appointments).where(eq(appointments.id, id));
  }

  // Service Order methods
  async getServiceOrders(businessId: number): Promise<any[]> {
    return await this.db
      .select({
        id: serviceOrders.id,
        businessId: serviceOrders.businessId,
        amount: serviceOrders.amount,
        paymentStatus: serviceOrders.paymentStatus,
        paymentMethod: serviceOrders.paymentMethod,
        createdAt: serviceOrders.createdAt,
        paidAt: serviceOrders.paidAt,
        customer: {
          id: customers.id,
          name: customers.name,
        },
        service: {
          id: services.id,
          name: services.name,
        },
      })
      .from(serviceOrders)
      .leftJoin(customers, eq(serviceOrders.customerId, customers.id))
      .leftJoin(services, eq(serviceOrders.serviceId, services.id))
      .where(eq(serviceOrders.businessId, businessId))
      .orderBy(desc(serviceOrders.createdAt));
  }

  async getServiceOrder(id: number): Promise<ServiceOrder | undefined> {
    const result = await this.db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
    return result[0];
  }

  async getServiceOrderByAppointmentId(appointmentId: number): Promise<ServiceOrder | undefined> {
    const result = await this.db.select().from(serviceOrders).where(eq(serviceOrders.appointmentId, appointmentId));
    return result[0];
  }

  async createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder> {
    const result = await this.db.insert(serviceOrders).values(order).returning();
    return result[0];
  }

  async updateServiceOrder(id: number, order: Partial<InsertServiceOrder>): Promise<ServiceOrder | undefined> {
    const result = await this.db.update(serviceOrders).set(order).where(eq(serviceOrders.id, id)).returning();
    return result[0];
  }

  // Dashboard statistics
  async getDashboardStats(businessId: number): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayAppointments = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.businessId, businessId),
          gte(appointments.scheduledAt, today),
          lte(appointments.scheduledAt, tomorrow)
        )
      );

    const todayOrders = await this.db
      .select()
      .from(serviceOrders)
      .where(
        and(
          eq(serviceOrders.businessId, businessId),
          gte(serviceOrders.createdAt, today),
          lte(serviceOrders.createdAt, tomorrow),
          eq(serviceOrders.paymentStatus, "paid")
        )
      );

    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyOrders = await this.db
      .select()
      .from(serviceOrders)
      .where(
        and(
          eq(serviceOrders.businessId, businessId),
          gte(serviceOrders.createdAt, weekAgo),
          eq(serviceOrders.paymentStatus, "paid")
        )
      );

    const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0);

    // Calculate ticket médio (average order value)
    const allPaidOrders = await this.db
      .select()
      .from(serviceOrders)
      .where(
        and(
          eq(serviceOrders.businessId, businessId),
          eq(serviceOrders.paymentStatus, "paid")
        )
      );
    
    const ticketMedio = allPaidOrders.length > 0 
      ? allPaidOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0) / allPaidOrders.length 
      : 0;

    // Get weekly revenue by day for chart
    const weeklyData = [];
    const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);
      
      const dayOrders = weeklyOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= dayStart && orderDate < dayEnd;
      });
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0);
      weeklyData.push({
        name: dayNames[dayStart.getDay()],
        value: dayRevenue
      });
    }

    return {
      todayAppointments: todayAppointments.length,
      todayRevenue,
      weeklyRevenue,
      ticketMedio,
      weeklyData,
      appointmentsList: todayAppointments,
    };
  }

  // Seed test business and user
  async seedTestBusiness(email: string, passwordHash: string): Promise<{ business: Business; user: User }> {
    // Check if business already exists
    const existingUser = await this.getUserByEmail(email);
    if (existingUser) {
      const business = await this.getBusiness(existingUser.businessId);
      return { business: business!, user: existingUser };
    }

    // Create business
    const business = await this.createBusiness({
      name: "Rafael Lavagens",
      slug: "rafael-lavagens",
      phone: "(11) 99999-9999",
      email: email,
      address: "Rua das Flores, 123 - São Paulo, SP",
      plan: "pro",
      whatsappReminders: true,
      delayAlerts: true,
      dailyReport: false,
    });

    // Create user
    const user = await this.createUser({
      businessId: business.id,
      name: "Rafael Lavagens",
      email: email,
      passwordHash: passwordHash,
      role: "admin",
    });

    // Create sample services
    const servicesData = [
      { businessId: business.id, name: "Lavagem Simples", category: "Lavagem", price: "40.00", duration: 40, description: "Lavagem completa do veículo", features: ["Shampoo neutro", "Limpeza de rodas", "Aspiração interna", "Pretinho nos pneus"], isPopular: true, isActive: true },
      { businessId: business.id, name: "Lavagem Detalhada", category: "Lavagem", price: "80.00", duration: 90, description: "Lavagem detalhada com cera", features: ["Tudo da simples", "Cera líquida", "Limpeza de cantos"], isPopular: false, isActive: true },
      { businessId: business.id, name: "Polimento Comercial", category: "Estética", price: "250.00", duration: 240, description: "Polimento para remover riscos", features: ["Remoção riscos leves", "Brilho intenso"], isPopular: true, isActive: true },
      { businessId: business.id, name: "Higienização Interna", category: "Estética", price: "180.00", duration: 180, description: "Higienização completa do interior", features: ["Bancos e teto", "Carpetes", "Eliminação odores"], isPopular: false, isActive: true },
    ];

    const createdServices = [];
    for (const s of servicesData) {
      createdServices.push(await this.createService(s));
    }

    // Create sample customers
    const customersData = [
      { businessId: business.id, name: "João Silva", phone: "(11) 99999-9999", email: "joao@email.com", status: "vip" },
      { businessId: business.id, name: "Maria Oliveira", phone: "(11) 98888-8888", email: "maria@email.com", status: "active" },
      { businessId: business.id, name: "Carlos Souza", phone: "(11) 97777-7777", status: "active" },
    ];

    const createdCustomers = [];
    for (const c of customersData) {
      createdCustomers.push(await this.createCustomer(c));
    }

    // Create sample vehicles
    const vehiclesData = [
      { customerId: createdCustomers[0].id, brand: "Honda", model: "Civic", plate: "ABC-1234", color: "Preto", year: 2022 },
      { customerId: createdCustomers[1].id, brand: "Toyota", model: "Corolla", plate: "XYZ-5678", color: "Branco", year: 2021 },
      { customerId: createdCustomers[2].id, brand: "Jeep", model: "Compass", plate: "DEF-9012", color: "Prata", year: 2023 },
    ];

    const createdVehicles = [];
    for (const v of vehiclesData) {
      createdVehicles.push(await this.createVehicle(v));
    }

    // Create sample appointments
    const today = new Date();
    today.setHours(14, 0, 0, 0);
    
    const appointmentsData = [
      { businessId: business.id, customerId: createdCustomers[0].id, vehicleId: createdVehicles[0].id, serviceId: createdServices[0].id, scheduledAt: today, duration: createdServices[0].duration, status: "completed" },
      { businessId: business.id, customerId: createdCustomers[1].id, vehicleId: createdVehicles[1].id, serviceId: createdServices[2].id, scheduledAt: new Date(today.getTime() + 3600000), duration: createdServices[2].duration, status: "completed" },
    ];

    const createdAppointments = [];
    for (const a of appointmentsData) {
      createdAppointments.push(await this.createAppointment(a));
    }

    // Create sample service orders
    await this.createServiceOrder({
      businessId: business.id,
      appointmentId: createdAppointments[0].id,
      customerId: createdCustomers[0].id,
      vehicleId: createdVehicles[0].id,
      serviceId: createdServices[0].id,
      amount: createdServices[0].price,
      paymentStatus: "paid",
      paymentMethod: "pix",
    });

    return { business, user };
  }
}

export const storage = new DrizzleStorage(process.env.DATABASE_URL!);
