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
} from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';
import { EmailHeader } from "../_components/EmailHeader.tsx";
import { EmailFooter } from "../_components/EmailFooter.tsx";

interface OrderConfirmationEmailProps {
  orderNumber: string;
  jewelryName: string;
  jewelryImage?: string;
  amount: number;
  currency: string;
  orderId: string;
  buyerName?: string;
  sellerName?: string;
  shippingAddress?: any;
  logoUrl?: string;
  websiteUrl?: string;
}

export const OrderConfirmationEmail = ({
  orderNumber,
  jewelryName,
  jewelryImage,
  amount,
  currency,
  orderId,
  buyerName,
  sellerName,
  shippingAddress,
  logoUrl = "https://veralix.io/veralix-logo-email.png",
  websiteUrl = "https://veralix.io",
}: OrderConfirmationEmailProps) => {
  const formatPrice = (price: number, curr: string) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: curr === 'COP' ? 'COP' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Html>
      <Head />
      <Preview>Orden confirmada #{orderNumber} - Veralix</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader title="✅ Orden Confirmada" logoUrl={logoUrl} />
          
          <Text style={text}>
            Tu orden ha sido creada exitosamente y está siendo procesada.
          </Text>

          <Section style={orderBox}>
            <Text style={orderNumber}>Orden #{orderNumber}</Text>
            
            {jewelryImage && (
              <Img
                src={jewelryImage}
                alt={jewelryName}
                style={productImage}
              />
            )}
            
            <Text style={productName}>{jewelryName}</Text>
            <Text style={price}>{formatPrice(amount, currency)}</Text>
          </Section>

          {buyerName && (
            <Section style={infoSection}>
              <Text style={infoLabel}>Comprador:</Text>
              <Text style={infoValue}>{buyerName}</Text>
            </Section>
          )}

          {sellerName && (
            <Section style={infoSection}>
              <Text style={infoLabel}>Vendedor:</Text>
              <Text style={infoValue}>{sellerName}</Text>
            </Section>
          )}

          {shippingAddress && (
            <Section style={infoSection}>
              <Text style={infoLabel}>Dirección de envío:</Text>
              <Text style={infoValue}>
                {shippingAddress.street}<br />
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}<br />
                {shippingAddress.country}
              </Text>
            </Section>
          )}

          <Section style={buttonContainer}>
            <Link
              href={`${websiteUrl}/orders/${orderId}`}
              style={button}
            >
              Ver mi orden
            </Link>
          </Section>

          <EmailFooter websiteUrl={websiteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export default OrderConfirmationEmail;

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

const text = {
  color: '#525252',
  fontSize: '16px',
  lineHeight: '24px',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const orderBox = {
  backgroundColor: '#FFF9E6',
  border: '2px solid #C9A961',
  borderRadius: '12px',
  padding: '24px',
  margin: '24px auto',
  textAlign: 'center' as const,
};

const orderNumber = {
  color: '#C9A961',
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '16px',
};

const productImage = {
  width: '200px',
  height: '200px',
  objectFit: 'cover' as const,
  borderRadius: '8px',
  margin: '16px auto',
};

const productName = {
  color: '#1A1A1A',
  fontSize: '18px',
  fontWeight: '600',
  margin: '16px 0 8px',
};

const price = {
  color: '#C9A961',
  fontSize: '24px',
  fontWeight: 'bold',
  margin: '8px 0',
};

const infoSection = {
  margin: '16px 24px',
};

const infoLabel = {
  color: '#8B8B8B',
  fontSize: '14px',
  fontWeight: '600',
  marginBottom: '4px',
};

const infoValue = {
  color: '#1A1A1A',
  fontSize: '16px',
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
};
