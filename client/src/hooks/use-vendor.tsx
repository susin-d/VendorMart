import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Vendor, Inventory } from "@shared/schema";

interface VendorData {
  vendor: Vendor | null;
  inventory: Inventory[];
  lowStockItems: Inventory[];
  isLoading: boolean;
  error: string | null;
}

export function useVendor() {
  const [vendorId, setVendorId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Initialize or get vendor ID from localStorage
  useEffect(() => {
    let storedVendorId = localStorage.getItem('vendorId');
    
    if (!storedVendorId) {
      // Register new vendor
      const registerVendor = async () => {
        try {
          const response = await apiRequest('POST', '/api/vendors/register', {
            name: 'Street Vendor',
            primaryLanguage: 'en',
            voiceLanguage: 'en-US',
            autoTranslate: true,
          });
          
          const newVendor = await response.json();
          localStorage.setItem('vendorId', newVendor.vendorId);
          setVendorId(newVendor.vendorId);
        } catch (error) {
          console.error('Failed to register vendor:', error);
          // Set a fallback vendor ID if registration fails
          const fallbackId = 'VM' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
          localStorage.setItem('vendorId', fallbackId);
          setVendorId(fallbackId);
        }
      };
      
      registerVendor();
    } else {
      setVendorId(storedVendorId);
    }
  }, []);

  // Fetch vendor data
  const { data: vendor, isLoading: vendorLoading } = useQuery<Vendor>({
    queryKey: ['/api/vendors', vendorId],
    enabled: !!vendorId,
  });

  // Fetch inventory
  const { data: inventory = [] } = useQuery<Inventory[]>({
    queryKey: ['/api/vendors', vendorId, 'inventory'],
    enabled: !!vendorId,
  });

  // Fetch low stock items
  const { data: lowStockItems = [] } = useQuery<Inventory[]>({
    queryKey: ['/api/vendors', vendorId, 'inventory', 'low-stock'],
    enabled: !!vendorId,
  });

  // Sync data mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!vendorId) throw new Error('No vendor ID');
      
      const response = await apiRequest('POST', `/api/vendors/${vendorId}/sync`, {
        syncType: 'all'
      });
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch all vendor-related queries
      queryClient.invalidateQueries({ queryKey: ['/api/vendors', vendorId] });
    },
  });

  const syncData = () => {
    syncMutation.mutate();
  };

  return {
    vendor,
    inventory,
    lowStockItems,
    isLoading: vendorLoading,
    syncData,
    isSyncing: syncMutation.isPending,
  };
}
