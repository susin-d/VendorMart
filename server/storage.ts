import { 
  vendors, 
  inventory, 
  chatMessages, 
  vendorConnections, 
  syncLog,
  type Vendor, 
  type InsertVendor,
  type Inventory,
  type InsertInventory,
  type ChatMessage,
  type InsertChatMessage,
  type VendorConnection,
  type InsertVendorConnection,
  type SyncLog,
  type InsertSyncLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, lt, gte } from "drizzle-orm";

export interface IStorage {
  // Vendor methods
  getVendor(id: string): Promise<Vendor | undefined>;
  getVendorByVendorId(vendorId: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor & { vendorId: string }): Promise<Vendor>;
  updateVendor(id: string, updates: Partial<InsertVendor>): Promise<Vendor | undefined>;
  getNearbyVendors(vendorId: string, radius?: number): Promise<Vendor[]>;
  
  // Inventory methods
  getVendorInventory(vendorId: string): Promise<Inventory[]>;
  getInventoryItem(vendorId: string, itemName: string): Promise<Inventory | undefined>;
  updateInventoryItem(vendorId: string, itemName: string, quantity: number): Promise<Inventory>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  getLowStockItems(vendorId: string): Promise<Inventory[]>;
  
  // Chat methods
  getChatMessages(limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Vendor connections
  getVendorConnections(vendorId: string): Promise<VendorConnection[]>;
  createVendorConnection(connection: InsertVendorConnection): Promise<VendorConnection>;
  updateConnectionStatus(id: string, status: string): Promise<VendorConnection | undefined>;
  
  // Sync methods
  createSyncLog(log: InsertSyncLog): Promise<SyncLog>;
  getLastSync(vendorId: string, syncType: string): Promise<SyncLog | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor || undefined;
  }

  async getVendorByVendorId(vendorId: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.vendorId, vendorId));
    return vendor || undefined;
  }

  async createVendor(insertVendor: InsertVendor & { vendorId: string }): Promise<Vendor> {
    const [vendor] = await db
      .insert(vendors)
      .values(insertVendor)
      .returning();
    return vendor;
  }

  async updateVendor(id: string, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [vendor] = await db
      .update(vendors)
      .set(updates)
      .where(eq(vendors.id, id))
      .returning();
    return vendor || undefined;
  }

  async getNearbyVendors(vendorId: string, radius: number = 5): Promise<Vendor[]> {
    // For now, return all vendors except the current one
    // In production, this would use PostGIS or similar for geospatial queries
    const nearbyVendors = await db
      .select()
      .from(vendors)
      .where(eq(vendors.isOnline, true))
      .limit(10);
    
    return nearbyVendors.filter(v => v.vendorId !== vendorId);
  }

  async getVendorInventory(vendorId: string): Promise<Inventory[]> {
    const vendor = await this.getVendorByVendorId(vendorId);
    if (!vendor) return [];
    
    return await db
      .select()
      .from(inventory)
      .where(eq(inventory.vendorId, vendor.id))
      .orderBy(asc(inventory.itemName));
  }

  async getInventoryItem(vendorId: string, itemName: string): Promise<Inventory | undefined> {
    const vendor = await this.getVendorByVendorId(vendorId);
    if (!vendor) return undefined;
    
    const [item] = await db
      .select()
      .from(inventory)
      .where(and(
        eq(inventory.vendorId, vendor.id),
        eq(inventory.itemName, itemName.toLowerCase())
      ));
    return item || undefined;
  }

  async updateInventoryItem(vendorId: string, itemName: string, quantity: number): Promise<Inventory> {
    const vendor = await this.getVendorByVendorId(vendorId);
    if (!vendor) throw new Error("Vendor not found");
    
    const existingItem = await this.getInventoryItem(vendorId, itemName);
    
    if (existingItem) {
      const [updated] = await db
        .update(inventory)
        .set({ 
          quantity: Math.max(0, quantity),
          updatedAt: new Date()
        })
        .where(eq(inventory.id, existingItem.id))
        .returning();
      return updated;
    } else {
      return await this.createInventoryItem({
        vendorId: vendor.id,
        itemName: itemName.toLowerCase(),
        quantity: Math.max(0, quantity),
        unit: "units"
      });
    }
  }

  async createInventoryItem(item: InsertInventory): Promise<Inventory> {
    const [created] = await db
      .insert(inventory)
      .values(item)
      .returning();
    return created;
  }

  async getLowStockItems(vendorId: string): Promise<Inventory[]> {
    const vendor = await this.getVendorByVendorId(vendorId);
    if (!vendor) return [];
    
    return await db
      .select()
      .from(inventory)
      .where(and(
        eq(inventory.vendorId, vendor.id),
        lt(inventory.quantity, inventory.lowStockThreshold)
      ));
  }

  async getChatMessages(limit: number = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .orderBy(desc(chatMessages.timestamp))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [created] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return created;
  }

  async getVendorConnections(vendorId: string): Promise<VendorConnection[]> {
    const vendor = await this.getVendorByVendorId(vendorId);
    if (!vendor) return [];
    
    return await db
      .select()
      .from(vendorConnections)
      .where(eq(vendorConnections.vendorId, vendor.id));
  }

  async createVendorConnection(connection: InsertVendorConnection): Promise<VendorConnection> {
    const [created] = await db
      .insert(vendorConnections)
      .values(connection)
      .returning();
    return created;
  }

  async updateConnectionStatus(id: string, status: string): Promise<VendorConnection | undefined> {
    const [updated] = await db
      .update(vendorConnections)
      .set({ status })
      .where(eq(vendorConnections.id, id))
      .returning();
    return updated || undefined;
  }

  async createSyncLog(log: InsertSyncLog): Promise<SyncLog> {
    const [created] = await db
      .insert(syncLog)
      .values(log)
      .returning();
    return created;
  }

  async getLastSync(vendorId: string, syncType: string): Promise<SyncLog | undefined> {
    const vendor = await this.getVendorByVendorId(vendorId);
    if (!vendor) return undefined;
    
    const [sync] = await db
      .select()
      .from(syncLog)
      .where(and(
        eq(syncLog.vendorId, vendor.id),
        eq(syncLog.syncType, syncType)
      ))
      .orderBy(desc(syncLog.lastSync))
      .limit(1);
    return sync || undefined;
  }
}

export const storage = new DatabaseStorage();
