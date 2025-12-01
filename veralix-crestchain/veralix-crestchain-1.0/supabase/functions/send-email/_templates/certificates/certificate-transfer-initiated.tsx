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
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";
import { EmailHeader } from "../_components/EmailHeader.tsx";
import { EmailFooter } from "../_components/EmailFooter.tsx";

interface CertificateTransferInitiatedEmailProps {
  certificateId: string;
  jewelryName: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  transferNotes?: string;
  transferDate: string;
  certificateUrl: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export const CertificateTransferInitiatedEmail = ({
  certificateId = "VRX-001",
  jewelryName = "Pieza de Joyería",
  senderName = "Remitente",
  senderEmail = "",
  recipientName = "Destinatario",
  recipientEmail = "",
  transferNotes = "",
  transferDate = new Date().toLocaleDateString('es-CO'),
  certificateUrl = "#",
  logoUrl = "https://veralix.io/veralix-logo-email.png",
  websiteUrl = "https://veralix.io",
}: CertificateTransferInitiatedEmailProps) => (
  <Html>
    <Head />
    <Preview>{`Transferencia de Certificado ${certificateId} iniciada`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader title="🔄 Transferencia Iniciada" logoUrl={logoUrl} />
        
        <Text style={text}>
          Hola <strong>{senderName}</strong>,
        </Text>

        <Text style={text}>
          Has iniciado la transferencia del certificado NFT <strong>{certificateId}</strong> para 
          la pieza <strong>{jewelryName}</strong>.
        </Text>

        <Section style={highlightBox}>
          <Text style={highlightTitle}>📋 Detalles de la Transferencia</Text>
          
          <Section style={detailRow}>
            <Text style={detailKey}>Certificado:</Text>
            <Text style={detailValue}>{certificateId}</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailKey}>Pieza:</Text>
            <Text style={detailValue}>{jewelryName}</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailKey}>De:</Text>
            <Text style={detailValue}>{senderName} ({senderEmail})</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailKey}>Para:</Text>
            <Text style={detailValue}>{recipientName} ({recipientEmail})</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailKey}>Fecha:</Text>
            <Text style={detailValue}>{transferDate}</Text>
          </Section>
          
          {transferNotes && (
            <>
              <Hr style={divider} />
              <Text style={notesLabel}>Notas de Transferencia:</Text>
              <Text style={notesText}>{transferNotes}</Text>
            </>
          )}
        </Section>

        <Section style={infoBox}>
          <Text style={infoText}>
            ℹ️ El destinatario recibirá una notificación por correo electrónico para aceptar la transferencia. 
            Una vez aceptada, el certificado será transferido a su cuenta.
          </Text>
        </Section>

        <Text style={text}>
          <strong>Importante:</strong> Durante el proceso de transferencia, el certificado permanecerá 
          asociado a tu cuenta hasta que el destinatario lo acepte.
        </Text>

        <Section style={buttonContainer}>
          <Link href={certificateUrl} style={button}>
            Ver Certificado
          </Link>
        </Section>

        <Text style={warningText}>
          Si no iniciaste esta transferencia, contacta inmediatamente a soporte.
        </Text>

        <EmailFooter websiteUrl={websiteUrl} />
      </Container>
    </Body>
  </Html>
);

export default CertificateTransferInitiatedEmail;

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

const highlightBox = {
  backgroundColor: "#FFF9E6",
  border: "2px solid #C9A961",
  borderRadius: "8px",
  margin: "24px 48px",
  padding: "20px",
};

const highlightTitle = {
  color: "#1A1A1A",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
};

const detailRow = {
  display: "flex",
  justifyContent: "space-between",
  margin: "12px 0",
};

const detailKey = {
  color: "#8B8B8B",
  fontSize: "14px",
  margin: "0",
  flex: "1",
};

const detailValue = {
  color: "#1A1A1A",
  fontSize: "14px",
  fontWeight: "600",
  margin: "0",
  textAlign: "right" as const,
  flex: "2",
};

const divider = {
  borderColor: "#C9A961",
  margin: "16px 0",
};

const notesLabel = {
  color: "#1A1A1A",
  fontSize: "14px",
  fontWeight: "600",
  margin: "8px 0",
};

const notesText = {
  color: "#4a4a4a",
  fontSize: "14px",
  fontStyle: "italic",
  margin: "4px 0",
};

const infoBox = {
  backgroundColor: "#F5F5F5",
  borderLeft: "4px solid #C9A961",
  margin: "24px 48px",
  padding: "16px 20px",
};

const infoText = {
  color: "#1A1A1A",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#C9A961",
  borderRadius: "8px",
  color: "#1A1A1A",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

const warningText = {
  color: "#8B8B8B",
  fontSize: "13px",
  textAlign: "center" as const,
  margin: "24px 48px",
  fontStyle: "italic",
};
