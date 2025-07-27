import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().unique(), // VM1234 format
  name: text("name").notNull(),
  primaryLanguage: varchar("primary_language").notNull().default("en"),
  voiceLanguage: varchar("voice_language").notNull().default("en-US"),
  autoTranslate: boolean("auto_translate").default(true),
  latitude: real("latitude"),
  longitude: real("longitude"),
  isOnline: boolean("is_online").default(true),
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  itemName: text("item_name").notNull(),
  quantity: integer("quantity").notNull().default(0),
  unit: varchar("unit").notNull().default("units"), // units, kg, liters, etc.
  lowStockThreshold: integer("low_stock_threshold").default(2),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  message: text("message").notNull(),
  originalLanguage: varchar("original_language").notNull(),
  translations: jsonb("translations"), // Store translations for different languages
  timestamp: timestamp("timestamp").defaultNow(),
});

export const vendorConnections = pgTable("vendor_connections", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  connectedVendorId: varchar("connected_vendor_id").notNull().references(() => vendors.id),
  status: varchar("status").notNull().default("pending"), // pending, connected, blocked
  createdAt: timestamp("created_at").defaultNow(),
});

export const syncLog = pgTable("sync_log", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id),
  syncType: varchar("sync_type").notNull(), // inventory, messages, profile
  status: varchar("status").notNull(), // success, failed, pending
  lastSync: timestamp("last_sync").defaultNow(),
});

// Relations
export const vendorRelations = relations(vendors, ({ many }) => ({
  inventory: many(inventory),
  messages: many(chatMessages),
  connections: many(vendorConnections, { relationName: "vendor_connections" }),
  connectedTo: many(vendorConnections, { relationName: "connected_vendors" }),
  syncLogs: many(syncLog),
}));

export const inventoryRelations = relations(inventory, ({ one }) => ({
  vendor: one(vendors, {
    fields: [inventory.vendorId],
    references: [vendors.id],
  }),
}));

export const chatMessageRelations = relations(chatMessages, ({ one }) => ({
  vendor: one(vendors, {
    fields: [chatMessages.vendorId],
    references: [vendors.id],
  }),
}));

export const vendorConnectionRelations = relations(vendorConnections, ({ one }) => ({
  vendor: one(vendors, {
    fields: [vendorConnections.vendorId],
    references: [vendors.id],
    relationName: "vendor_connections",
  }),
  connectedVendor: one(vendors, {
    fields: [vendorConnections.connectedVendorId],
    references: [vendors.id],
    relationName: "connected_vendors",
  }),
}));

export const syncLogRelations = relations(syncLog, ({ one }) => ({
  vendor: one(vendors, {
    fields: [syncLog.vendorId],
    references: [vendors.id],
  }),
}));

// Insert schemas
export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  vendorId: true,
  createdAt: true,
  lastSeen: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  timestamp: true,
});

export const insertVendorConnectionSchema = createInsertSchema(vendorConnections).omit({
  id: true,
  createdAt: true,
});

export const insertSyncLogSchema = createInsertSchema(syncLog).omit({
  id: true,
  lastSync: true,
});

// Types
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendors.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertVendorConnection = z.infer<typeof insertVendorConnectionSchema>;
export type VendorConnection = typeof vendorConnections.$inferSelect;

export type InsertSyncLog = z.infer<typeof insertSyncLogSchema>;
export type SyncLog = typeof syncLog.$inferSelect;
