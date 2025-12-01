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
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";
import { EmailHeader } from "../_components/EmailHeader.tsx";
import { EmailFooter } from "../_components/EmailFooter.tsx";

interface PasswordResetEmailProps {
  userName: string;
  resetUrl: string;
  logoUrl: string;
  websiteUrl: string;
}

export const PasswordResetEmail = ({
  userName,
  resetUrl,
  logoUrl,
  websiteUrl,
}: PasswordResetEmailProps) => (
  <Html>
    <Head />
    <Preview>Recupera tu contraseña de Veralix</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader title="Recuperación de Contraseña" logoUrl={logoUrl} />
        
        <Section style={content}>
          <Heading style={h1}>Hola {userName},</Heading>
          
          <Text style={text}>
            Recibimos una solicitud para restablecer la contraseña de tu cuenta Veralix.
          </Text>
          
          <Text style={text}>
            Haz clic en el siguiente botón para crear una nueva contraseña:
          </Text>
          
          <Section style={buttonContainer}>
            <Link href={resetUrl} style={button}>
              Restablecer Contraseña
            </Link>
          </Section>
          
          <Text style={securityNote}>
            🔒 Este enlace expirará en <strong>60 minutos</strong> por seguridad.
          </Text>
          
          <Hr style={divider} />
          
          <Text style={footerText}>
            Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
            Tu contraseña actual permanecerá sin cambios.
          </Text>
        </Section>
        
        <EmailFooter websiteUrl={websiteUrl} supportEmail="support@veralix.io" />
      </Container>
    </Body>
  </Html>
);

export default PasswordResetEmail;

// Styles siguiendo la identidad Veralix
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
  backgroundColor: "#C9A961", // Dorado corporativo Veralix
  borderRadius: "8px",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const securityNote = {
  backgroundColor: "#FFF9E6",
  border: "1px solid #F0E5C9",
  borderRadius: "8px",
  padding: "16px",
  color: "#8B6914",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "24px 0",
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
  margin: "0",
};
