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

interface PaymentFailedEmailProps {
  userName: string;
  planName: string;
  pricePerMonth: number;
  currency: string;
  attemptDate: string;
  errorMessage: string;
  retryDate?: string;
  logoUrl: string;
  websiteUrl: string;
  supportEmail: string;
}

export const PaymentFailedEmail = ({
  userName,
  planName,
  pricePerMonth,
  currency,
  attemptDate,
  errorMessage,
  retryDate,
  logoUrl,
  websiteUrl,
  supportEmail,
}: PaymentFailedEmailProps) => {
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
  }).format(pricePerMonth);

  const formattedAttemptDate = new Date(attemptDate).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const formattedRetryDate = retryDate
    ? new Date(retryDate).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Html>
      <Head />
      <Preview>Problema con el pago de tu suscripción a Veralix</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader logoUrl={logoUrl} websiteUrl={websiteUrl} />

          <Heading style={h1}>⚠️ Problema con tu Pago</Heading>

          <Text style={text}>Hola {userName},</Text>

          <Text style={text}>
            No pudimos procesar el pago de tu suscripción al plan <strong>{planName}</strong>.
          </Text>

          <Section style={warningBox}>
            <Text style={warningText}>
              <strong>Detalles del intento de pago:</strong>
            </Text>
            <table style={detailsTable}>
              <tr>
                <td style={detailsLabel}>Fecha del intento:</td>
                <td style={detailsValue}>{formattedAttemptDate}</td>
              </tr>
              <tr>
                <td style={detailsLabel}>Monto:</td>
                <td style={detailsValue}>{formattedPrice}</td>
              </tr>
              <tr>
                <td style={detailsLabel}>Razón:</td>
                <td style={detailsValue}>{errorMessage}</td>
              </tr>
            </table>
          </Section>

          <Text style={text}>
            <strong>¿Qué puedes hacer?</strong>
          </Text>

          <Section style={stepsList}>
            <Text style={stepItem}>
              1. Verifica que tu método de pago tenga fondos suficientes
            </Text>
            <Text style={stepItem}>
              2. Asegúrate de que la información de pago esté actualizada
            </Text>
            <Text style={stepItem}>
              3. Actualiza tu método de pago en tu cuenta
            </Text>
            {formattedRetryDate && (
              <Text style={stepItem}>
                4. Intentaremos procesar el pago nuevamente el {formattedRetryDate}
              </Text>
            )}
          </Section>

          <Section style={infoBox}>
            <Text style={infoText}>
              ℹ️ Si no actualizas tu método de pago, tu suscripción podría ser cancelada y perderás acceso a las funciones premium.
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Link href={`${websiteUrl}/subscription/manage`} style={button}>
              Actualizar Método de Pago
            </Link>
          </Section>

          <Text style={text}>
            Si crees que esto es un error o necesitas ayuda, contacta a nuestro equipo de soporte en{' '}
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

const warningBox = {
  backgroundColor: '#fff3cd',
  borderLeft: '4px solid #ff9800',
  borderRadius: '4px',
  padding: '16px',
  margin: '24px 0',
};

const warningText = {
  color: '#856404',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 12px',
};

const detailsTable = {
  width: '100%',
  borderCollapse: 'collapse' as const,
};

const detailsLabel = {
  color: '#856404',
  fontSize: '14px',
  paddingBottom: '8px',
  width: '40%',
};

const detailsValue = {
  color: '#856404',
  fontSize: '14px',
  fontWeight: '600',
  paddingBottom: '8px',
};

const stepsList = {
  margin: '24px 0',
};

const stepItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '12px 0',
};

const infoBox = {
  backgroundColor: '#e3f2fd',
  borderLeft: '4px solid #2196f3',
  borderRadius: '4px',
  padding: '16px',
  margin: '24px 0',
};

const infoText = {
  color: '#1565c0',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#ff9800',
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
