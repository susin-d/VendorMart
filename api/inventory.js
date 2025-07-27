import { inventory, vendors } from '../shared/schema.js';
import { db } from '../server/db.js';
import { eq, and, lt } from 'drizzle-orm';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const urlParts = req.url.split('/');
    const vendorId = urlParts[3]; // /api/vendors/VM1234/inventory
    
    // Get vendor by vendorId
    const [vendor] = await db.select().from(vendors).where(eq(vendors.vendorId, vendorId));
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (req.method === 'GET') {
      if (req.url.includes('/low-stock')) {
        // Get low stock items
        const lowStockItems = await db
          .select()
          .from(inventory)
          .where(and(
            eq(inventory.vendorId, vendor.id),
            lt(inventory.quantity, inventory.lowStockThreshold)
          ));
        return res.json(lowStockItems);
      } else {
        // Get all inventory
        const items = await db
          .select()
          .from(inventory)
          .where(eq(inventory.vendorId, vendor.id));
        return res.json(items);
      }
    }

    if (req.method === 'POST') {
      if (req.url.includes('/use')) {
        // Use item
        const { itemName, quantity = 1 } = req.body;
        
        const [existingItem] = await db
          .select()
          .from(inventory)
          .where(and(
            eq(inventory.vendorId, vendor.id),
            eq(inventory.itemName, itemName.toLowerCase())
          ));

        if (existingItem) {
          const newQuantity = Math.max(0, existingItem.quantity - quantity);
          const [updated] = await db
            .update(inventory)
            .set({ quantity: newQuantity, updatedAt: new Date() })
            .where(eq(inventory.id, existingItem.id))
            .returning();
          return res.json(updated);
        } else {
          return res.status(404).json({ message: "Item not found" });
        }
      } else {
        // Add new inventory item
        const { itemName, quantity, unit = 'units', lowStockThreshold = 2 } = req.body;
        
        const [item] = await db
          .insert(inventory)
          .values({
            vendorId: vendor.id,
            itemName: itemName.toLowerCase(),
            quantity,
            unit,
            lowStockThreshold,
          })
          .returning();
        
        return res.json(item);
      }
    }

    return res.status(404).json({ message: "Route not found" });
  } catch (error) {
    console.error('Inventory API Error:', error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
}