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
  Hr,
  Code,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";
import { EmailHeader } from "../_components/EmailHeader.tsx";
import { EmailFooter } from "../_components/EmailFooter.tsx";

interface MagicLinkEmailProps {
  supabaseUrl: string;
  token: string;
  tokenHash: string;
  redirectTo: string;
  emailActionType: string;
  userEmail: string;
  logoUrl: string;
  websiteUrl: string;
  isRecovery?: boolean;
  isEmailChange?: boolean;
}

export const MagicLinkEmail = ({
  supabaseUrl,
  token,
  tokenHash,
  redirectTo,
  emailActionType,
  userEmail,
  logoUrl,
  websiteUrl,
  isRecovery = false,
  isEmailChange = false,
}: MagicLinkEmailProps) => {
  const verifyUrl = `${supabaseUrl}/auth/v1/verify?token=${tokenHash}&type=${emailActionType}&redirect_to=${redirectTo}`;

  let title = "Verifica tu cuenta";
  let previewText = "Confirma tu email en Veralix";
  let mainHeading = "Verificación de Cuenta";
  let introText = "Para completar tu registro en Veralix, verifica tu email haciendo clic en el botón de abajo:";
  let buttonText = "Verificar Email";

  if (isRecovery) {
    title = "Recupera tu cuenta";
    previewText = "Restablece tu contraseña de Veralix";
    mainHeading = "Recuperación de Cuenta";
    introText = "Recibimos una solicitud para restablecer tu contraseña. Haz clic en el botón para crear una nueva:";
    buttonText = "Restablecer Contraseña";
  } else if (isEmailChange) {
    title = "Confirma tu nuevo email";
    previewText = "Verifica tu cambio de email en Veralix";
    mainHeading = "Cambio de Email";
    introText = "Confirma tu nuevo email haciendo clic en el botón de abajo:";
    buttonText = "Confirmar Email";
  }

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title={mainHeading} logoUrl={logoUrl} />
          
          <Section style={content}>
            <Heading style={h1}>¡Hola!</Heading>
            
            <Text style={text}>{introText}</Text>
            
            <Section style={buttonContainer}>
              <Link href={verifyUrl} style={button}>
                {buttonText}
              </Link>
            </Section>
            
            {!isRecovery && (
              <>
                <Hr style={divider} />
                
                <Text style={text}>
                  O copia y pega este código de un solo uso:
                </Text>
                
                <Code style={code}>{token}</Code>
              </>
            )}
            
            <Section style={securityNote}>
              <Text style={securityNoteText}>
                🔒 Este enlace expirará en <strong>60 minutos</strong> por seguridad.
              </Text>
            </Section>
            
            <Hr style={divider} />
            
            <Text style={footerText}>
              Si no solicitaste {isRecovery ? "un cambio de contraseña" : isEmailChange ? "un cambio de email" : "esta verificación"}, 
              puedes ignorar este correo de forma segura.
            </Text>
            
            <Text style={emailInfo}>
              Este email fue enviado a: <strong>{userEmail}</strong>
            </Text>
          </Section>
          
          <EmailFooter websiteUrl={websiteUrl} supportEmail="support@veralix.io" />
        </Container>
      </Body>
    </Html>
  );
};

export default MagicLinkEmail;

// Estilos siguiendo la identidad Veralix
const main = {
  backgroundColor: "#F5F5F5",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "0",
  maxWidth: "600px",
  backgroundColor: "#FFFFFF",
};

const content = {
  padding: "40px 48px",
};

const h1 = {
  color: "#1A1A1A",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 24px",
};

const text = {
  color: "#333333",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 16px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#C9A961",
  borderRadius: "8px",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const code = {
  display: "inline-block",
  padding: "16px",
  backgroundColor: "#F5F5F5",
  border: "1px solid #E5E5E5",
  borderRadius: "8px",
  color: "#1A1A1A",
  fontSize: "18px",
  fontWeight: "bold",
  letterSpacing: "2px",
  textAlign: "center" as const,
  width: "100%",
};

const securityNote = {
  backgroundColor: "#FFF9E6",
  border: "1px solid #F0E5C9",
  borderRadius: "8px",
  padding: "16px",
  margin: "24px 0",
};

const securityNoteText = {
  color: "#8B6914",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  textAlign: "center" as const,
};

const divider = {
  borderColor: "#E5E5E5",
  margin: "32px 0",
};

const footerText = {
  color: "#666666",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0 0 16px",
};

const emailInfo = {
  color: "#999999",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0",
  textAlign: "center" as const,
};
