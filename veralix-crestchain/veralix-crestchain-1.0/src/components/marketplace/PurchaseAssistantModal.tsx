import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Phone, 
  MapPin, 
  Store,
  Sparkles,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { generateWhatsAppLink } from '@/utils/whatsappHelper';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PurchaseAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  jewelryName: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  imageUrls?: string[] | null;
  jewelryType?: string;
  listingId: string;
  sellerName: string;
  sellerPhone: string;
  sellerCity?: string;
  sellerCountry?: string;
  sellerBusinessName?: string;
}

export const PurchaseAssistantModal = ({
  isOpen,
  onClose,
  jewelryName,
  price,
  currency,
  imageUrl,
  imageUrls,
  jewelryType,
  listingId,
  sellerName,
  sellerPhone,
  sellerCity,
  sellerCountry,
  sellerBusinessName,
}: PurchaseAssistantModalProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `¡Hola! 👋 Soy tu asistente de compras de Veralix. Te ayudaré con cualquier pregunta sobre "${jewelryName}". ¿En qué puedo ayudarte?`,
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleWhatsAppClick = () => {
      const whatsappUrl = generateWhatsAppLink(
        sellerPhone,
        sellerCountry
      );
    
    window.open(whatsappUrl, '_blank');
    toast.success('Abriendo WhatsApp...');
  };

  const streamChat = async (userMessage: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketplace-chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            messages: newMessages,
            jewelryName,
            price,
            currency,
            sellerName,
            jewelryType: jewelryType || 'joyería',
            jewelryImages: imageUrls || (imageUrl ? [imageUrl] : []),
            listingId,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error en el chat');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let textBuffer = '';

      // Agregar mensaje del asistente vacío que se irá llenando
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;

        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            
            if (content) {
              assistantMessage += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage,
                };
                return newMessages;
              });
            }
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enviar mensaje');
      
      // Remover el último mensaje del asistente si hubo error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    await streamChat(userMessage);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Asistente de Compra
          </DialogTitle>
          <DialogDescription>
            Te ayudamos a realizar tu compra de manera segura
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-1 gap-4 px-6 overflow-hidden">
          {/* Panel izquierdo - Info del producto y vendedor */}
          <Card className="w-1/3 p-4 space-y-4 overflow-y-auto">
            {/* Imagen del producto */}
            {imageUrl && (
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img 
                  src={imageUrl} 
                  alt={jewelryName}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Info del producto */}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg line-clamp-2">{jewelryName}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">
                  {currency} {price.toLocaleString()}
                </span>
              </div>
            </div>

            <Separator />

            {/* Info del vendedor */}
            <div className="space-y-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Store className="w-4 h-4" />
                Vendedor
              </h4>
              
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {(sellerBusinessName || sellerName).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{sellerBusinessName || sellerName}</p>
                  {sellerCity && sellerCountry && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {sellerCity}, {sellerCountry}
                    </p>
                  )}
                </div>
              </div>

              <Button 
                className="w-full gap-2" 
                onClick={handleWhatsAppClick}
                variant="default"
              >
                <Phone className="w-4 h-4" />
                Contactar por WhatsApp
              </Button>
            </div>

            <Separator />

            {/* Garantías */}
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Garantías Veralix</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <Badge variant="outline" className="w-full justify-start">
                  ✓ Certificado NFT Blockchain
                </Badge>
                <Badge variant="outline" className="w-full justify-start">
                  ✓ Autenticidad Verificada
                </Badge>
                <Badge variant="outline" className="w-full justify-start">
                  ✓ Compra Directa Segura
                </Badge>
              </div>
            </div>
          </Card>

          {/* Panel derecho - Chat */}
          <div className="flex-1 flex flex-col">
            <Card className="flex-1 flex flex-col overflow-hidden">
              {/* Mensajes */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          msg.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="flex items-center gap-2 mb-1">
                            <MessageCircle className="w-4 h-4 text-primary" />
                            <span className="text-xs font-semibold">Asistente Veralix</span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="border-t p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Escribe tu pregunta..."
                    disabled={isLoading}
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </Card>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2">
          <p className="text-xs text-muted-foreground text-center">
            💎 Las compras se realizan directamente con el vendedor por WhatsApp
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
