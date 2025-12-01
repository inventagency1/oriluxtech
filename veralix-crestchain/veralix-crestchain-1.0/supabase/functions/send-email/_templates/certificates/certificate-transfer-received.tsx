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

interface CertificateTransferReceivedEmailProps {
  certificateId: string;
  jewelryName: string;
  jewelryType: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  transferNotes?: string;
  transferDate: string;
  acceptUrl: string;
  certificateUrl: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export const CertificateTransferReceivedEmail = ({
  certificateId = "VRX-001",
  jewelryName = "Pieza de Joyería",
  jewelryType = "Joyería",
  senderName = "Remitente",
  senderEmail = "",
  recipientName = "Destinatario",
  transferNotes = "",
  transferDate = new Date().toLocaleDateString('es-CO'),
  acceptUrl = "#",
  certificateUrl = "#",
  logoUrl = "https://veralix.io/veralix-logo-email.png",
  websiteUrl = "https://veralix.io",
}: CertificateTransferReceivedEmailProps) => (
  <Html>
    <Head />
    <Preview>{`Has recibido el certificado NFT ${certificateId}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader title="🎁 Has Recibido un Certificado NFT" logoUrl={logoUrl} />
        
        <Text style={text}>
          Hola <strong>{recipientName}</strong>,
        </Text>

        <Text style={text}>
          ¡Felicitaciones! <strong>{senderName}</strong> te ha transferido el certificado NFT 
          <strong> {certificateId}</strong> para la pieza <strong>{jewelryName}</strong>.
        </Text>

        <Section style={certificateBox}>
          <Text style={certificateTitle}>💎 Certificado Transferido</Text>
          
          <Section style={detailRow}>
            <Text style={detailKey}>Certificado:</Text>
            <Text style={detailValue}>{certificateId}</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailKey}>Pieza:</Text>
            <Text style={detailValue}>{jewelryName}</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailKey}>Tipo:</Text>
            <Text style={detailValue}>{jewelryType}</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailKey}>De:</Text>
            <Text style={detailValue}>{senderName}</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailKey}>Email:</Text>
            <Text style={detailValue}>{senderEmail}</Text>
          </Section>
          
          <Section style={detailRow}>
            <Text style={detailKey}>Fecha:</Text>
            <Text style={detailValue}>{transferDate}</Text>
          </Section>
          
          {transferNotes && (
            <>
              <Hr style={divider} />
              <Text style={notesLabel}>Mensaje del Remitente:</Text>
              <Text style={notesText}>{transferNotes}</Text>
            </>
          )}
        </Section>

        <Section style={actionBox}>
          <Text style={actionTitle}>🎯 Próximos Pasos</Text>
          <Text style={actionText}>
            Para completar la transferencia y recibir el certificado en tu cuenta:
          </Text>
          <ol style={actionList}>
            <li>Revisa los detalles del certificado</li>
            <li>Verifica la autenticidad de la transferencia</li>
            <li>Acepta la transferencia desde tu dashboard</li>
          </ol>
        </Section>

        <Section style={buttonContainer}>
          <Link href={acceptUrl} style={primaryButton}>
            Aceptar Certificado
          </Link>
        </Section>

        <Section style={buttonContainer}>
          <Link href={certificateUrl} style={secondaryButton}>
            Ver Detalles del Certificado
          </Link>
        </Section>

        <Section style={warningBox}>
          <Text style={warningText}>
            ⚠️ <strong>Importante:</strong> Verifica que conoces al remitente antes de aceptar la transferencia. 
            Una vez aceptada, el certificado será tuyo y la transferencia no se puede revertir.
          </Text>
        </Section>

        <Text style={text}>
          <strong>¿Qué incluye este certificado NFT?</strong>
        </Text>
        <ul style={benefitsList}>
          <li>Autenticidad verificada en blockchain</li>
          <li>Historial completo de propiedad</li>
          <li>Información detallada de la pieza</li>
          <li>Código QR de verificación</li>
          <li>Certificado descargable en PDF</li>
        </ul>

        <EmailFooter websiteUrl={websiteUrl} />
      </Container>
    </Body>
  </Html>
);

export default CertificateTransferReceivedEmail;

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

const certificateBox = {
  background: "linear-gradient(135deg, #C9A961 0%, #B8860B 100%)",
  borderRadius: "12px",
  margin: "24px 48px",
  padding: "24px",
  color: "#1A1A1A",
};

const certificateTitle = {
  color: "#1A1A1A",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "0 0 16px 0",
  textAlign: "center" as const,
};

const detailRow = {
  display: "flex",
  justifyContent: "space-between",
  margin: "10px 0",
};

const detailKey = {
  color: "rgba(26, 26, 26, 0.7)",
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
  borderColor: "rgba(26, 26, 26, 0.2)",
  margin: "16px 0",
};

const notesLabel = {
  color: "rgba(26, 26, 26, 0.8)",
  fontSize: "14px",
  fontWeight: "600",
  margin: "8px 0",
};

const notesText = {
  color: "#1A1A1A",
  fontSize: "14px",
  fontStyle: "italic",
  margin: "4px 0",
};

const actionBox = {
  backgroundColor: "#FFF9E6",
  borderRadius: "8px",
  margin: "24px 48px",
  padding: "20px",
};

const actionTitle = {
  color: "#1A1A1A",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const actionText = {
  color: "#4a4a4a",
  fontSize: "14px",
  margin: "8px 0",
};

const actionList = {
  color: "#4a4a4a",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "12px 0",
  paddingLeft: "20px",
};

const warningBox = {
  backgroundColor: "#fef3c7",
  border: "2px solid #f59e0b",
  borderRadius: "8px",
  margin: "24px 48px",
  padding: "16px",
};

const warningText = {
  color: "#92400e",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0",
};

const benefitsList = {
  color: "#4a4a4a",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "12px 48px",
  paddingLeft: "20px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "16px 0",
};

const primaryButton = {
  backgroundColor: "#C9A961",
  borderRadius: "8px",
  color: "#1A1A1A",
  fontSize: "18px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 40px",
};

const secondaryButton = {
  backgroundColor: "#1A1A1A",
  borderRadius: "8px",
  color: "#C9A961",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};
