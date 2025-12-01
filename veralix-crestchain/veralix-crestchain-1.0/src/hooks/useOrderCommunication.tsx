import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface OrderMessage {
  id: string;
  order_id: string;
  sender_id: string;
  message: string;
  message_type: 'message' | 'status_update' | 'buyer_message' | 'seller_message';
  metadata: Record<string, any>;
  created_at: string;
  sender?: {
    full_name: string;
    email: string;
  };
}

export const useOrderCommunication = (orderId: string) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<OrderMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch messages
  const fetchMessages = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const { data: messagesData, error: messagesError } = await supabase
        .from('order_communications')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      // Fetch sender profiles
      const messagesWithProfiles = await Promise.all(
        (messagesData || []).map(async (msg) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', msg.sender_id)
            .maybeSingle();

          return {
            ...msg,
            message_type: msg.message_type as OrderMessage['message_type'],
            metadata: (msg.metadata || {}) as Record<string, any>,
            sender: profile || { full_name: 'Usuario', email: '' }
          };
        })
      );

      setMessages(messagesWithProfiles as OrderMessage[]);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Error al cargar los mensajes');
      toast.error('Error al cargar los mensajes');
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const sendMessage = async (message: string, messageType: OrderMessage['message_type'] = 'message') => {
    if (!user || !orderId || !message.trim()) {
      toast.error('No se puede enviar el mensaje');
      return { success: false, error: 'Datos inválidos' };
    }

    try {
      const { data, error: insertError } = await supabase
        .from('order_communications')
        .insert({
          order_id: orderId,
          sender_id: user.id,
          message: message.trim(),
          message_type: messageType,
          metadata: {}
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Fetch sender profile for the new message
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, email')
        .eq('user_id', user.id)
        .maybeSingle();

      const newMessage: OrderMessage = {
        ...data,
        message_type: data.message_type as OrderMessage['message_type'],
        metadata: (data.metadata || {}) as Record<string, any>,
        sender: profile || { full_name: 'Usuario', email: '' }
      };

      // Update local state
      setMessages(prev => [...prev, newMessage]);

      // Create notification for the other party
      const { data: order } = await supabase
        .from('orders')
        .select('buyer_id, seller_id, order_number')
        .eq('id', orderId)
        .single();

      if (order) {
        const recipientId = user.id === order.buyer_id ? order.seller_id : order.buyer_id;
        const isBuyer = user.id === order.buyer_id;
        
        await supabase
          .from('notifications')
          .insert({
            user_id: recipientId,
            type: 'order_message',
            title: `Nuevo mensaje - Orden ${order.order_number}`,
            message: message.substring(0, 100),
            action_url: isBuyer ? `/my-marketplace?tab=sales` : `/my-marketplace?tab=purchases`,
            data: { 
              order_id: orderId, 
              order_number: order.order_number,
              message_preview: message.substring(0, 50) 
            }
          });

        // Send email notification
        try {
          const { data: recipientProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', recipientId)
            .single();

          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', user.id)
            .single();

          if (recipientProfile?.email) {
            await supabase.functions.invoke('send-email', {
              body: {
                type: 'order_message',
                to: recipientProfile.email,
                data: {
                  orderNumber: order.order_number,
                  senderName: senderProfile?.full_name || 'Usuario',
                  senderRole: isBuyer ? 'buyer' : 'seller',
                  recipientName: recipientProfile.full_name || 'Usuario',
                  message: message,
                  messagePreview: message.substring(0, 100),
                  orderUrl: `${window.location.origin}${isBuyer ? '/my-marketplace?tab=sales' : '/my-marketplace?tab=purchases'}`
                }
              }
            });
          }
        } catch (emailError) {
          console.error('Error sending order message email:', emailError);
        }
      }

      toast.success('Mensaje enviado');
      return { success: true, data: newMessage };
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('Error al enviar el mensaje');
      return { success: false, error: err };
    }
  };

  // Subscribe to realtime updates
  useEffect(() => {
    if (!orderId) return;

    fetchMessages();

    // Set up realtime subscription
    const channel = supabase
      .channel(`order_communications:${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_communications',
          filter: `order_id=eq.${orderId}`
        },
        async (payload) => {
          console.log('New message received:', payload);
          
          // Fetch sender profile for the new message
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', payload.new.sender_id)
            .maybeSingle();

          const newMessage: OrderMessage = {
            ...payload.new,
            message_type: payload.new.message_type as OrderMessage['message_type'],
            metadata: (payload.new.metadata || {}) as Record<string, any>,
            sender: profile || { full_name: 'Usuario', email: '' }
          } as OrderMessage;

          // Only add if not already in the list (avoid duplicates)
          setMessages(prev => {
            const exists = prev.some(msg => msg.id === newMessage.id);
            if (exists) return prev;
            return [...prev, newMessage];
          });

          // Show toast if message is from someone else
          if (user && payload.new.sender_id !== user.id) {
            toast.info('Nuevo mensaje recibido');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId, user]);

  const groupMessagesByDate = () => {
    const grouped: Record<string, OrderMessage[]> = {};

    messages.forEach(msg => {
      const date = new Date(msg.created_at).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });

    return grouped;
  };

  return {
    messages,
    loading,
    error,
    sendMessage,
    fetchMessages,
    groupMessagesByDate
  };
};
