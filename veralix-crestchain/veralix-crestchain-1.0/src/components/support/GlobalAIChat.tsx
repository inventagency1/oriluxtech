import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Send, Loader2, Bot, User, AlertCircle, MessageCircle, ShoppingBag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface GlobalAIChatProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const RATE_LIMIT = 20;
const SESSION_KEY = "veralix_ai_chat_session";

export function GlobalAIChat({ isOpen, onOpenChange }: GlobalAIChatProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  
  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(SESSION_KEY);
      if (saved) {
        try {
          const { messages: savedMessages, count } = JSON.parse(saved);
          setMessages(savedMessages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          })));
          setMessageCount(count);
        } catch (e) {
          console.error("Error loading session:", e);
          initializeWelcome();
        }
      } else {
        initializeWelcome();
      }
    }
  }, [isOpen, location.pathname]);
  
  const initializeWelcome = () => {
    const welcomeMsg = getWelcomeMessage(location.pathname);
    setMessages([{
      role: "assistant",
      content: welcomeMsg,
      timestamp: new Date()
    }]);
    setMessageCount(0);
  };
  
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(SESSION_KEY, JSON.stringify({
        messages,
        count: messageCount
      }));
    }
  }, [messages, messageCount]);
  
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
  
  function getWelcomeMessage(path: string): string {
    const contextMap: Record<string, string> = {
      '/marketplace': '¡Hola! 👋 Veo que estás explorando el Marketplace. ¿Te ayudo a encontrar joyas certificadas o tienes preguntas sobre cómo comprar?',
      '/certificates': '¡Hola! 👋 Estás en la sección de Certificados. ¿Necesitas ayuda para crear un certificado NFT o verificar uno existente?',
      '/pricing': '¡Hola! 👋 Veo que estás viendo los Precios. ¿Tienes preguntas sobre nuestros paquetes de certificación?',
      '/verify': '¡Hola! 👋 ¿Necesitas ayuda para verificar la autenticidad de una joya?',
      '/dashboard': '¡Hola! 👋 Estás en tu Dashboard. ¿Necesitas ayuda con tus certificados o ventas?',
      '/': '¡Hola! 👋 Soy el asistente de Veralix. ¿En qué puedo ayudarte hoy? Puedo responder sobre certificación NFT, marketplace, precios y más.'
    };
    
    return contextMap[path] || contextMap['/'];
  }
  
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    if (messageCount >= RATE_LIMIT) {
      toast({
        title: "Límite alcanzado",
        description: `Has alcanzado el límite de ${RATE_LIMIT} mensajes. Por favor contacta soporte@veralix.io para más ayuda.`,
        variant: "destructive"
      });
      return;
    }
    
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setMessageCount(prev => prev + 1);
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-support-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            }))
          }),
        }
      );
      
      if (!response.ok) {
        if (response.status === 429) {
          toast({
            title: "Límite de consultas",
            description: "Demasiadas consultas al AI. Intenta en unos minutos.",
            variant: "destructive",
          });
          return;
        }
        if (response.status === 402) {
          toast({
            title: "Servicio no disponible",
            description: "El servicio está temporalmente no disponible. Contacta soporte@veralix.io",
            variant: "destructive",
          });
          return;
        }
        throw new Error(`Error ${response.status}`);
      }
      
      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";
      
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "",
        timestamp: new Date()
      }]);
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });
        
        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === "assistant") {
                  lastMsg.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch (e) {
            console.error("Parse error:", e);
          }
        }
      }
      
    } catch (error) {
      console.error("Chat error:", error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje. Intenta de nuevo.",
        variant: "destructive"
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[440px] p-0 flex flex-col">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 bg-primary/20">
              <Bot className="h-6 w-6 text-primary" />
            </Avatar>
            <div className="flex-1">
              <SheetTitle className="text-lg">Asistente Veralix</SheetTitle>
              <SheetDescription className="text-xs">
                Powered by AI • {RATE_LIMIT - messageCount} mensajes restantes
              </SheetDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Beta
            </Badge>
          </div>
        </SheetHeader>
        
        <ScrollArea ref={scrollRef} className="flex-1 p-6">
          <div className="space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <Avatar className="h-8 w-8 bg-primary/20 shrink-0">
                    <Bot className="h-5 w-5 text-primary" />
                  </Avatar>
                )}
                
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <div
                    className={`rounded-2xl px-4 py-3 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">
                      {msg.content.replace('[ABRIR_CHAT_VENTAS]', '')}
                    </p>
                    <span className="text-xs opacity-60 mt-1 block">
                      {msg.timestamp.toLocaleTimeString('es-CO', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  {msg.role === "assistant" && msg.content.includes('[ABRIR_CHAT_VENTAS]') && (
                    <Button
                      onClick={() => {
                        navigate('/marketplace');
                        onOpenChange(false);
                        setTimeout(() => {
                          const event = new CustomEvent('open-marketplace-chat');
                          window.dispatchEvent(event);
                        }, 500);
                      }}
                      className="gap-2 w-full"
                      variant="outline"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Abrir Chat de Ventas
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                {msg.role === "user" && (
                  <Avatar className="h-8 w-8 bg-secondary/20 shrink-0">
                    <User className="h-5 w-5 text-secondary-foreground" />
                  </Avatar>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <Avatar className="h-8 w-8 bg-primary/20">
                  <Bot className="h-5 w-5 text-primary" />
                </Avatar>
                <div className="bg-muted rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="p-6 pt-4 border-t border-border">
          {messageCount >= RATE_LIMIT && (
            <div className="flex items-center gap-2 mb-3 p-3 bg-destructive/10 rounded-lg text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Límite alcanzado. Contacta soporte@veralix.io</span>
            </div>
          )}
          
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
              disabled={isLoading || messageCount >= RATE_LIMIT}
              className="flex-1"
              maxLength={500}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || isLoading || messageCount >= RATE_LIMIT}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          
          <p className="text-xs text-muted-foreground mt-3 text-center">
            El AI puede cometer errores. Verifica información importante.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
