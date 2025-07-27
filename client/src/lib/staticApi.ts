// Static API service for demo purposes
import { 
  MockVendor, 
  MockInventory, 
  MockChatMessage, 
  generateVendorId, 
  createMockVendor, 
  mockInventoryItems, 
  mockNearbyVendors, 
  mockChatMessages 
} from './mockData';

// Local storage keys
const VENDOR_KEY = 'vendormate_vendor';
const INVENTORY_KEY = 'vendormate_inventory';
const CHAT_KEY = 'vendormate_chat';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export class StaticApiService {
  // Vendor methods
  static async getOrCreateVendor(): Promise<MockVendor> {
    await delay(300);
    
    let vendor = localStorage.getItem(VENDOR_KEY);
    if (!vendor) {
      const vendorId = generateVendorId();
      const newVendor = createMockVendor(vendorId);
      localStorage.setItem(VENDOR_KEY, JSON.stringify(newVendor));
      
      // Initialize inventory
      const initialInventory = mockInventoryItems.map(item => ({
        ...item,
        vendorId: newVendor.id,
      }));
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialInventory));
      
      return newVendor;
    }
    
    return JSON.parse(vendor);
  }

  static async updateVendor(updates: Partial<MockVendor>): Promise<MockVendor> {
    await delay(200);
    
    const vendor = await this.getOrCreateVendor();
    const updatedVendor = { ...vendor, ...updates };
    localStorage.setItem(VENDOR_KEY, JSON.stringify(updatedVendor));
    return updatedVendor;
  }

  // Inventory methods
  static async getInventory(): Promise<MockInventory[]> {
    await delay(250);
    
    const inventory = localStorage.getItem(INVENTORY_KEY);
    if (!inventory) {
      return mockInventoryItems;
    }
    
    return JSON.parse(inventory);
  }

  static async useItem(itemName: string, quantity: number = 1): Promise<MockInventory> {
    await delay(200);
    
    const inventory = await this.getInventory();
    const itemIndex = inventory.findIndex(item => 
      item.itemName.toLowerCase() === itemName.toLowerCase()
    );
    
    if (itemIndex === -1) {
      // Create new item with negative quantity (indicating shortage)
      const newItem: MockInventory = {
        id: crypto.randomUUID(),
        vendorId: 'current-vendor',
        itemName: itemName.toLowerCase(),
        quantity: Math.max(0, -quantity),
        unit: 'units',
        lowStockThreshold: 2,
        updatedAt: new Date().toISOString(),
      };
      
      inventory.push(newItem);
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
      return newItem;
    }
    
    inventory[itemIndex].quantity = Math.max(0, inventory[itemIndex].quantity - quantity);
    inventory[itemIndex].updatedAt = new Date().toISOString();
    
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    return inventory[itemIndex];
  }

  static async addInventoryItem(item: Omit<MockInventory, 'id' | 'vendorId' | 'updatedAt'>): Promise<MockInventory> {
    await delay(200);
    
    const inventory = await this.getInventory();
    const newItem: MockInventory = {
      id: crypto.randomUUID(),
      vendorId: 'current-vendor',
      ...item,
      updatedAt: new Date().toISOString(),
    };
    
    inventory.push(newItem);
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory));
    return newItem;
  }

  static async getLowStockItems(): Promise<MockInventory[]> {
    await delay(150);
    
    const inventory = await this.getInventory();
    return inventory.filter(item => item.quantity <= item.lowStockThreshold);
  }

  // Chat methods
  static async getChatMessages(): Promise<MockChatMessage[]> {
    await delay(200);
    
    const messages = localStorage.getItem(CHAT_KEY);
    if (!messages) {
      localStorage.setItem(CHAT_KEY, JSON.stringify(mockChatMessages));
      return mockChatMessages;
    }
    
    return JSON.parse(messages);
  }

  static async sendChatMessage(message: string): Promise<MockChatMessage> {
    await delay(300);
    
    const vendor = await this.getOrCreateVendor();
    const messages = await this.getChatMessages();
    
    const newMessage: MockChatMessage = {
      id: crypto.randomUUID(),
      vendorId: vendor.vendorId,
      vendorName: vendor.name,
      message,
      originalLanguage: vendor.primaryLanguage,
      timestamp: new Date().toISOString(),
    };
    
    messages.push(newMessage);
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    
    return newMessage;
  }

  // Nearby vendors
  static async getNearbyVendors(): Promise<MockVendor[]> {
    await delay(400);
    return mockNearbyVendors;
  }

  // Sync operation
  static async syncData(): Promise<{
    inventory: MockInventory[];
    lowStock: MockInventory[];
    messages: MockChatMessage[];
    lastSync: string;
  }> {
    await delay(500);
    
    const [inventory, lowStock, messages] = await Promise.all([
      this.getInventory(),
      this.getLowStockItems(),
      this.getChatMessages(),
    ]);
    
    return {
      inventory,
      lowStock,
      messages,
      lastSync: new Date().toISOString(),
    };
  }
}