import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { EmailHeader } from "../_components/EmailHeader.tsx";
import { EmailFooter } from "../_components/EmailFooter.tsx";

interface PaymentConfirmationEmailProps {
  orderNumber: string;
  amount: number;
  currency: string;
  paymentReference?: string;
  paymentMethod?: string;
  orderId?: string;
  buyerName?: string;
  logoUrl?: string;
  websiteUrl?: string;
  supportEmail?: string;
}

export const PaymentConfirmationEmail = ({
  orderNumber,
  amount,
  currency,
  paymentReference,
  paymentMethod,
  orderId,
  buyerName,
  logoUrl = "https://veralix.io/veralix-logo-email.png",
  websiteUrl = "https://veralix.io",
  supportEmail = "support@veralix.io",
}: PaymentConfirmationEmailProps) => {
  const formatPrice = (price: number, curr: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: curr === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Html>
      <Head />
      <Preview>Pago confirmado - Orden #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="✅ Pago Confirmado" logoUrl={logoUrl} />
          
          {buyerName && (
            <Text style={greeting}>Hola {buyerName},</Text>
          )}
          
          <Text style={text}>
            Tu pago ha sido procesado exitosamente. Gracias por tu compra.
          </Text>

          <Section style={paymentBox}>
            <div style={successBadge}>
              <Text style={successIcon}>✓</Text>
              <Text style={successText}>Pago exitoso</Text>
            </div>

            <Hr style={divider} />

            <div style={paymentDetails}>
              <div style={detailRow}>
                <Text style={detailLabel}>Orden:</Text>
                <Text style={detailValue}>#{orderNumber}</Text>
              </div>

              <div style={detailRow}>
                <Text style={detailLabel}>Monto pagado:</Text>
                <Text style={detailValueLarge}>{formatPrice(amount, currency)}</Text>
              </div>

              {paymentMethod && (
                <div style={detailRow}>
                  <Text style={detailLabel}>Método de pago:</Text>
                  <Text style={detailValue}>
                    {paymentMethod === 'bold' ? 'Bold PSE/Tarjeta' : paymentMethod}
                  </Text>
                </div>
              )}

              {paymentReference && (
                <div style={detailRow}>
                  <Text style={detailLabel}>Referencia:</Text>
                  <Text style={detailValue}>{paymentReference}</Text>
                </div>
              )}

              <div style={detailRow}>
                <Text style={detailLabel}>Fecha:</Text>
                <Text style={detailValue}>
                  {new Date().toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </div>
            </div>
          </Section>

          <Section style={nextStepsBox}>
            <Text style={nextStepsTitle}>📦 Próximos pasos:</Text>
            <Text style={nextStepsText}>
              • El vendedor ha sido notificado de tu pago<br />
              • Tu orden será preparada para envío<br />
              • Recibirás actualizaciones del estado de tu orden<br />
              • Puedes revisar el progreso en cualquier momento
            </Text>
          </Section>

          {orderId && (
            <Section style={buttonContainer}>
              <Link
                href={`${websiteUrl}/orders/${orderId}`}
                style={button}
              >
                Ver mi orden
              </Link>
            </Section>
          )}

          <Text style={supportText}>
            Si tienes alguna pregunta sobre tu pago, contáctanos a{' '}
            <Link href={`mailto:${supportEmail}`} style={link}>
              {supportEmail}
            </Link>
          </Text>

          <EmailFooter websiteUrl={websiteUrl} supportEmail={supportEmail} />
        </Container>
      </Body>
    </Html>
  );
};

export default PaymentConfirmationEmail;

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

const greeting = {
  color: '#1A1A1A',
  fontSize: '18px',
  textAlign: 'center' as const,
  marginBottom: '8px',
};

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  marginBottom: '32px',
};

const paymentBox = {
  backgroundColor: '#FFF9E6',
  border: '2px solid #C9A961',
  borderRadius: '12px',
  padding: '32px',
  margin: '24px auto',
};

const successBadge = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const successIcon = {
  display: 'inline-block',
  backgroundColor: '#C9A961',
  color: '#1A1A1A',
  fontSize: '32px',
  fontWeight: 'bold',
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  lineHeight: '64px',
  margin: '0 auto 16px',
};

const successText = {
  color: '#1A1A1A',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const divider = {
  borderColor: '#C9A961',
  margin: '24px 0',
};

const paymentDetails = {
  margin: '0',
};

const detailRow = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '16px',
};

const detailLabel = {
  color: '#8B8B8B',
  fontSize: '15px',
  fontWeight: '600',
  margin: '0',
};

const detailValue = {
  color: '#1A1A1A',
  fontSize: '15px',
  margin: '0',
  textAlign: 'right' as const,
};

const detailValueLarge = {
  color: '#C9A961',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '0',
};

const nextStepsBox = {
  backgroundColor: '#F5F5F5',
  borderLeft: '4px solid #C9A961',
  borderRadius: '4px',
  padding: '20px',
  margin: '24px',
};

const nextStepsTitle = {
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '12px',
};

const nextStepsText = {
  color: '#1A1A1A',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
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

const supportText = {
  color: '#525252',
  fontSize: '14px',
  textAlign: 'center' as const,
  margin: '24px 0',
};

const link = {
  color: '#C9A961',
  textDecoration: 'underline',
};
