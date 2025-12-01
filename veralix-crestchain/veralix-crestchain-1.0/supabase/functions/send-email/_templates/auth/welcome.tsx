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

interface WelcomeEmailProps {
  userName: string;
  userEmail: string;
  userRole?: 'joyero' | 'cliente';
  logoUrl?: string;
  websiteUrl?: string;
}

export const WelcomeEmail = ({
  userName = "Usuario",
  userEmail = "",
  userRole = "cliente",
  logoUrl = "https://veralix.io/veralix-logo-email.png",
  websiteUrl = "https://veralix.io",
}: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>¡Bienvenido a Veralix! 🎉</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader title="¡Bienvenido a Veralix! 💎" logoUrl={logoUrl} />
        
        <Text style={text}>
          Hola <strong>{userName}</strong>,
        </Text>

        <Text style={text}>
          Estamos emocionados de tenerte en Veralix, la plataforma líder en certificación NFT para joyería de lujo.
        </Text>

        {userRole === 'joyero' ? (
          <>
            <Section style={highlightBox}>
              <Text style={highlightText}>
                🎨 <strong>Tu cuenta de Joyero está activa</strong>
              </Text>
              <Text style={text}>
                Ahora puedes:
              </Text>
              <ul style={list}>
                <li>Registrar tus piezas de joyería únicas</li>
                <li>Generar certificados NFT de autenticidad</li>
                <li>Vender en el marketplace de Veralix</li>
                <li>Gestionar tu inventario digital</li>
              </ul>
            </Section>

            <Text style={text}>
              <strong>Primeros pasos recomendados:</strong>
            </Text>
            <ol style={list}>
              <li>Completa tu perfil de joyero</li>
              <li>Registra tu primera pieza de joyería</li>
              <li>Genera tu primer certificado NFT</li>
              <li>Explora el marketplace</li>
            </ol>
          </>
        ) : (
          <>
            <Section style={highlightBox}>
              <Text style={highlightText}>
                🛍️ <strong>Tu cuenta de Cliente está activa</strong>
              </Text>
              <Text style={text}>
                Ahora puedes:
              </Text>
              <ul style={list}>
                <li>Explorar joyería certificada con NFT</li>
                <li>Comprar piezas únicas en el marketplace</li>
                <li>Verificar la autenticidad de tus joyas</li>
                <li>Gestionar tus certificados digitales</li>
              </ul>
            </Section>

            <Text style={text}>
              <strong>Primeros pasos recomendados:</strong>
            </Text>
            <ol style={list}>
              <li>Completa tu perfil</li>
              <li>Explora el marketplace</li>
              <li>Verifica un certificado NFT</li>
              <li>Descubre piezas únicas</li>
            </ol>
          </>
        )}

        <Text style={text}>
          <strong>¿Necesitas ayuda?</strong> Nuestro equipo está aquí para apoyarte.
        </Text>

        <Section style={buttonContainer}>
          <Link href={`${websiteUrl}/dashboard`} style={button}>
            Ir a mi Dashboard
          </Link>
        </Section>

        <EmailFooter websiteUrl={websiteUrl} />
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

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
  borderLeft: "4px solid #C9A961",
  margin: "24px 48px",
  padding: "16px 20px",
};

const highlightText = {
  color: "#1A1A1A",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 12px 0",
};

const list = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "26px",
  marginLeft: "48px",
  marginRight: "48px",
};


const buttonContainer = {
  textAlign: "center" as const,
  margin: "32px 0",
};

const button = {
  backgroundColor: "#C9A961", // Oro Veralix
  borderRadius: "8px",
  color: "#1A1A1A", // Negro corporativo
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
};

