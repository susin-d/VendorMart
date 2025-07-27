import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { StaticApiService } from "@/lib/staticApi";
import type { MockVendor } from "@/lib/mockData";

interface NearbyVendorsProps {
  vendorId: string | undefined;
}

export default function NearbyVendors({ vendorId }: NearbyVendorsProps) {
  const { toast } = useToast();
  
  const { data: nearbyVendors = [], isLoading, refetch } = useQuery<MockVendor[]>({
    queryKey: ['nearby-vendors'],
    queryFn: () => StaticApiService.getNearbyVendors(),
  });

  const handleConnect = async (targetVendor: MockVendor) => {
    try {
      toast({
        title: "Connection Request Sent",
        description: `Sent connection request to ${targetVendor.name}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to send connection request",
        variant: "destructive",
      });
    }
  };

  const handleFindVendors = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // In a real app, you'd update the vendor's location and refetch
          toast({
            title: "Location Updated",
            description: "Searching for nearby vendors...",
          });
          refetch();
        },
        (error) => {
          toast({
            title: "Location Error",
            description: "Unable to access location. Showing all active vendors.",
            variant: "destructive",
          });
          refetch();
        }
      );
    } else {
      toast({
        title: "Location Not Supported",
        description: "Geolocation is not supported by this browser",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="vendormate-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-3">
          <Users className="text-[--vendormate-accent]" size={24} />
          <span>Nearby Vendor Connect</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleFindVendors}
          className="w-full vendormate-button-accent"
          disabled={isLoading}
        >
          <MapPin className="mr-2" size={16} />
          {isLoading ? 'Searching...' : 'Find Nearby Vendors'}
        </Button>
        
        <div className="space-y-3">
          {nearbyVendors.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No nearby vendors found</p>
              <p className="text-xs">Try searching again or check your location settings</p>
            </div>
          ) : (
            nearbyVendors.map((vendor: MockVendor) => (
              <div key={vendor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[--vendormate-primary] rounded-full flex items-center justify-center text-white font-medium">
                    {vendor.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{vendor.name}</p>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <span>0.3 km away</span>
                      <span>•</span>
                      <Badge variant="secondary" className="text-xs">
                        {vendor.vendorId}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button 
                  size="sm"
                  onClick={() => handleConnect(vendor)}
                  className="vendormate-button-secondary"
                >
                  <UserPlus className="mr-1" size={14} />
                  Connect
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
