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

interface OrderCancelledEmailProps {
  orderNumber: string;
  buyerName: string;
  sellerName: string;
  totalAmount: string;
  currency: string;
  cancelledBy: 'buyer' | 'seller' | 'system';
  cancellationReason?: string;
  refundInfo?: string;
  orderDate: string;
  recipientRole: 'buyer' | 'seller';
  logoUrl?: string;
  websiteUrl?: string;
}

export const OrderCancelledEmail = ({
  orderNumber = "ORD-000001",
  buyerName = "Comprador",
  sellerName = "Vendedor",
  totalAmount = "0",
  currency = "COP",
  cancelledBy = "buyer",
  cancellationReason = "No se especificó razón",
  refundInfo = "",
  orderDate = new Date().toLocaleDateString('es-CO'),
  recipientRole = "buyer",
  logoUrl = "https://veralix.io/veralix-logo-email.png",
  websiteUrl = "https://veralix.io",
}: OrderCancelledEmailProps) => {
  const cancelledByName = 
    cancelledBy === 'buyer' ? buyerName :
    cancelledBy === 'seller' ? sellerName : 
    'Sistema';

  const recipientName = recipientRole === 'buyer' ? buyerName : sellerName;

  return (
    <Html>
      <Head />
      <Preview>{`Orden ${orderNumber} ha sido cancelada`}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="❌ Orden Cancelada" logoUrl={logoUrl} />
          
          <Text style={text}>
            Hola <strong>{recipientName}</strong>,
          </Text>

          <Text style={text}>
            Lamentamos informarte que la orden <strong>{orderNumber}</strong> ha sido cancelada.
          </Text>

          <Section style={alertBox}>
            <Text style={alertText}>
              Cancelada por: <strong>{cancelledByName}</strong>
            </Text>
            {cancellationReason && (
              <Text style={reasonText}>
                Razón: {cancellationReason}
              </Text>
            )}
          </Section>

          <Section style={detailsBox}>
            <Text style={detailLabel}>Detalles de la Orden:</Text>
            <Hr style={divider} />
            
            <Section style={detailRow}>
              <Text style={detailKey}>Número de Orden:</Text>
              <Text style={detailValue}>{orderNumber}</Text>
            </Section>
            
            <Section style={detailRow}>
              <Text style={detailKey}>Fecha de Orden:</Text>
              <Text style={detailValue}>{orderDate}</Text>
            </Section>
            
            <Section style={detailRow}>
              <Text style={detailKey}>Comprador:</Text>
              <Text style={detailValue}>{buyerName}</Text>
            </Section>
            
            <Section style={detailRow}>
              <Text style={detailKey}>Vendedor:</Text>
              <Text style={detailValue}>{sellerName}</Text>
            </Section>
            
            <Section style={detailRow}>
              <Text style={detailKey}>Monto Total:</Text>
              <Text style={detailValue}>
                {new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: currency,
                }).format(parseFloat(totalAmount))}
              </Text>
            </Section>
          </Section>

          {recipientRole === 'buyer' && refundInfo && (
            <Section style={refundBox}>
              <Text style={refundTitle}>💰 Información de Reembolso</Text>
              <Text style={refundText}>{refundInfo}</Text>
            </Section>
          )}

          {recipientRole === 'buyer' && !refundInfo && (
            <Section style={refundBox}>
              <Text style={refundTitle}>💰 Reembolso</Text>
              <Text style={refundText}>
                Si realizaste el pago, el reembolso será procesado en un plazo de 5-10 días hábiles 
                a tu método de pago original.
              </Text>
            </Section>
          )}

          <Text style={text}>
            Si tienes alguna pregunta sobre esta cancelación, no dudes en contactarnos.
          </Text>

          <Section style={buttonContainer}>
            <Link href={`${websiteUrl}/my-marketplace`} style={button}>
              Ver Mis Órdenes
            </Link>
          </Section>

          <EmailFooter websiteUrl={websiteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export default OrderCancelledEmail;

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

const alertBox = {
  backgroundColor: "#fef2f2",
  border: "2px solid #ef4444",
  borderRadius: "8px",
  margin: "24px 48px",
  padding: "20px",
};

const alertText = {
  color: "#991b1b",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px 0",
};

const reasonText = {
  color: "#7f1d1d",
  fontSize: "14px",
  margin: "0",
};

const detailsBox = {
  backgroundColor: "#F5F5F5",
  borderRadius: "8px",
  margin: "24px 48px",
  padding: "20px",
};

const detailLabel = {
  color: "#1A1A1A",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const divider = {
  borderColor: "#C9A961",
  margin: "12px 0",
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
  flex: "1",
};

const refundBox = {
  backgroundColor: "#FFF9E6",
  border: "1px solid #C9A961",
  borderRadius: "8px",
  margin: "24px 48px",
  padding: "20px",
};

const refundTitle = {
  color: "#1A1A1A",
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0 0 8px 0",
};

const refundText = {
  color: "#4a4a4a",
  fontSize: "14px",
  lineHeight: "20px",
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
