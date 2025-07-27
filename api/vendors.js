import { vendors } from '../shared/schema.js';
import { db } from '../server/db.js';
import { eq } from 'drizzle-orm';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST' && req.url === '/api/vendors/register') {
      // Vendor registration logic
      const { name, primaryLanguage = 'en', latitude, longitude } = req.body;
      
      // Generate unique vendor ID
      let vendorId;
      let existingVendor;
      do {
        vendorId = 'VM' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const [existing] = await db.select().from(vendors).where(eq(vendors.vendorId, vendorId));
        existingVendor = existing;
      } while (existingVendor);
      
      const [vendor] = await db
        .insert(vendors)
        .values({
          vendorId,
          name,
          primaryLanguage,
          latitude,
          longitude,
        })
        .returning();
      
      return res.json(vendor);
    }

    if (req.method === 'GET') {
      const urlParts = req.url.split('/');
      const vendorId = urlParts[3];
      
      if (vendorId) {
        const [vendor] = await db.select().from(vendors).where(eq(vendors.vendorId, vendorId));
        if (!vendor) {
          return res.status(404).json({ message: "Vendor not found" });
        }
        return res.json(vendor);
      }
    }

    return res.status(404).json({ message: "Route not found" });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ message: error.message || "Internal server error" });
  }
}