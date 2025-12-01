import {
  Body,
  Container,
  Head,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";
import { EmailHeader } from "../_components/EmailHeader.tsx";
import { EmailFooter } from "../_components/EmailFooter.tsx";

interface OrderMessageEmailProps {
  orderNumber: string;
  senderName: string;
  senderRole: 'buyer' | 'seller';
  recipientName: string;
  message: string;
  messagePreview: string;
  orderUrl: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export const OrderMessageEmail = ({
  orderNumber = "ORD-000001",
  senderName = "Usuario",
  senderRole = "buyer",
  recipientName = "Usuario",
  message = "",
  messagePreview = "",
  orderUrl = "#",
  logoUrl = "https://veralix.io/veralix-logo-email.png",
  websiteUrl = "https://veralix.io",
}: OrderMessageEmailProps) => {
  const roleName = senderRole === 'buyer' ? 'Comprador' : 'Vendedor';
  
  return (
    <Html>
      <Head />
      <Preview>{`Nuevo mensaje de ${senderName} - Orden ${orderNumber}`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="💬 Nuevo Mensaje" logoUrl={logoUrl} />
          
          <Text style={text}>
            Hola <strong>{recipientName}</strong>,
          </Text>

          <Text style={text}>
            Has recibido un nuevo mensaje de <strong>{senderName}</strong> ({roleName}) 
            sobre la orden <strong>{orderNumber}</strong>:
          </Text>

          <Section style={messageBox}>
            <Text style={messageLabel}>
              De: {senderName} ({roleName})
            </Text>
            <Text style={messageContent}>
              {message}
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Link href={orderUrl} style={button}>
              Ver Orden y Responder
            </Link>
          </Section>

          <Text style={securityNote}>
            Para mantener una comunicación segura, responde desde el chat de la orden en Veralix.
          </Text>

          <EmailFooter websiteUrl={websiteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export default OrderMessageEmail;

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};


const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "26px",
  margin: "16px 48px",
};

const messageBox = {
  backgroundColor: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  margin: "24px 48px",
  padding: "20px",
};

const messageLabel = {
  color: "#64748b",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0 0 12px 0",
};

const messageContent = {
  color: "#1e293b",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0",
  whiteSpace: "pre-wrap" as const,
};


const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#C9A961", // Oro Veralix
  borderRadius: "8px",
  color: "#1A1A1A",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const securityNote = {
  color: "#8B8B8B",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "24px 48px 16px",
  textAlign: "center" as const,
  fontStyle: "italic",
};
