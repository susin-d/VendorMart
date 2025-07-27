import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Users } from "lucide-react";
import { useWebSocket } from "@/hooks/use-websocket";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

interface ChatComponentProps {
  vendorId: string | undefined;
}

export default function ChatComponent({ vendorId }: ChatComponentProps) {
  const [messageInput, setMessageInput] = useState("");
  const { isConnected, messages, sendMessage } = useWebSocket(vendorId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch initial chat messages
  const { data: initialMessages = [] } = useQuery<any[]>({
    queryKey: ['/api/chat/messages'],
    enabled: !!vendorId,
  });

  // Combine initial messages with real-time messages
  const allMessages = [...initialMessages, ...messages];

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSendMessage = () => {
    if (!messageInput.trim() || !isConnected) return;
    
    sendMessage(messageInput.trim());
    setMessageInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="vendormate-card">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <MessageCircle className="text-[--vendormate-primary]" size={24} />
            <span>Vendor Group Chat</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'pulse-success bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-gray-600">{isConnected ? 'Live' : 'Offline'}</span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-3 h-48 overflow-y-auto space-y-3">
          {allMessages.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs">Start chatting with other vendors!</p>
            </div>
          ) : (
            allMessages.map((msg, index) => {
              const isOwnMessage = msg.vendorId === vendorId;
              const timestamp = new Date(msg.timestamp);
              
              return (
                <div 
                  key={msg.id || index} 
                  className={`chat-message flex items-start space-x-2  ${
                    isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                    isOwnMessage ? 'bg-[--vendormate-primary]' : 'bg-[--vendormate-accent]'
                  }`}>
                    {isOwnMessage ? 'YOU' : msg.vendorId?.slice(-2) || 'VM'}
                  </div>
                  <div className="flex-1">
                    <div className={`p-2 rounded-lg shadow-sm ${
                      isOwnMessage 
                        ? 'bg-[--vendormate-primary] text-white' 
                        : 'bg-white text-gray-800'
                    }`}>
                      <p className="text-sm">{msg.message}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className={`text-xs ${
                          isOwnMessage ? 'text-blue-200' : 'text-gray-500'
                        }`}>
                          {isOwnMessage ? 'Just now' : `${msg.vendorName || msg.vendorId} • ${format(timestamp, 'HH:mm')}`}
                        </p>
                        {msg.originalLanguage && msg.originalLanguage !== 'en' && (
                          <Badge variant="secondary" className="text-xs">
                            {msg.originalLanguage.toUpperCase()}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex space-x-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={!isConnected}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={!messageInput.trim() || !isConnected}
            className="vendormate-button-primary"
          >
            <Send size={16} />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
