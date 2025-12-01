import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { EmailHeader } from '../_components/EmailHeader.tsx';
import { EmailFooter } from '../_components/EmailFooter.tsx';

interface SubscriptionRenewedEmailProps {
  userName: string;
  planName: string;
  pricePerMonth: number;
  currency: string;
  currentPeriodEnd: string;
  transactionId: string;
  logoUrl: string;
  websiteUrl: string;
  supportEmail: string;
}

export const SubscriptionRenewedEmail = ({
  userName,
  planName,
  pricePerMonth,
  currency,
  currentPeriodEnd,
  transactionId,
  logoUrl,
  websiteUrl,
  supportEmail,
}: SubscriptionRenewedEmailProps) => {
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
  }).format(pricePerMonth);

  const formattedDate = new Date(currentPeriodEnd).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Tu suscripción a Veralix {planName} ha sido renovada</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader logoUrl={logoUrl} websiteUrl={websiteUrl} />

          <Heading style={h1}>Suscripción Renovada ✅</Heading>

          <Text style={text}>Hola {userName},</Text>

          <Text style={text}>
            Tu suscripción al plan <strong>{planName}</strong> ha sido renovada exitosamente.
          </Text>

          <Section style={detailsBox}>
            <Text style={detailsTitle}>Detalles de la renovación</Text>
            
            <table style={detailsTable}>
              <tr>
                <td style={detailsLabel}>Plan:</td>
                <td style={detailsValue}>{planName}</td>
              </tr>
              <tr>
                <td style={detailsLabel}>Monto cobrado:</td>
                <td style={detailsValue}>{formattedPrice}</td>
              </tr>
              <tr>
                <td style={detailsLabel}>Próxima renovación:</td>
                <td style={detailsValue}>{formattedDate}</td>
              </tr>
              <tr>
                <td style={detailsLabel}>ID de transacción:</td>
                <td style={detailsValue}>{transactionId}</td>
              </tr>
            </table>
          </Section>

          <Text style={text}>
            Tu contador de certificados ha sido reiniciado y ya puedes seguir generando certificados NFT para tus piezas de joyería.
          </Text>

          <Section style={buttonContainer}>
            <Link href={`${websiteUrl}/dashboard`} style={button}>
              Ver Dashboard
            </Link>
          </Section>

          <Text style={text}>
            Si tienes alguna pregunta sobre tu suscripción o facturación, no dudes en contactarnos en{' '}
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

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '40px 0',
  padding: '0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
};

const detailsBox = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const detailsTitle = {
  color: '#333',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0 0 16px',
};

const detailsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const detailsLabel = {
  color: '#666',
  fontSize: '14px',
  paddingBottom: '8px',
  width: '40%',
};

const detailsValue = {
  color: '#333',
  fontSize: '14px',
  fontWeight: '600',
  paddingBottom: '8px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#6366f1',
  borderRadius: '8px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const link = {
  color: '#6366f1',
  textDecoration: 'underline',
};
