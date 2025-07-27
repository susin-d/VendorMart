// Mock data for static deployment
export interface MockVendor {
  id: string;
  vendorId: string;
  name: string;
  primaryLanguage: string;
  voiceLanguage: string;
  autoTranslate: boolean;
  latitude: number | null;
  longitude: number | null;
  isOnline: boolean;
  lastSeen: string;
  createdAt: string;
}

export interface MockInventory {
  id: string;
  vendorId: string;
  itemName: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  updatedAt: string;
}

export interface MockChatMessage {
  id: string;
  vendorId: string;
  vendorName: string;
  message: string;
  originalLanguage: string;
  timestamp: string;
}

// Generate vendor ID
export function generateVendorId(): string {
  return 'VM' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
}

// Create mock vendor
export function createMockVendor(vendorId: string): MockVendor {
  return {
    id: crypto.randomUUID(),
    vendorId,
    name: 'Street Vendor',
    primaryLanguage: 'en',
    voiceLanguage: 'en-US',
    autoTranslate: true,
    latitude: 40.7128,
    longitude: -74.0060,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// Mock inventory data
export const mockInventoryItems: MockInventory[] = [
  {
    id: crypto.randomUUID(),
    vendorId: 'current-vendor',
    itemName: 'tomatoes',
    quantity: 15,
    unit: 'kg',
    lowStockThreshold: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    vendorId: 'current-vendor',
    itemName: 'onions',
    quantity: 8,
    unit: 'kg',
    lowStockThreshold: 3,
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    vendorId: 'current-vendor',
    itemName: 'rice',
    quantity: 2,
    unit: 'bags',
    lowStockThreshold: 5,
    updatedAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    vendorId: 'current-vendor',
    itemName: 'cooking oil',
    quantity: 12,
    unit: 'bottles',
    lowStockThreshold: 3,
    updatedAt: new Date().toISOString(),
  },
];

// Mock nearby vendors
export const mockNearbyVendors: MockVendor[] = [
  {
    id: crypto.randomUUID(),
    vendorId: 'VM1234',
    name: 'Maria\'s Fresh Fruits',
    primaryLanguage: 'es',
    voiceLanguage: 'es-ES',
    autoTranslate: true,
    latitude: 40.7589,
    longitude: -73.9851,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    vendorId: 'VM5678',
    name: 'Ahmed\'s Spice Corner',
    primaryLanguage: 'ar',
    voiceLanguage: 'ar-SA',
    autoTranslate: true,
    latitude: 40.7505,
    longitude: -73.9934,
    isOnline: true,
    lastSeen: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: crypto.randomUUID(),
    vendorId: 'VM9012',
    name: 'Jean\'s Bakery',
    primaryLanguage: 'fr',
    voiceLanguage: 'fr-FR',
    autoTranslate: true,
    latitude: 40.7282,
    longitude: -74.0776,
    isOnline: false,
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
    createdAt: new Date().toISOString(),
  },
];

// Mock chat messages
export const mockChatMessages: MockChatMessage[] = [
  {
    id: crypto.randomUUID(),
    vendorId: 'VM1234',
    vendorName: 'Maria\'s Fresh Fruits',
    message: 'Good morning everyone! Fresh mangoes just arrived!',
    originalLanguage: 'en',
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    vendorId: 'VM5678',
    vendorName: 'Ahmed\'s Spice Corner',
    message: 'Anyone need premium saffron? Great price today!',
    originalLanguage: 'en',
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: crypto.randomUUID(),
    vendorId: 'VM9012',
    vendorName: 'Jean\'s Bakery',
    message: 'Fresh croissants ready in 10 minutes!',
    originalLanguage: 'en',
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
];