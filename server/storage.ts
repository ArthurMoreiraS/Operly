import { 
  type User, 
  type InsertUser,
  type Customer,
  type InsertCustomer,
  type Vehicle,
  type InsertVehicle,
  type Service,
  type InsertService,
  type Appointment,
  type InsertAppointment,
  type ServiceOrder,
  type InsertServiceOrder,
  type Settings,
  type InsertSettings,
  users,
  customers,
  vehicles,
  services,
  appointments,
  serviceOrders,
  settings
} from "@shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Customer methods
  getCustomers(): Promise<(Customer & { vehicleCount: number })[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<void>;
  
  // Vehicle methods
  getVehiclesByCustomer(customerId: number): Promise<Vehicle[]>;
  getVehicle(id: number): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: number, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: number): Promise<void>;
  
  // Service methods
  getServices(): Promise<Service[]>;
  getActiveServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<void>;
  
  // Appointment methods
  getAppointments(date?: Date): Promise<any[]>;
  getAppointment(id: number): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: number, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: number): Promise<void>;
  
  // Service Order methods
  getServiceOrders(): Promise<any[]>;
  getServiceOrder(id: number): Promise<ServiceOrder | undefined>;
  createServiceOrder(order: InsertServiceOrder): Promise<ServiceOrder>;
  updateServiceOrder(id: number, order: Partial<InsertServiceOrder>): Promise<ServiceOrder | undefined>;
  
  // Settings methods
  getSettings(): Promise<Settings | undefined>;
  updateSettings(settingsData: Partial<InsertSettings>): Promise<Settings>;
  
  // Dashboard statistics
  getDashboardStats(): Promise<any>;
}

export class DrizzleStorage implements IStorage {
  private db;

  constructor(connectionString: string) {
    const pool = new pg.Pool({ connectionString });
    this.db = drizzle(pool);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Customer methods
  async getCustomers(): Promise<(Customer & { vehicleCount: number })[]> {
    const result = await this.db
      .select({
        id: customers.id,
        name: customers.name,
        phone: customers.phone,
        email: customers.email,
        status: customers.status,
        notes: customers.notes,
        vehicleCount: sql<number>`cast(count(${vehicles.id}) as int)`,
      })
      .from(customers)
      .leftJoin(vehicles, eq(vehicles.customerId, customers.id))
      .groupBy(customers.id)
      .orderBy(desc(customers.id));
    
    return result as (Customer & { vehicleCount: number })[];
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const result = await this.db.select().from(customers).where(eq(customers.id, id));
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
  async getServices(): Promise<Service[]> {
    return await this.db.select().from(services).orderBy(services.category, services.name);
  }

  async getActiveServices(): Promise<Service[]> {
    return await this.db.select().from(services).where(eq(services.isActive, true)).orderBy(services.category, services.name);
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
  async getAppointments(date?: Date): Promise<any[]> {
    let query = this.db
      .select({
        id: appointments.id,
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
      })
      .from(appointments)
      .leftJoin(customers, eq(appointments.customerId, customers.id))
      .leftJoin(vehicles, eq(appointments.vehicleId, vehicles.id))
      .leftJoin(services, eq(appointments.serviceId, services.id))
      .orderBy(appointments.scheduledAt);

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      return await query.where(
        and(
          gte(appointments.scheduledAt, startOfDay),
          lte(appointments.scheduledAt, endOfDay)
        )
      );
    }

    return await query;
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
  async getServiceOrders(): Promise<any[]> {
    return await this.db
      .select({
        id: serviceOrders.id,
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
      .orderBy(desc(serviceOrders.createdAt));
  }

  async getServiceOrder(id: number): Promise<ServiceOrder | undefined> {
    const result = await this.db.select().from(serviceOrders).where(eq(serviceOrders.id, id));
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

  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    const result = await this.db.select().from(settings).limit(1);
    if (result.length === 0) {
      // Create default settings if none exist
      const defaultSettings: InsertSettings = {
        businessName: "Meu Lava-Rápido",
        whatsappReminders: true,
        delayAlerts: true,
        dailyReport: false,
      };
      const created = await this.db.insert(settings).values(defaultSettings).returning();
      return created[0];
    }
    return result[0];
  }

  async updateSettings(settingsData: Partial<InsertSettings>): Promise<Settings> {
    const existing = await this.getSettings();
    if (!existing) {
      const result = await this.db.insert(settings).values(settingsData as InsertSettings).returning();
      return result[0];
    }
    const result = await this.db.update(settings).set(settingsData).where(eq(settings.id, existing.id)).returning();
    return result[0];
  }

  // Dashboard statistics
  async getDashboardStats(): Promise<any> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's appointments
    const todayAppointments = await this.db
      .select()
      .from(appointments)
      .where(
        and(
          gte(appointments.scheduledAt, today),
          lte(appointments.scheduledAt, tomorrow)
        )
      );

    // Get today's revenue
    const todayOrders = await this.db
      .select()
      .from(serviceOrders)
      .where(
        and(
          gte(serviceOrders.createdAt, today),
          lte(serviceOrders.createdAt, tomorrow),
          eq(serviceOrders.paymentStatus, "paid")
        )
      );

    const todayRevenue = todayOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0);

    // Get weekly revenue
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyOrders = await this.db
      .select()
      .from(serviceOrders)
      .where(
        and(
          gte(serviceOrders.createdAt, weekAgo),
          eq(serviceOrders.paymentStatus, "paid")
        )
      );

    const weeklyRevenue = weeklyOrders.reduce((sum, order) => sum + parseFloat(order.amount), 0);

    return {
      todayAppointments: todayAppointments.length,
      todayRevenue,
      weeklyRevenue,
      appointmentsList: todayAppointments,
    };
  }
}

export const storage = new DrizzleStorage(process.env.DATABASE_URL!);
