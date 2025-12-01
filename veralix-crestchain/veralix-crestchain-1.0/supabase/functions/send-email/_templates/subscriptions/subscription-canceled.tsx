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

interface SubscriptionCanceledEmailProps {
  userName: string;
  planName: string;
  canceledAt: string;
  currentPeriodEnd: string;
  logoUrl: string;
  websiteUrl: string;
  supportEmail: string;
}

export const SubscriptionCanceledEmail = ({
  userName,
  planName,
  canceledAt,
  currentPeriodEnd,
  logoUrl,
  websiteUrl,
  supportEmail,
}: SubscriptionCanceledEmailProps) => {
  const formattedCanceledDate = new Date(canceledAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedEndDate = new Date(currentPeriodEnd).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Html>
      <Head />
      <Preview>Tu suscripción a Veralix ha sido cancelada</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader logoUrl={logoUrl} websiteUrl={websiteUrl} />

          <Heading style={h1}>Suscripción Cancelada</Heading>

          <Text style={text}>Hola {userName},</Text>

          <Text style={text}>
            Confirmamos que tu suscripción al plan <strong>{planName}</strong> ha sido cancelada el {formattedCanceledDate}.
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              ℹ️ <strong>Importante:</strong> Tendrás acceso a todas las funciones de tu plan hasta el{' '}
              <strong>{formattedEndDate}</strong>. Después de esta fecha, tu cuenta cambiará al plan gratuito.
            </Text>
          </Section>

          <Text style={text}>
            <strong>¿Qué significa esto?</strong>
          </Text>

          <Section style={stepsList}>
            <Text style={stepItem}>
              • Seguirás teniendo acceso completo hasta {formattedEndDate}
            </Text>
            <Text style={stepItem}>
              • No se realizarán más cobros automáticos
            </Text>
            <Text style={stepItem}>
              • Tus certificados NFT existentes permanecerán activos
            </Text>
            <Text style={stepItem}>
              • Podrás reactivar tu suscripción en cualquier momento
            </Text>
          </Section>

          <Text style={text}>
            Lamentamos verte partir. Si cancelaste por algún problema o tienes sugerencias para mejorar nuestro servicio, nos encantaría escucharte.
          </Text>

          <Section style={buttonContainer}>
            <Link href={`${websiteUrl}/pricing`} style={button}>
              Reactivar Suscripción
            </Link>
          </Section>

          <Text style={text}>
            Si tienes alguna pregunta, estamos aquí para ayudarte en{' '}
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

const stepsList = {
  margin: '24px 0',
};

const stepItem = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '8px 0',
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
