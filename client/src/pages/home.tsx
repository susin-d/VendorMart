import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, 
  Settings, 
  Mic, 
  Package, 
  Users, 
  MessageCircle, 
  FolderSync, 
  Languages,
  Home as HomeIcon,
  RefreshCw,
  AlertTriangle,
  Minus,
  Search,
  MapPin,
  Send,
  UserCheck
} from "lucide-react";
import VoiceInput from "@/components/voice-input";
import StockCard from "@/components/stock-card";
import ChatComponent from "@/components/chat-component";
import NearbyVendors from "@/components/nearby-vendors";
import LanguageSelector from "@/components/language-selector";
import { useVendor } from "@/hooks/use-vendor";
import { useWebSocket } from "@/hooks/use-websocket";
import { StaticApiService } from "@/lib/staticApi";

export default function Home() {
  const { toast } = useToast();
  const { vendor, isLoading: vendorLoading, syncData, inventory, lowStockItems } = useVendor();
  const { isConnected } = useWebSocket(vendor?.vendorId);
  const [itemInput, setItemInput] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>("Never");

  useEffect(() => {
    if (vendor) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - new Date(vendor.lastSeen || vendor.createdAt || now).getTime()) / 60000);
        if (diff < 1) {
          setLastSyncTime("Just now");
        } else if (diff < 60) {
          setLastSyncTime(`${diff} minute${diff > 1 ? 's' : ''} ago`);
        } else {
          const hours = Math.floor(diff / 60);
          setLastSyncTime(`${hours} hour${hours > 1 ? 's' : ''} ago`);
        }
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [vendor]);

  const handleItemUsage = async () => {
    if (!itemInput.trim() || !vendor) {
      toast({
        title: "Error",
        description: "Please enter an item name",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatedItem = await StaticApiService.useItem(itemInput.trim(), 1);
      setItemInput("");
      
      toast({
        title: "Item Used",
        description: `Updated ${updatedItem.itemName}: ${updatedItem.quantity} ${updatedItem.unit} remaining`,
      });

      // Refresh data
      await syncData();
    } catch (error) {
      console.error('Item usage error:', error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    }
  };

  const handleSync = async () => {
    if (!vendor) return;
    
    setIsSyncing(true);
    try {
      await syncData();
      setLastSyncTime("Just now");
      toast({
        title: "FolderSync Complete",
        description: "All data synced successfully",
      });
    } catch (error) {
      toast({
        title: "FolderSync Failed",
        description: "Unable to sync data",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  if (vendorLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-skeleton w-16 h-16 rounded-full mx-auto mb-4"></div>
          <div className="loading-skeleton w-32 h-4 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50 border-b">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[--vendormate-primary] rounded-full flex items-center justify-center">
                <Store className="text-white text-lg" size={20} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">VendorMate</h1>
                <p className="text-sm text-gray-600">{vendor?.primaryLanguage || 'English'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'pulse-success bg-green-500' : 'bg-red-500'}`}></div>
              <Button variant="ghost" size="sm">
                <Settings className="text-gray-600" size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-4 space-y-4 pb-24">
        {/* Welcome Card */}
        <Card className="vendormate-card">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="text-2xl">👋</div>
              <h2 className="text-lg font-medium text-gray-800">Welcome to VendorMate</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-[--vendormate-primary-dark] text-white font-mono">
                {vendor?.vendorId || 'Loading...'}
              </Badge>
              <span className="text-sm text-gray-600">Your Vendor ID</span>
            </div>
          </CardContent>
        </Card>

        {/* Voice Input Card */}
        <Card className="vendormate-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-3">
              <Mic className="text-[--vendormate-secondary]" size={24} />
              <span>Voice Input / Item Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Input
                type="text"
                placeholder="Say or type item name (e.g., 'tomatoes', 'rice')"
                value={itemInput}
                onChange={(e) => setItemInput(e.target.value)}
                className="pr-10"
                onKeyDown={(e) => e.key === 'Enter' && handleItemUsage()}
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            </div>
            
            <div className="flex space-x-3">
              <Button 
                onClick={handleItemUsage}
                className="flex-1 vendormate-button-secondary"
              >
                <Minus className="mr-2" size={16} />
                Use Item
              </Button>
              <VoiceInput onResult={setItemInput} />
            </div>
          </CardContent>
        </Card>

        {/* Stock Levels Card */}
        <StockCard inventory={inventory} onRefresh={syncData} />

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <Card className="low-stock-alert slide-in">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-3 text-red-600">
                <AlertTriangle size={24} />
                <span>Low Stock Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lowStockItems.map((item) => (
                <div key={item.id} className="bg-white p-3 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Package className="text-red-500" size={16} />
                    <span className="font-medium text-gray-800 capitalize">{item.itemName}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-red-600 font-medium">
                      Only {item.quantity} {item.unit} left!
                    </span>
                    <Button size="sm" className="bg-[--vendormate-primary] hover:bg-[--vendormate-primary-dark] text-white">
                      Reorder
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Nearby Vendors */}
        <NearbyVendors vendorId={vendor?.vendorId} />

        {/* Group Chat */}
        <ChatComponent vendorId={vendor?.vendorId} />

        {/* Offline FolderSync Card */}
        <Card className="vendormate-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-3">
              <FolderSync className="text-gray-600" size={24} />
              <span>Offline FolderSync</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last synced:</span>
              <span className="text-sm font-medium text-green-600">{lastSyncTime}</span>
            </div>
            
            <Button 
              onClick={handleSync}
              disabled={isSyncing}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white"
            >
              {isSyncing ? (
                <RefreshCw className="mr-2 animate-spin" size={16} />
              ) : (
                <FolderSync className="mr-2" size={16} />
              )}
              {isSyncing ? 'Syncing...' : 'FolderSync Now'}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-green-600 flex items-center justify-center">
                <UserCheck className="mr-1" size={16} />
                All data synced successfully
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Language Preferences */}
        <LanguageSelector vendor={vendor || null} />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex justify-around">
            <button className="flex flex-col items-center py-2 px-3 text-[--vendormate-primary]">
              <HomeIcon size={20} />
              <span className="text-xs mt-1">Home</span>
            </button>
            <button className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-[--vendormate-primary] transition-colors">
              <Package size={20} />
              <span className="text-xs mt-1">Stock</span>
            </button>
            <button className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-[--vendormate-primary] transition-colors relative">
              <MessageCircle size={20} />
              <span className="text-xs mt-1">Chat</span>
              {lowStockItems.length > 0 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {lowStockItems.length}
                </div>
              )}
            </button>
            <button className="flex flex-col items-center py-2 px-3 text-gray-600 hover:text-[--vendormate-primary] transition-colors">
              <Users size={20} />
              <span className="text-xs mt-1">Profile</span>
            </button>
          </div>
        </div>
      </nav>
    </div>
  );
}
