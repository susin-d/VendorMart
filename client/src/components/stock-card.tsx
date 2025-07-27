import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, RefreshCw, AlertTriangle, Apple, Wheat, Carrot } from "lucide-react";
import type { MockInventory } from "@/lib/mockData";

interface StockCardProps {
  inventory: MockInventory[];
  onRefresh: () => void;
}

const getItemIcon = (itemName: string) => {
  const name = itemName.toLowerCase();
  if (name.includes('tomato') || name.includes('apple')) return Apple;
  if (name.includes('rice') || name.includes('wheat')) return Wheat;
  if (name.includes('onion') || name.includes('pepper')) return Carrot;
  return Package;
};

export default function StockCard({ inventory, onRefresh }: StockCardProps) {
  return (
    <Card className="vendormate-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="text-[--vendormate-primary]" size={24} />
            <span>Stock Levels</span>
          </div>
          <Button variant="ghost" size="sm" onClick={onRefresh}>
            <RefreshCw size={16} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {inventory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Package size={48} className="mx-auto mb-4 opacity-50" />
            <p>No inventory items yet</p>
            <p className="text-sm">Use voice input or manual entry to add items</p>
          </div>
        ) : (
          inventory.map((item) => {
            const ItemIcon = getItemIcon(item.itemName);
            const isLowStock = item.quantity <= (item.lowStockThreshold || 2);
            
            return (
              <div 
                key={item.id} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  isLowStock ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                    isLowStock ? 'bg-red-500' : 'bg-[--vendormate-secondary]'
                  }`}>
                    <ItemIcon size={16} />
                  </div>
                  <span className="font-medium text-gray-800 capitalize">{item.itemName}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${
                    isLowStock ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {item.quantity}
                  </span>
                  <span className="text-sm text-gray-600">{item.unit}</span>
                  {isLowStock && <AlertTriangle className="text-red-500" size={16} />}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
