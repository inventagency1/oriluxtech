import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, Mail, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VeralixLogo } from "@/components/ui/veralix-logo";

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-fast"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link to="/" className="flex items-center gap-2">
              <VeralixLogo size={32} />
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">⚖ Aviso Legal General – VERALIX</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <Calendar className="w-4 h-4" />
            Versión 2025 – Orilux Tech S.A.S.
          </p>
        </div>

        <div className="space-y-8">
          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>⚖ Aviso Legal General</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                El presente aviso regula el acceso y uso del sitio web <strong>veralix.io</strong>, propiedad de <strong>Orilux Tech S.A.S.</strong>, sociedad legalmente constituida en Colombia con <strong>NIT 901.988.949-2</strong>, con domicilio en Bogotá D.C.
              </p>
              <p className="text-foreground/90">
                Al ingresar, navegar o utilizar los servicios de este sitio, el usuario declara haber leído, comprendido y aceptado las políticas y condiciones establecidas por Orilux Tech S.A.S., incluyendo la Política de Privacidad, los Términos y Condiciones, y los Acuerdos de Uso del Ecosistema Veralix.
              </p>
              <p className="text-foreground/90">
                Veralix es una plataforma tecnológica de certificación digital de autenticidad y trazabilidad de joyas, cuyo propósito es fortalecer la confianza y la legitimidad del mercado joyero mediante soluciones blockchain y digitales.
              </p>
              <p className="text-foreground/90">
                El acceso o uso indebido de la marca, el logotipo, los certificados digitales o la infraestructura tecnológica está prohibido y será sancionado conforme a la legislación aplicable sobre propiedad industrial, derechos de autor y comercio electrónico.
              </p>
              <p className="text-foreground/90">
                Orilux Tech S.A.S. se reserva el derecho de modificar los textos legales, políticas y condiciones sin previo aviso. Cualquier cambio será publicado en este mismo sitio y tendrá vigencia desde la fecha de actualización.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                🧠 Aviso de Propiedad Intelectual y Derechos Reservados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                <strong>Veralix</strong> es una marca registrada y un ecosistema tecnológico de autenticidad digital operado por <strong>Orilux Tech S.A.S.</strong>
              </p>
              <p className="text-foreground/90">
                Todos los derechos de propiedad intelectual, industrial y de software relacionados con la marca Veralix, sus logotipos, certificados digitales, interfaces, contenido visual, diagramas, arquitectura blockchain, textos y código fuente, son de titularidad exclusiva de Orilux Tech S.A.S.
              </p>
              <p className="text-foreground/90">
                Queda estrictamente prohibido:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Reproducir, distribuir, modificar o explotar total o parcialmente cualquier elemento del sitio sin autorización expresa y escrita de Orilux Tech</li>
                <li>Usar el logotipo Veralix o sus variaciones para fines comerciales o promocionales no autorizados</li>
                <li>Clonar, descompilar o alterar la infraestructura blockchain, los certificados NFT o los sistemas de validación digital del ecosistema</li>
              </ul>
              <p className="text-foreground/90 mt-4">
                El sello <strong>"Certificado Veralix de Autenticidad"</strong> es una marca de confianza registrada. Su uso indebido, falsificación o reproducción con fines comerciales constituye una infracción a los derechos de propiedad industrial, sancionada por la legislación colombiana y tratados internacionales vigentes.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-premium border-border/50 bg-gradient-subtle mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contacto Legal
            </h3>
            <p className="text-foreground/90 mb-4">
              <strong>© 2025 Orilux Tech S.A.S.</strong> – Todos los derechos reservados.<br />
              Bogotá D.C., Colombia<br />
              <strong>NIT:</strong> 901.988.949-2<br />
              Registrada ante la Cámara de Comercio de Bogotá y la Superintendencia de Industria y Comercio (SIC).
            </p>
            <div className="space-y-1">
              <p className="text-foreground/90">
                ✉ Consultas legales: <a href="mailto:legal@veralix.io" className="text-primary hover:underline font-medium">legal@veralix.io</a>
              </p>
              <p className="text-foreground/90">
                Cumplimiento: <a href="mailto:compliance@oriluxtech.com" className="text-primary hover:underline font-medium">compliance@oriluxtech.com</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
