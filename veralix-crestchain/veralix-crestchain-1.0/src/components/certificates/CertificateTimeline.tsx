import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, Upload, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface TimelineEvent {
  type: 'created' | 'verified' | 'transferred';
  date: string;
  description: string;
}

interface CertificateTimelineProps {
  createdAt: string;
  verificationDate: string | null;
  lastTransfer: string | null;
  isVerified: boolean;
  className?: string;
}

export const CertificateTimeline = ({
  createdAt,
  verificationDate,
  lastTransfer,
  isVerified,
  className
}: CertificateTimelineProps) => {
  const events: TimelineEvent[] = [
    {
      type: 'created',
      date: createdAt,
      description: 'Certificado creado'
    }
  ];

  if (isVerified && verificationDate) {
    events.push({
      type: 'verified',
      date: verificationDate,
      description: 'Certificado verificado en blockchain'
    });
  }

  if (lastTransfer) {
    events.push({
      type: 'transferred',
      date: lastTransfer,
      description: 'Última transferencia'
    });
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return Upload;
      case 'verified':
        return CheckCircle;
      case 'transferred':
        return RefreshCw;
    }
  };

  const getColor = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'created':
        return 'text-blue-600 bg-blue-500/10';
      case 'verified':
        return 'text-primary bg-primary/10';
      case 'transferred':
        return 'text-purple-600 bg-purple-500/10';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {events.map((event, index) => {
        const Icon = getIcon(event.type);
        const color = getColor(event.type);
        
        return (
          <div key={index} className="relative">
            {index < events.length - 1 && (
              <div className="absolute left-4 top-10 bottom-0 w-0.5 bg-gradient-to-b from-primary/50 to-transparent" />
            )}
            
            <div className="flex items-start space-x-3">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center ring-4 ring-background", color)}>
                <Icon className="w-4 h-4" />
              </div>
              
              <div className="flex-1">
                <p className="font-medium text-sm">{event.description}</p>
                <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(event.date)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
