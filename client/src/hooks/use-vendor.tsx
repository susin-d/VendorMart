import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StaticApiService } from "@/lib/staticApi";
import type { MockVendor, MockInventory } from "@/lib/mockData";

export function useVendor() {
  const queryClient = useQueryClient();

  // Fetch vendor data
  const { data: vendor, isLoading: vendorLoading } = useQuery<MockVendor>({
    queryKey: ['vendor'],
    queryFn: () => StaticApiService.getOrCreateVendor(),
  });

  // Fetch inventory
  const { data: inventory = [] } = useQuery<MockInventory[]>({
    queryKey: ['inventory'],
    queryFn: () => StaticApiService.getInventory(),
  });

  // Fetch low stock items
  const { data: lowStockItems = [] } = useQuery<MockInventory[]>({
    queryKey: ['inventory', 'low-stock'],
    queryFn: () => StaticApiService.getLowStockItems(),
  });

  // Sync data mutation
  const syncMutation = useMutation({
    mutationFn: () => StaticApiService.syncData(),
    onSuccess: () => {
      // Invalidate and refetch all queries
      queryClient.invalidateQueries({ queryKey: ['vendor'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
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
