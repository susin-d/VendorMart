import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { StaticApiService } from "@/lib/staticApi";
import type { MockChatMessage } from "@/lib/mockData";

export function useWebSocket(vendorId: string | undefined) {
  const [isConnected, setIsConnected] = useState(true); // Always connected in static mode
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch chat messages
  const { data: messages = [] } = useQuery<MockChatMessage[]>({
    queryKey: ['chat', 'messages'],
    queryFn: () => StaticApiService.getChatMessages(),
    refetchInterval: 5000, // Poll for new messages every 5 seconds
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (message: string) => StaticApiService.sendChatMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat', 'messages'] });
      toast({
        title: "Message Sent",
        description: "Your message has been sent to the community chat.",
      });
    },
    onError: () => {
      toast({
        title: "Send Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const sendMessage = (message: string) => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  // Simulate connection status
  useEffect(() => {
    setIsConnected(true);
  }, []);

  return {
    isConnected,
    messages,
    sendMessage,
  };
}
