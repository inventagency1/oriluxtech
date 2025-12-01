import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { EmailHeader } from "../_components/EmailHeader.tsx";
import { EmailFooter } from "../_components/EmailFooter.tsx";

interface OrderStatusUpdateEmailProps {
  orderNumber: string;
  newStatus: string;
  previousStatus?: string;
  orderId: string;
  jewelryName?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export const OrderStatusUpdateEmail = ({
  orderNumber,
  newStatus,
  previousStatus,
  orderId,
  jewelryName,
  logoUrl = "https://veralix.io/veralix-logo-email.png",
  websiteUrl = "https://veralix.io",
}: OrderStatusUpdateEmailProps) => {
  const getStatusInfo = (status: string) => {
    const statusMap: Record<string, { label: string; icon: string; color: string; message: string }> = {
      pending: {
        label: 'Pendiente',
        icon: '⏳',
        color: '#f59e0b',
        message: 'Tu orden está siendo procesada.',
      },
      confirmed: {
        label: 'Confirmada',
        icon: '✅',
        color: '#C9A961',
        message: 'Tu orden ha sido confirmada y será procesada pronto.',
      },
      processing: {
        label: 'En proceso',
        icon: '🔄',
        color: '#C9A961',
        message: 'Tu orden está siendo preparada para envío.',
      },
      shipped: {
        label: 'Enviada',
        icon: '📦',
        color: '#C9A961',
        message: 'Tu orden ha sido enviada y está en camino.',
      },
      delivered: {
        label: 'Entregada',
        icon: '🎉',
        color: '#16a34a',
        message: '¡Tu orden ha sido entregada exitosamente!',
      },
      cancelled: {
        label: 'Cancelada',
        icon: '❌',
        color: '#ef4444',
        message: 'Tu orden ha sido cancelada.',
      },
    };
    return statusMap[status] || statusMap.pending;
  };

  const currentStatusInfo = getStatusInfo(newStatus);

  return (
    <Html>
      <Head />
      <Preview>Actualización de orden #{orderNumber} - {currentStatusInfo.label}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title={`${currentStatusInfo.icon} Orden Actualizada`} logoUrl={logoUrl} />
          
          <Text style={text}>
            Tu orden <strong>#{orderNumber}</strong> ha cambiado de estado.
          </Text>

          {jewelryName && (
            <Text style={productText}>{jewelryName}</Text>
          )}

          <Section style={statusBox}>
            {previousStatus && (
              <div>
                <Text style={statusLabel}>Estado anterior:</Text>
                <Text style={statusValue}>{getStatusInfo(previousStatus).label}</Text>
                <Text style={arrow}>↓</Text>
              </div>
            )}
            
            <Text style={statusLabel}>Nuevo estado:</Text>
            <Text style={{...statusValue, color: currentStatusInfo.color}}>
              {currentStatusInfo.icon} {currentStatusInfo.label}
            </Text>
            
            <Text style={statusMessage}>{currentStatusInfo.message}</Text>
          </Section>

          <Section style={timelineSection}>
            <Text style={timelineTitle}>Próximos pasos:</Text>
            {newStatus === 'confirmed' && (
              <Text style={timelineText}>
                • El vendedor preparará tu orden<br />
                • Recibirás una notificación cuando sea enviada
              </Text>
            )}
            {newStatus === 'processing' && (
              <Text style={timelineText}>
                • Tu orden está siendo empacada<br />
                • Pronto será enviada a tu dirección
              </Text>
            )}
            {newStatus === 'shipped' && (
              <Text style={timelineText}>
                • Tu orden está en camino<br />
                • Recibirás una notificación al ser entregada
              </Text>
            )}
            {newStatus === 'delivered' && (
              <Text style={timelineText}>
                • Por favor confirma la recepción<br />
                • Puedes dejar una reseña del vendedor
              </Text>
            )}
          </Section>

          <Section style={buttonContainer}>
            <Link
              href={`${websiteUrl}/orders/${orderId}`}
              style={button}
            >
              Ver detalles de la orden
            </Link>
          </Section>

          <EmailFooter websiteUrl={websiteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export default OrderStatusUpdateEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  marginBottom: '16px',
};

const productText = {
  color: '#1A1A1A',
  fontSize: '18px',
  fontWeight: '600',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const statusBox = {
  backgroundColor: '#FFF9E6',
  border: '2px solid #C9A961',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px auto',
  textAlign: 'center' as const,
};

const statusLabel = {
  color: '#8B8B8B',
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '8px',
};

const statusValue = {
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '8px 0',
};

const arrow = {
  fontSize: '32px',
  color: '#C9A961',
  margin: '16px 0',
};

const statusMessage = {
  color: '#525252',
  fontSize: '16px',
  marginTop: '16px',
};

const timelineSection = {
  margin: '24px',
};

const timelineTitle = {
  color: '#1A1A1A',
  fontSize: '18px',
  fontWeight: '600',
  marginBottom: '12px',
};

const timelineText = {
  color: '#525252',
  fontSize: '15px',
  lineHeight: '24px',
  marginLeft: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#C9A961',
  borderRadius: '8px',
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};
