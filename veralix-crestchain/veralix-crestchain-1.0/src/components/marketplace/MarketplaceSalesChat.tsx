import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Bot, User, MessageCircle, X, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MarketplaceSalesChatProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const SESSION_KEY = "veralix_marketplace_chat_visited";
const CHAT_HISTORY_KEY = "veralix_marketplace_chat_history";

export function MarketplaceSalesChat({ isOpen, onOpenChange }: MarketplaceSalesChatProps) {
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_KEY);
      if (savedHistory) {
        try {
          const parsed = JSON.parse(savedHistory);
          setMessages(parsed);
        } catch (e) {
          console.error("Error loading chat history:", e);
          initializeWelcome();
        }
      } else {
        initializeWelcome();
      }
    }
  }, [isOpen]);
  
  const initializeWelcome = () => {
    const welcomeMsg: Message = {
      role: "assistant",
      content: "¡Bienvenido al Marketplace de Veralix! 💎\n\nSoy tu asistente de ventas personal. Estoy aquí para ayudarte a:\n\n✨ Encontrar la joya perfecta\n💰 Responder preguntas sobre precios y características\n🔒 Explicarte sobre nuestros certificados NFT blockchain\n📱 Guiarte en el proceso de compra por WhatsApp\n\n¿En qué puedo ayudarte hoy?"
    };
    setMessages([welcomeMsg]);
  };
  
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketplace-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            jewelryName: "Catálogo General",
            price: 0,
            currency: "COP",
            sellerName: "Veralix Marketplace",
            jewelryType: "general",
            jewelryImages: [],
            listingId: "general",
          }),
        }
      );

      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Límite de solicitudes",
            description: "Has alcanzado el límite de solicitudes. Intenta de nuevo en unos momentos.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Servicio temporalmente no disponible",
            description: "El servicio de chat está temporalmente no disponible.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
        throw new Error("Error en el servicio de chat");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No se pudo iniciar el stream");

      const decoder = new TextDecoder();
      let assistantContent = "";
      let assistantMessageAdded = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                assistantContent += content;

                if (!assistantMessageAdded) {
                  setMessages(prev => [
                    ...prev,
                    { role: "assistant", content: assistantContent },
                  ]);
                  assistantMessageAdded = true;
                } else {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1] = {
                      role: "assistant",
                      content: assistantContent,
                    };
                    return newMessages;
                  });
                }
              }
            } catch (e) {
              console.error("Error parsing SSE:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in chat:", error);
      toast({
        title: "Error",
        description: "Hubo un error al procesar tu mensaje. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:w-[400px] p-0 flex flex-col"
      >
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-10 w-10 bg-primary">
                <div className="flex items-center justify-center h-full">
                  <MessageCircle className="h-5 w-5 text-primary-foreground" />
                </div>
              </Avatar>
              <div>
                <SheetTitle className="text-left">Asistente de Ventas</SheetTitle>
                <p className="text-xs text-muted-foreground">Siempre disponible para ayudarte</p>
              </div>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              IA
            </Badge>
          </div>
        </SheetHeader>

        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message, i) => (
              <div
                key={i}
                className={`flex gap-3 ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 bg-primary/10 flex-shrink-0">
                    <div className="flex items-center justify-center h-full">
                      <Bot className="h-4 w-4 text-primary" />
                    </div>
                  </Avatar>
                )}
                
                <div
                  className={`rounded-lg px-4 py-2 max-w-[85%] ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8 bg-accent/10 flex-shrink-0">
                    <div className="flex items-center justify-center h-full">
                      <User className="h-4 w-4 text-accent" />
                    </div>
                  </Avatar>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-primary/10">
                  <div className="flex items-center justify-center h-full">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Powered by Veralix AI
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function MarketplaceSalesChatButton({ 
  onClick,
  hasNewBadge = false 
}: { 
  onClick: () => void;
  hasNewBadge?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform bg-primary hover:bg-primary/90"
      size="icon"
    >
      <div className="relative">
        <MessageCircle className="h-6 w-6" />
        <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-accent animate-pulse" />
        {hasNewBadge && (
          <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full bg-destructive border-2 border-background" />
        )}
      </div>
    </Button>
  );
}
