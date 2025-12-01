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

interface JewelryCreatedEmailProps {
  jewelryName: string;
  jewelryType: string;
  joyeroName: string;
  joyeroEmail: string;
  materials: string[];
  salePrice: number;
  currency: string;
  jewelryId: string;
  createdAt: string;
  logoUrl: string;
  websiteUrl: string;
  supportEmail: string;
}

export const JewelryCreatedEmail = ({
  jewelryName,
  jewelryType,
  joyeroName,
  joyeroEmail,
  materials,
  salePrice,
  currency,
  jewelryId,
  createdAt,
  logoUrl,
  websiteUrl,
  supportEmail,
}: JewelryCreatedEmailProps) => {
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
  }).format(salePrice);

  const formattedDate = new Date(createdAt).toLocaleString('es-CO', {
    dateStyle: 'long',
    timeStyle: 'short',
  });

  return (
    <Html>
      <Head />
      <Preview>Nueva joya registrada por {joyeroName} - {jewelryName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="Nueva Joya Registrada" logoUrl={logoUrl} />

          <Section style={content}>
            <Heading style={h2}>🆕 Nueva Joya en el Sistema</Heading>
            
            <Text style={text}>
              Un joyero ha registrado una nueva pieza en la plataforma Veralix:
            </Text>

            <Section style={infoBox}>
              <Text style={infoTitle}>Información de la Joya</Text>
              <Hr style={divider} />
              
              <Text style={infoRow}>
                <strong>Nombre:</strong> {jewelryName}
              </Text>
              <Text style={infoRow}>
                <strong>Tipo:</strong> {jewelryType}
              </Text>
              <Text style={infoRow}>
                <strong>Materiales:</strong> {materials.join(', ')}
              </Text>
              <Text style={infoRow}>
                <strong>Precio de venta:</strong> {formattedPrice}
              </Text>
              <Text style={infoRow}>
                <strong>ID en sistema:</strong> {jewelryId}
              </Text>
              <Text style={infoRow}>
                <strong>Fecha de registro:</strong> {formattedDate}
              </Text>
            </Section>

            <Section style={infoBox}>
              <Text style={infoTitle}>Joyero</Text>
              <Hr style={divider} />
              
              <Text style={infoRow}>
                <strong>Nombre:</strong> {joyeroName}
              </Text>
              <Text style={infoRow}>
                <strong>Email:</strong> {joyeroEmail}
              </Text>
            </Section>

            <Section style={buttonContainer}>
              <Link
                style={button}
                href={`${websiteUrl}/admin/jewelry/${jewelryId}`}
              >
                Ver Detalles en Panel Admin
              </Link>
            </Section>

            <Text style={footerText}>
              Este es un correo automático de notificación. Puedes gestionar las joyas y certificados desde el panel de administración.
            </Text>
          </Section>

          <EmailFooter websiteUrl={websiteUrl} supportEmail={supportEmail} />
        </Container>
      </Body>
    </Html>
  );
};

export default JewelryCreatedEmail;

// Estilos
const main = {
  backgroundColor: "#F5F5F5",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#FFFFFF",
  margin: "0 auto",
  marginTop: "20px",
  marginBottom: "20px",
  borderRadius: "8px",
  overflow: "hidden",
  border: "1px solid #E5E5E5",
};

const content = {
  padding: "40px 48px",
};

const h2 = {
  color: "#1A1A1A",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "0 0 20px",
};

const text = {
  color: "#525252",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const infoBox = {
  backgroundColor: "#F9FAFB",
  borderRadius: "8px",
  padding: "20px",
  marginTop: "24px",
  marginBottom: "24px",
  border: "1px solid #E5E7EB",
};

const infoTitle = {
  color: "#1A1A1A",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 12px",
};

const divider = {
  borderColor: "#E5E7EB",
  margin: "12px 0",
};

const infoRow = {
  color: "#525252",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#C9A961",
  borderRadius: "6px",
  color: "#FFFFFF",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  transition: "background-color 0.2s ease",
};

const footerText = {
  color: "#737373",
  fontSize: "14px",
  lineHeight: "20px",
  marginTop: "24px",
  textAlign: "center" as const,
};
