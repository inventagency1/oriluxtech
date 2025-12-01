import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { EmailHeader } from "../_components/EmailHeader.tsx";
import { EmailFooter } from "../_components/EmailFooter.tsx";

interface CertificateGeneratedEmailProps {
  certificateId: string;
  recipientName: string;
  jewelryName: string;
  jewelryType: string;
  transactionHash: string;
  verificationUrl: string;
  qrCodeUrl?: string;
  logoUrl?: string;
  websiteUrl?: string;
  supportEmail?: string;
}

export const CertificateGeneratedEmail = ({
  certificateId,
  recipientName,
  jewelryName,
  jewelryType,
  transactionHash,
  verificationUrl,
  qrCodeUrl,
  logoUrl = "https://veralix.io/veralix-logo-email.png",
  websiteUrl = "https://veralix.io",
  supportEmail = "certificados@veralix.io",
}: CertificateGeneratedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Certificado NFT generado - {jewelryName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="🎉 Certificado NFT Generado" logoUrl={logoUrl} />
          
          <Text style={greeting}>Felicitaciones {recipientName},</Text>
          
          <Text style={text}>
            Tu certificado blockchain ha sido generado exitosamente. Tu joya ahora está certificada en la blockchain de forma permanente e inmutable.
          </Text>

          <Section style={certificateBox}>
            <div style={badge}>
              <Text style={badgeIcon}>✓</Text>
              <Text style={badgeText}>Certificado en Blockchain</Text>
            </div>

            <Hr style={divider} />

            <div style={certificateDetails}>
              <div style={detailRow}>
                <Text style={detailLabel}>ID del Certificado:</Text>
                <Text style={detailValueHighlight}>{certificateId}</Text>
              </div>

              <div style={detailRow}>
                <Text style={detailLabel}>Joya certificada:</Text>
                <Text style={detailValue}>{jewelryName}</Text>
              </div>

              <div style={detailRow}>
                <Text style={detailLabel}>Tipo:</Text>
                <Text style={detailValue}>{jewelryType}</Text>
              </div>

              <div style={detailRow}>
                <Text style={detailLabel}>Hash de transacción:</Text>
                <Text style={{...detailValue, fontSize: '12px', wordBreak: 'break-all' as const}}>
                  {transactionHash}
                </Text>
              </div>

              <div style={detailRow}>
                <Text style={detailLabel}>Fecha de certificación:</Text>
                <Text style={detailValue}>
                  {new Date().toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </div>
            </div>
          </Section>

          {qrCodeUrl && (
            <Section style={qrSection}>
              <Text style={qrTitle}>Código QR de verificación:</Text>
              <Img
                src={qrCodeUrl}
                alt="QR Code"
                style={qrImage}
              />
              <Text style={qrText}>
                Escanea este código para verificar la autenticidad del certificado
              </Text>
            </Section>
          )}

          <Section style={benefitsBox}>
            <Text style={benefitsTitle}>✨ Beneficios de tu certificado NFT:</Text>
            <Text style={benefitsText}>
              • <strong>Autenticidad garantizada:</strong> Verificable públicamente en blockchain<br />
              • <strong>Propiedad inmutable:</strong> Registro permanente y a prueba de falsificaciones<br />
              • <strong>Trazabilidad completa:</strong> Historial de propiedad transparente<br />
              • <strong>Valor agregado:</strong> Incrementa la confianza y el valor de tu joya<br />
              • <strong>Transferible:</strong> Puedes transferir el certificado al vender la joya
            </Text>
          </Section>

          <Section style={buttonContainer}>
            <Link
              href={verificationUrl}
              style={button}
            >
              Ver mi certificado
            </Link>
            
            <Link
              href={verificationUrl}
              style={buttonSecondary}
            >
              Verificar en blockchain
            </Link>
          </Section>

          <Section style={infoBox}>
            <Text style={infoTitle}>💡 ¿Qué es un certificado NFT?</Text>
            <Text style={infoText}>
              Es un token único registrado en blockchain que certifica la autenticidad de tu joya. 
              Este certificado es permanente, público y verificable por cualquier persona en el mundo.
            </Text>
          </Section>

          <Text style={supportText}>
            ¿Tienes preguntas sobre tu certificado? Contáctanos a{' '}
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

export default CertificateGeneratedEmail;

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
  fontSize: '20px',
  fontWeight: '600',
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

const certificateBox = {
  backgroundColor: '#FFF9E6',
  border: '2px solid #C9A961',
  borderRadius: '12px',
  padding: '32px',
  margin: '24px auto',
};

const badge = {
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const badgeIcon = {
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

const badgeText = {
  color: '#1A1A1A',
  fontSize: '20px',
  fontWeight: 'bold',
  margin: '0',
};

const divider = {
  borderColor: '#C9A961',
  margin: '24px 0',
};

const certificateDetails = {
  margin: '0',
};

const detailRow = {
  marginBottom: '16px',
};

const detailLabel = {
  color: '#8B8B8B',
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '4px',
};

const detailValue = {
  color: '#1A1A1A',
  fontSize: '15px',
  margin: '0',
};

const detailValueHighlight = {
  color: '#C9A961',
  fontSize: '18px',
  fontWeight: 'bold',
  margin: '0',
  fontFamily: 'monospace',
};

const qrSection = {
  textAlign: 'center' as const,
  margin: '32px auto',
  padding: '24px',
  backgroundColor: '#F5F5F5',
  borderRadius: '8px',
};

const qrTitle = {
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: '600',
  marginBottom: '16px',
};

const qrImage = {
  width: '200px',
  height: '200px',
  margin: '16px auto',
  border: '2px solid #C9A961',
  borderRadius: '8px',
};

const qrText = {
  color: '#8B8B8B',
  fontSize: '14px',
  marginTop: '16px',
};

const benefitsBox = {
  backgroundColor: '#F5F5F5',
  borderLeft: '4px solid #C9A961',
  borderRadius: '4px',
  padding: '20px',
  margin: '24px',
};

const benefitsTitle = {
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '12px',
};

const benefitsText = {
  color: '#1A1A1A',
  fontSize: '14px',
  lineHeight: '24px',
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
  marginBottom: '12px',
  marginRight: '8px',
};

const buttonSecondary = {
  backgroundColor: '#1A1A1A',
  border: '2px solid #C9A961',
  borderRadius: '8px',
  color: '#C9A961',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const infoBox = {
  backgroundColor: '#F5F5F5',
  borderRadius: '8px',
  padding: '20px',
  margin: '24px',
};

const infoTitle = {
  color: '#1A1A1A',
  fontSize: '16px',
  fontWeight: 'bold',
  marginBottom: '8px',
};

const infoText = {
  color: '#525252',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
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
