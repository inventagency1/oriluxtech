import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useOrderCommunication, OrderMessage } from "@/hooks/useOrderCommunication";
import { MessageCircle, Send, Info, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface OrderChatPanelProps {
  orderId: string;
  orderNumber: string;
  otherPartyName?: string;
  className?: string;
}

export const OrderChatPanel = ({ 
  orderId, 
  orderNumber, 
  otherPartyName = "Usuario",
  className 
}: OrderChatPanelProps) => {
  const { user } = useAuth();
  const { messages, loading, sendMessage, groupMessagesByDate } = useOrderCommunication(orderId);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || sending) return;

    setSending(true);
    try {
      const result = await sendMessage(messageText, 'message');
      if (result.success) {
        setMessageText("");
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getMessageTypeIcon = (type: OrderMessage['message_type']) => {
    switch (type) {
      case 'status_update':
        return <Info className="w-3 h-3" />;
      default:
        return <MessageCircle className="w-3 h-3" />;
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const groupedMessages = groupMessagesByDate();

  if (loading && messages.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="w-5 h-5" />
              <span>Chat de la Orden</span>
            </CardTitle>
            <CardDescription>
              Orden {orderNumber} • Conversando con {otherPartyName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[500px]">
        {Object.keys(groupedMessages).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay mensajes</h3>
            <p className="text-sm text-muted-foreground">
              Inicia la conversación enviando un mensaje
            </p>
          </div>
        ) : (
          Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date} className="space-y-3">
              {/* Date Separator */}
              <div className="flex items-center justify-center">
                <Badge variant="secondary" className="text-xs">
                  {date}
                </Badge>
              </div>

              {/* Messages */}
              {dateMessages.map((msg) => {
                const isOwnMessage = msg.sender_id === user?.id;
                const isSystemMessage = msg.message_type === 'status_update';

                if (isSystemMessage) {
                  return (
                    <div key={msg.id} className="flex items-center justify-center">
                      <Badge variant="outline" className="text-xs flex items-center space-x-1">
                        {getMessageTypeIcon(msg.message_type)}
                        <span>{msg.message}</span>
                      </Badge>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end space-x-2",
                      isOwnMessage ? "justify-end" : "justify-start"
                    )}
                  >
                    {!isOwnMessage && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary/10">
                          {msg.sender?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                    )}

                    <div
                      className={cn(
                        "max-w-[70%] rounded-lg px-4 py-2",
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      )}
                    >
                      {!isOwnMessage && (
                        <p className="text-xs font-medium mb-1">
                          {msg.sender?.full_name || 'Usuario'}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {msg.message}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-1",
                          isOwnMessage
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        )}
                      >
                        {formatTime(msg.created_at)}
                      </p>
                    </div>

                    {isOwnMessage && (
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {msg.sender?.full_name?.charAt(0) || <User className="w-4 h-4" />}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex items-end space-x-2">
          <Textarea
            placeholder="Escribe un mensaje..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={2}
            className="flex-1 resize-none"
            disabled={sending}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!messageText.trim() || sending}
            size="icon"
            className="h-10 w-10"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Presiona Enter para enviar, Shift + Enter para nueva línea
        </p>
      </div>
    </Card>
  );
};
