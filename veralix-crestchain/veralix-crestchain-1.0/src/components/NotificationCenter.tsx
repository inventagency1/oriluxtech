import { useState } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { VeralixLogo } from "@/components/ui/veralix-logo";
import {
  Bell,
  Check,
  CheckCheck,
  Package,
  CreditCard,
  FileText,
  Gift,
  MessageSquare,
  AlertCircle,
  Trash2,
  ExternalLink,
  BellOff
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order_new':
      return Package;
    case 'order_update':
      return Package;
    case 'payment_received':
      return CreditCard;
    case 'certificate_transfer':
      return FileText;
    case 'airdrop':
      return Gift;
    case 'message':
      return MessageSquare;
    case 'system':
    default:
      return AlertCircle;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'order_new':
      return 'text-primary';
    case 'payment_received':
      return 'text-green-600';
    case 'certificate_transfer':
      return 'text-blue-600';
    case 'airdrop':
      return 'text-gold';
    case 'message':
      return 'text-purple-600';
    case 'order_update':
    case 'system':
    default:
      return 'text-muted-foreground';
  }
};

export const NotificationCenter = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-muted-foreground mt-2">Cargando notificaciones...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[500px]">
      {/* Header mejorado con logo */}
      <div className="p-4 border-b bg-gradient-to-r from-gold/5 to-transparent">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <VeralixLogo size={32} />
            <div>
              <h3 className="font-semibold text-lg font-heading">Notificaciones</h3>
              <p className="text-xs text-muted-foreground">Veralix</p>
            </div>
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2">
                {unreadCount}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="flex space-x-2">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="flex-1"
          >
            Todas
          </Button>
          <Button
            variant={filter === 'unread' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('unread')}
            className="flex-1"
          >
            No leídas {unreadCount > 0 && `(${unreadCount})`}
          </Button>
        </div>
      </div>

      {/* Actions */}
      {unreadCount > 0 && (
        <div className="px-4 py-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="w-full justify-start text-xs"
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como leídas
          </Button>
        </div>
      )}

      {/* Notifications List */}
      <ScrollArea className="flex-1">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <VeralixLogo size={48} className="opacity-20" />
                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1">
                  <BellOff className="h-6 w-6 text-muted-foreground/50" />
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm mb-1">
                  {filter === 'unread' ? 'Todo al día' : 'Sin notificaciones'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {filter === 'unread' 
                    ? 'No tienes notificaciones sin leer' 
                    : 'No tienes notificaciones aún'
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="divide-y">
            {filteredNotifications.map((notification) => {
              const Icon = getNotificationIcon(notification.type);
              const iconColor = getNotificationColor(notification.type);
              
              return (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-muted/50 transition-colors relative group",
                    !notification.read && "bg-gradient-to-r from-gold/5 to-transparent border-l-2 border-gold"
                  )}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className={cn("mt-1 p-2 rounded-full bg-background shadow-sm", iconColor)}>
                      <Icon className="h-4 w-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <p className="text-sm font-medium mb-1">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => markAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mb-2">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                            locale: es
                          })}
                        </span>

                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {notification.action_url && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              asChild
                            >
                              <Link to={notification.action_url}>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-destructive"
                            onClick={() => deleteNotification(notification.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};