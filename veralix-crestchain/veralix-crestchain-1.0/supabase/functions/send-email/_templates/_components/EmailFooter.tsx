import { Section, Text, Link, Hr } from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface EmailFooterProps {
  websiteUrl?: string;
  supportEmail?: string;
}

export const EmailFooter = ({ 
  websiteUrl = "https://veralix.io",
  supportEmail = "support@veralix.io" 
}: EmailFooterProps) => (
  <>
    <Hr style={hr} />
    <Section style={footerSection}>
      <Text style={footerTitle}>
        💎 Veralix - Certificación Blockchain para Joyería de Lujo
      </Text>
      <Text style={footerLinks}>
        <Link href={websiteUrl} style={link}>Sitio Web</Link>
        {' • '}
        <Link href={`${websiteUrl}/marketplace`} style={link}>Marketplace</Link>
        {' • '}
        <Link href={`${websiteUrl}/about`} style={link}>Nosotros</Link>
        {' • '}
        <Link href={`${websiteUrl}/terms`} style={link}>Términos</Link>
      </Text>
      <Text style={footerCopyright}>
        © {new Date().getFullYear()} Veralix. Todos los derechos reservados.
      </Text>
      <Text style={footerSmall}>
        Si tienes preguntas, contáctanos en <Link href={`mailto:${supportEmail}`} style={link}>{supportEmail}</Link>
      </Text>
    </Section>
  </>
);

// Styles con identidad Veralix
const hr = {
  borderColor: "#C9A961", // Oro corporativo
  borderWidth: "1px",
  margin: "32px 48px",
};

const footerSection = {
  backgroundColor: "#F5F5F5", // Crema corporativo
  padding: "32px 48px",
  textAlign: "center" as const,
};

const footerTitle = {
  color: "#1A1A1A", // Negro corporativo
  fontSize: "16px",
  fontWeight: "600",
  lineHeight: "24px",
  margin: "0 0 16px 0",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const footerLinks = {
  color: "#8B8B8B", // Gris corporativo
  fontSize: "14px",
  lineHeight: "22px",
  margin: "16px 0",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const link = {
  color: "#C9A961", // Oro corporativo
  textDecoration: "none",
  fontWeight: "500",
};

const footerCopyright = {
  color: "#8B8B8B",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "16px 0 8px 0",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const footerSmall = {
  color: "#8B8B8B",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "8px 0 0 0",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
