import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertVendorSchema, insertInventorySchema, insertChatMessageSchema } from "@shared/schema";
import { z } from "zod";

// Language detection and translation utilities
async function detectLanguage(text: string): Promise<string> {
  // Basic language detection - in production, use a proper service
  const commonSpanishWords = ['hola', 'gracias', 'por favor', 'sí', 'no', 'qué', 'cómo'];
  const commonFrenchWords = ['bonjour', 'merci', 'oui', 'non', 'comment', 'que', 'où'];
  
  const lowerText = text.toLowerCase();
  
  if (commonSpanishWords.some(word => lowerText.includes(word))) {
    return 'es';
  }
  if (commonFrenchWords.some(word => lowerText.includes(word))) {
    return 'fr';
  }
  
  return 'en'; // default to English
}

async function translateText(text: string, targetLang: string, sourceLang: string = 'auto'): Promise<string> {
  // In production, integrate with Google Translate API or similar
  // For now, return original text with a language indicator
  if (targetLang === sourceLang || sourceLang === 'en' && targetLang === 'en') {
    return text;
  }
  
  // Mock translation response
  return `[Translated to ${targetLang}] ${text}`;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  const connectedClients = new Map<string, WebSocket>();

  wss.on('connection', (ws) => {
    let vendorId: string | null = null;

    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'register') {
          vendorId = message.vendorId;
          connectedClients.set(vendorId, ws);
          
          // Update vendor online status
          const vendor = await storage.getVendorByVendorId(vendorId);
          if (vendor) {
            await storage.updateVendor(vendor.id, { isOnline: true, lastSeen: new Date() });
          }
        }
        
        if (message.type === 'chat' && vendorId) {
          const vendor = await storage.getVendorByVendorId(vendorId);
          if (!vendor) return;
          
          // Detect message language
          const detectedLang = await detectLanguage(message.text);
          
          // Create translations for common languages
          const translations = {
            en: detectedLang === 'en' ? message.text : await translateText(message.text, 'en', detectedLang),
            es: detectedLang === 'es' ? message.text : await translateText(message.text, 'es', detectedLang),
            fr: detectedLang === 'fr' ? message.text : await translateText(message.text, 'fr', detectedLang),
          };
          
          // Save message to database
          const chatMessage = await storage.createChatMessage({
            vendorId: vendor.id,
            message: message.text,
            originalLanguage: detectedLang,
            translations
          });
          
          // Broadcast to all connected clients with their preferred language
          connectedClients.forEach((clientWs, clientVendorId) => {
            if (clientWs.readyState === WebSocket.OPEN) {
              // Get client's preferred language and send appropriate translation
              storage.getVendorByVendorId(clientVendorId).then(clientVendor => {
                const preferredLang = clientVendor?.primaryLanguage || 'en';
                const translatedText = translations[preferredLang as keyof typeof translations] || message.text;
                
                clientWs.send(JSON.stringify({
                  type: 'chat',
                  id: chatMessage.id,
                  vendorId: vendor.vendorId,
                  vendorName: vendor.name,
                  message: translatedText,
                  originalLanguage: detectedLang,
                  timestamp: chatMessage.timestamp
                }));
              });
            }
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    ws.on('close', () => {
      if (vendorId) {
        connectedClients.delete(vendorId);
        // Update vendor offline status
        storage.getVendorByVendorId(vendorId).then(vendor => {
          if (vendor) {
            storage.updateVendor(vendor.id, { isOnline: false, lastSeen: new Date() });
          }
        });
      }
    });
  });

  // Vendor registration and management
  app.post('/api/vendors/register', async (req, res) => {
    try {
      const validatedData = insertVendorSchema.parse(req.body);
      
      // Generate unique vendor ID
      let vendorId: string;
      let existingVendor;
      do {
        vendorId = 'VM' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        existingVendor = await storage.getVendorByVendorId(vendorId);
      } while (existingVendor);
      
      const vendor = await storage.createVendor({
        ...validatedData,
        vendorId,
      });
      
      res.json(vendor);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid vendor data" 
      });
    }
  });

  app.get('/api/vendors/:vendorId', async (req, res) => {
    try {
      const vendor = await storage.getVendorByVendorId(req.params.vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }
      res.json(vendor);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch vendor" 
      });
    }
  });

  app.put('/api/vendors/:vendorId', async (req, res) => {
    try {
      const vendor = await storage.getVendorByVendorId(req.params.vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      const updates = z.object({
        name: z.string().optional(),
        primaryLanguage: z.string().optional(),
        voiceLanguage: z.string().optional(),
        autoTranslate: z.boolean().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
      }).parse(req.body);

      const updatedVendor = await storage.updateVendor(vendor.id, updates);
      res.json(updatedVendor);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid update data" 
      });
    }
  });

  // Inventory management
  app.get('/api/vendors/:vendorId/inventory', async (req, res) => {
    try {
      const inventory = await storage.getVendorInventory(req.params.vendorId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch inventory" 
      });
    }
  });

  app.post('/api/vendors/:vendorId/inventory/use', async (req, res) => {
    try {
      const { itemName, quantity = 1 } = z.object({
        itemName: z.string(),
        quantity: z.number().optional(),
      }).parse(req.body);

      const existingItem = await storage.getInventoryItem(req.params.vendorId, itemName);
      const currentQuantity = existingItem?.quantity || 0;
      const newQuantity = currentQuantity - quantity;

      const updatedItem = await storage.updateInventoryItem(
        req.params.vendorId, 
        itemName, 
        newQuantity
      );

      res.json(updatedItem);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to update inventory" 
      });
    }
  });

  app.post('/api/vendors/:vendorId/inventory', async (req, res) => {
    try {
      const vendor = await storage.getVendorByVendorId(req.params.vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      const validatedData = insertInventorySchema.parse({
        ...req.body,
        vendorId: vendor.id,
      });

      const item = await storage.createInventoryItem(validatedData);
      res.json(item);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid inventory data" 
      });
    }
  });

  app.get('/api/vendors/:vendorId/inventory/low-stock', async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockItems(req.params.vendorId);
      res.json(lowStockItems);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch low stock items" 
      });
    }
  });

  // Chat messages
  app.get('/api/chat/messages', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = await storage.getChatMessages(limit);
      res.json(messages.reverse()); // Return in chronological order
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch messages" 
      });
    }
  });

  // Nearby vendors
  app.get('/api/vendors/:vendorId/nearby', async (req, res) => {
    try {
      const radius = parseInt(req.query.radius as string) || 5;
      const nearbyVendors = await storage.getNearbyVendors(req.params.vendorId, radius);
      res.json(nearbyVendors);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch nearby vendors" 
      });
    }
  });

  // Sync operations
  app.post('/api/vendors/:vendorId/sync', async (req, res) => {
    try {
      const { syncType = 'all' } = req.body;
      
      const vendor = await storage.getVendorByVendorId(req.params.vendorId);
      if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
      }

      // Create sync log
      await storage.createSyncLog({
        vendorId: vendor.id,
        syncType,
        status: 'success',
      });

      // Return current data
      const [inventory, lowStock, messages] = await Promise.all([
        storage.getVendorInventory(req.params.vendorId),
        storage.getLowStockItems(req.params.vendorId),
        storage.getChatMessages(20),
      ]);

      res.json({
        inventory,
        lowStock,
        messages: messages.reverse(),
        lastSync: new Date().toISOString(),
      });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Sync failed" 
      });
    }
  });

  return httpServer;
}
