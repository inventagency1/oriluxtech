import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Mail, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VeralixLogo } from "@/components/ui/veralix-logo";

export default function PartnershipAgreement() {
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
          <h1 className="text-4xl font-bold mb-4">Contrato Marco de Colaboración y Alianza Estratégica</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2 mb-3">
            <Calendar className="w-4 h-4" />
            Versión Internacional 2025
          </p>
          <Badge variant="secondary" className="mb-4">
            <Building2 className="w-3 h-3 mr-1" />
            Aceptación Digital
          </Badge>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Entre <strong>Orilux Tech S.A.S.</strong> (Marca Veralix) y la Joyería Aliada
          </p>
        </div>

        <div className="space-y-8">
          <Card className="shadow-premium border-border/50 bg-accent/10">
            <CardContent className="p-6">
              <p className="text-foreground/90">
                El presente Contrato Marco de Colaboración y Alianza Estratégica ("el Contrato") se celebra entre <strong>Orilux Tech S.A.S.</strong>, sociedad legalmente constituida bajo las leyes de la República de Colombia, identificada con <strong>NIT 901.988.949-2</strong>, con domicilio en Bogotá D.C., titular de la marca y del ecosistema tecnológico <strong>VERALIX</strong>, en adelante denominada <strong>"Orilux Tech"</strong> o <strong>"Veralix"</strong>; y de otra parte, la <strong>Joyería Aliada</strong>, persona jurídica o natural que participa en el programa de alianzas de Veralix, en adelante denominada <strong>"El Colaborador"</strong> o <strong>"La Joyería Asociada"</strong>.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>1. OBJETO DEL CONTRATO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                El presente Contrato tiene por objeto establecer las condiciones generales de colaboración entre Orilux Tech y la Joyería Asociada para el desarrollo conjunto de acciones comerciales, tecnológicas y de posicionamiento relacionadas con el ecosistema <strong>Veralix</strong>, incluyendo la promoción del sello digital de autenticidad, la integración de tecnología blockchain en procesos de certificación y la participación en campañas o eventos de la marca.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>2. NATURALEZA DE LA RELACIÓN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                Las partes reconocen que esta alianza no constituye una sociedad, joint venture, franquicia ni relación laboral. Cada parte conserva plena independencia jurídica, financiera y operativa. Ninguna de las partes podrá representar o comprometer a la otra sin autorización escrita.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>3. COMPROMISOS DE VERALIX / ORILUX TECH</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                Orilux Tech, como titular de la marca Veralix, se compromete a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Proveer acceso al ecosistema tecnológico Veralix, incluyendo certificados digitales, herramientas de trazabilidad y el Marketplace</li>
                <li>Autorizar el uso del sello digital "Powered by Veralix" para piezas certificadas</li>
                <li>Brindar acompañamiento técnico y soporte durante la implementación</li>
                <li>Incluir a la Joyería Asociada en campañas de comunicación o promoción, de mutuo acuerdo</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>4. COMPROMISOS DE LA JOYERÍA ASOCIADA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                La Joyería Asociada se compromete a:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Mantener los estándares de calidad, transparencia y legitimidad exigidos por Veralix</li>
                <li>Utilizar los certificados digitales únicamente a través de la infraestructura oficial</li>
                <li>Participar en las capacitaciones o auditorías de trazabilidad programadas</li>
                <li>No incurrir en prácticas que afecten la reputación o credibilidad de la marca</li>
                <li>Respetar las políticas de confidencialidad, privacidad y cumplimiento (KYC/AML)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>5. EXCLUSIVIDAD Y TERRITORIO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                En caso de otorgarse exclusividad territorial, esta deberá ser formalizada mediante un anexo específico. La Joyería Asociada no podrá representar ni promocionar marcas competidoras que ofrezcan certificaciones digitales equivalentes sin consentimiento previo de Orilux Tech.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>6. BENEFICIOS Y CO-BRANDING</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                La alianza podrá incluir beneficios como:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Presencia destacada en el Marketplace Veralix</li>
                <li>Participación en ferias, vitrinas o eventos co-patrocinados</li>
                <li>Uso compartido de materiales visuales de la marca</li>
                <li>Acceso preferente a desarrollos tecnológicos, actualizaciones o versiones beta</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>7. PROPIEDAD INTELECTUAL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                Toda la propiedad intelectual, marcas, software, diagramas, certificados NFT, documentación y demás materiales asociados al ecosistema Veralix son propiedad exclusiva de Orilux Tech S.A.S. El uso por parte del Colaborador no implica cesión, licencia perpetua ni transferencia de derechos, salvo los expresamente autorizados.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>8. CONFIDENCIALIDAD</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                Las partes se comprometen a mantener la confidencialidad sobre toda la información técnica, comercial y estratégica compartida durante la ejecución de este Contrato. Este compromiso permanecerá vigente durante la relación contractual y por un periodo adicional de cinco (5) años después de su terminación.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>9. CUMPLIMIENTO Y CONDUCTA ÉTICA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                La Joyería Asociada declara cumplir las normas locales e internacionales sobre prevención de lavado de activos, financiación del terrorismo y comercio justo. Se obliga a cooperar con las políticas SARLAFT y KYC de Veralix y a reportar cualquier operación sospechosa o irregularidad detectada.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>10. DURACIÓN Y TERMINACIÓN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                El presente Contrato tendrá una vigencia inicial de dos (2) años, prorrogable automáticamente por períodos iguales, salvo notificación en contrario con treinta (30) días de antelación. Podrá darse por terminado anticipadamente en caso de incumplimiento, fraude, daño reputacional o fuerza mayor.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>11. ACEPTACIÓN DIGITAL Y VALIDEZ JURÍDICA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                Este contrato podrá ser firmado electrónicamente o aceptado digitalmente dentro de la plataforma veralix.io. La aceptación digital genera efectos jurídicos equivalentes a la firma manuscrita, conforme a la Ley 527 de 1999 (Colombia) y estándares internacionales eIDAS / ESIGN Act.
              </p>
              <p className="text-foreground/90">
                La plataforma conservará registro de aceptación mediante identificación del usuario, dirección IP, wallet, fecha, hora y hash de validación del contrato.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>12. LEGISLACIÓN APLICABLE Y JURISDICCIÓN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                El presente Contrato se rige por las leyes de la República de Colombia y por los principios internacionales de derecho comercial y propiedad intelectual. Las controversias se resolverán mediante conciliación o arbitraje en Bogotá D.C., salvo acuerdo diferente entre las partes.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-premium border-border/50 bg-gradient-subtle mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contacto de Alianzas
            </h3>
            <p className="text-foreground/90 mb-2">
              <strong>© 2025 Orilux Tech S.A.S.</strong> – Marca VERALIX | NIT 901.988.949-2 | Bogotá D.C., Colombia
            </p>
            <div className="space-y-1 mt-4">
              <p className="text-foreground/90">
                Alianzas estratégicas: <a href="mailto:alianzas@veralix.io" className="text-primary hover:underline font-medium">alianzas@veralix.io</a>
              </p>
              <p className="text-foreground/90">
                Asuntos legales: <a href="mailto:legal@oriluxtech.com" className="text-primary hover:underline font-medium">legal@oriluxtech.com</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
