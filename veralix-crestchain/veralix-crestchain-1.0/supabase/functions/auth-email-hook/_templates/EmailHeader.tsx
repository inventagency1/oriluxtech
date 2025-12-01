import {
  Section,
  Img,
  Heading,
} from "npm:@react-email/components@0.0.22";
import * as React from "npm:react@18.3.1";

interface EmailHeaderProps {
  title: string;
  logoUrl: string;
}

export const EmailHeader = ({ title, logoUrl }: EmailHeaderProps) => (
  <Section style={headerSection}>
    <Img
      src={logoUrl}
      alt="Veralix - Certificación Blockchain para Joyería"
      width="160"
      height="auto"
      style={logo}
    />
    <Heading style={headerTitle}>{title}</Heading>
  </Section>
);

// Styles siguiendo la identidad Veralix
const headerSection = {
  backgroundColor: "#F5F5F5",
  padding: "40px 48px 32px",
  textAlign: "center" as const,
  borderBottom: "3px solid #C9A961", // Línea dorada corporativa
};

const logo = {
  margin: "0 auto 20px",
  display: "block",
};

const headerTitle = {
  color: "#1A1A1A", // Negro corporativo
  fontSize: "28px",
  fontWeight: "bold",
  margin: "0",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};
