import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  vendorId: string;
  vendorName: string;
  message: string;
  originalLanguage: string;
  timestamp: string;
}

export function useWebSocket(vendorId: string | undefined) {
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!vendorId) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Register vendor with WebSocket server
      ws.send(JSON.stringify({
        type: 'register',
        vendorId: vendorId
      }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chat') {
          setMessages(prev => [...prev, {
            id: data.id,
            vendorId: data.vendorId,
            vendorName: data.vendorName,
            message: data.message,
            originalLanguage: data.originalLanguage,
            timestamp: data.timestamp
          }]);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      toast({
        title: "Connection Error",
        description: "Lost connection to chat server",
        variant: "destructive",
      });
    };

    return () => {
      ws.close();
    };
  }, [vendorId, toast]);

  const sendMessage = (message: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'chat',
        text: message
      }));
    } else {
      toast({
        title: "Connection Error",
        description: "Unable to send message. Please check your connection.",
        variant: "destructive",
      });
    }
  };

  return {
    isConnected,
    messages,
    sendMessage,
  };
}
