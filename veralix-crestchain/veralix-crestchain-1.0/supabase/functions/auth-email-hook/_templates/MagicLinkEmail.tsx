import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Text,
  Code,
  Hr,
  Section,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { EmailHeader } from "./EmailHeader.tsx";
import { EmailFooter } from "./EmailFooter.tsx";

interface MagicLinkEmailProps {
  supabaseUrl: string;
  emailActionType: string;
  redirectTo: string;
  tokenHash: string;
  token: string;
  userEmail: string;
  logoUrl?: string;
  websiteUrl?: string;
  isRecovery?: boolean;
  isEmailChange?: boolean;
}

export const MagicLinkEmail = ({
  token,
  supabaseUrl,
  emailActionType,
  redirectTo,
  tokenHash,
  userEmail,
  logoUrl = "https://veralix.io/veralix-logo-email.png",
  websiteUrl = "https://veralix.io",
  isRecovery = false,
  isEmailChange = false,
}: MagicLinkEmailProps) => {
  // Personalizar contenido según tipo
  let titleText = "Verifica tu Email";
  let previewText = "Verifica tu cuenta de Veralix";
  let mainHeading = "🔐 Verificación de Email";
  let introText = "Hemos recibido una solicitud para verificar tu cuenta en Veralix. Haz clic en el botón de abajo para confirmar tu email:";
  let buttonText = "Verificar Email";

  if (isRecovery) {
    titleText = "Recupera tu Cuenta";
    previewText = "Recupera el acceso a tu cuenta de Veralix";
    mainHeading = "🔑 Recuperación de Cuenta";
    introText = "Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón de abajo para crear una nueva contraseña:";
    buttonText = "Restablecer Contraseña";
  } else if (isEmailChange) {
    titleText = "Confirma tu Nuevo Email";
    previewText = "Confirma el cambio de email en Veralix";
    mainHeading = "📧 Confirmar Cambio de Email";
    introText = "Para completar el cambio de tu dirección de email en Veralix, haz clic en el botón de abajo:";
    buttonText = "Confirmar Nuevo Email";
  }

  // Construir URL de verificación con validación
  const verifyUrl = tokenHash 
    ? `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${emailActionType}&redirect_to=${encodeURIComponent(redirectTo || websiteUrl)}`
    : websiteUrl;
  
  // Debug: mostrar si hay problema con el URL
  const hasValidUrl = tokenHash && tokenHash.length > 0;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title={titleText} logoUrl={logoUrl} />

          <Section style={content}>
            <Heading style={h1}>{mainHeading}</Heading>
            
            <Text style={text}>{introText}</Text>

            <Section style={buttonContainer}>
              {hasValidUrl ? (
                <Link href={verifyUrl} target="_blank" style={button}>
                  {buttonText}
                </Link>
              ) : (
                <Link href={websiteUrl} target="_blank" style={button}>
                  Ir a Veralix
                </Link>
              )}
            </Section>
            
            {!hasValidUrl && (
              <Text style={{ ...text, color: '#dc2626', textAlign: 'center' as const }}>
                ⚠️ Hubo un problema generando tu enlace de verificación. 
                Por favor intenta registrarte nuevamente en {websiteUrl}
              </Text>
            )}

            {!isRecovery && !isEmailChange && token && (
              <>
                <Text style={{ ...text, marginTop: '32px', marginBottom: '14px' }}>
                  O copia y pega este código de verificación temporal:
                </Text>
                <Code style={code}>{token}</Code>
              </>
            )}
            
            {hasValidUrl && (
              <Text style={{ ...text, marginTop: '24px', fontSize: '12px', color: '#666', wordBreak: 'break-all' as const }}>
                Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                <Link href={verifyUrl} style={{ color: '#C9A961' }}>{verifyUrl}</Link>
              </Text>
            )}

            <Hr style={divider} />

            <Section style={securityNote}>
              <Text style={securityTitle}>🔒 Nota de Seguridad</Text>
              <Text style={securityText}>
                • Este enlace es válido por 24 horas<br />
                • Si no solicitaste esta acción, ignora este email<br />
                • Nunca compartas este código con nadie<br />
                • Veralix nunca te pedirá tu contraseña por email
              </Text>
            </Section>

            <Text style={infoText}>
              Este email fue enviado a: <strong>{userEmail}</strong>
            </Text>
          </Section>

          <EmailFooter websiteUrl={websiteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export default MagicLinkEmail;

// Estilos con identidad Veralix
const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: '0 auto',
  maxWidth: '600px',
};

const content = {
  padding: '48px',
};

const h1 = {
  color: '#1A1A1A',
  fontSize: '32px',
  fontWeight: 'bold',
  margin: '0 0 24px 0',
  padding: '0',
  lineHeight: '1.2',
};

const text = {
  color: '#1A1A1A',
  fontSize: '16px',
  lineHeight: '24px',
  margin: '0 0 16px 0',
};

const buttonContainer = {
  margin: '32px 0',
  textAlign: 'center' as const,
};

const button = {
  backgroundColor: '#C9A961',
  borderRadius: '8px',
  color: '#FFFFFF',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 48px',
  lineHeight: '1',
};

const code = {
  display: 'inline-block',
  padding: '16px 24px',
  backgroundColor: '#F5F5F5',
  borderRadius: '8px',
  border: '2px solid #C9A961',
  color: '#1A1A1A',
  fontSize: '24px',
  fontWeight: 'bold',
  letterSpacing: '4px',
  fontFamily: 'monospace',
  margin: '0 auto',
  textAlign: 'center' as const,
};

const divider = {
  borderColor: '#E5E5E5',
  borderWidth: '1px',
  margin: '40px 0',
};

const securityNote = {
  backgroundColor: '#FFF9E6',
  border: '1px solid #C9A961',
  borderRadius: '8px',
  padding: '24px',
  margin: '24px 0',
};

const securityTitle = {
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: '600',
  margin: '0 0 12px 0',
};

const securityText = {
  color: '#4A4A4A',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const infoText = {
  color: '#8B8B8B',
  fontSize: '14px',
  lineHeight: '20px',
  margin: '24px 0 0 0',
  textAlign: 'center' as const,
};
