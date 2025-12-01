import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, Mail, Award } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VeralixLogo } from "@/components/ui/veralix-logo";

export default function BrandLicense() {
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
          <h1 className="text-4xl font-bold mb-4">Acuerdo de Uso de Marca y Licencia Digital – VERALIX</h1>
          <p className="text-muted-foreground flex items-center justify-center gap-2 mb-3">
            <Calendar className="w-4 h-4" />
            Versión Internacional 2025
          </p>
          <Badge variant="secondary" className="mb-4">
            <Award className="w-3 h-3 mr-1" />
            Adaptado para aceptación digital en veralix.io
          </Badge>
        </div>

        <div className="space-y-8">
          <Card className="shadow-premium border-border/50 bg-accent/10">
            <CardContent className="p-6">
              <p className="text-foreground/90">
                Al aceptar digitalmente este acuerdo, la joyería o entidad licenciataria reconoce haber leído, comprendido y aceptado en su totalidad los siguientes términos. Esta aceptación electrónica tiene la misma validez jurídica que una firma manuscrita, conforme a la Ley 527 de 1999 (Colombia) y a los estándares internacionales de firma digital (UNCITRAL, eIDAS, ESIGN Act).
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>1. PARTES CONTRATANTES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                <strong>Orilux Tech S.A.S.</strong>, sociedad legalmente constituida en Colombia (<strong>NIT 901.988.949-2</strong>), con domicilio en Bogotá D.C., en adelante <strong>"El Titular"</strong> o <strong>"Orilux Tech"</strong>, propietaria de la marca y del ecosistema tecnológico Veralix.
              </p>
              <p className="text-foreground/90">
                Y la <strong>Joyería Licenciataria</strong>, persona natural o jurídica registrada en la plataforma Veralix, en adelante <strong>"El Licenciatario"</strong> o <strong>"La Joyería Certificada"</strong>.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>2. OBJETO DEL ACUERDO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                El presente acuerdo otorga al Licenciatario una <strong>licencia limitada, no exclusiva, no transferible y revocable</strong> sobre los signos distintivos, logotipos, emblemas, materiales visuales y sellos digitales que componen la marca <strong>VERALIX</strong>, propiedad exclusiva de Orilux Tech S.A.S.
              </p>
              <p className="text-foreground/90">
                La licencia se concede exclusivamente para fines de autenticación, trazabilidad y promoción de piezas de joyería certificadas dentro del ecosistema Veralix, incluyendo el uso del sello digital Veralix, los certificados NFT y los materiales visuales aprobados por Orilux Tech.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>3. TITULARIDAD Y PROPIEDAD INTELECTUAL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                Orilux Tech S.A.S. es titular única y exclusiva de todos los derechos sobre la marca VERALIX, logotipos, software, sellos digitales, infraestructura tecnológica, NFTs y materiales visuales o técnicos asociados. Esta licencia no confiere derechos de propiedad, registro o cesión sobre dichos activos.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>4. ALCANCE Y LIMITACIONES</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                El Licenciatario podrá utilizar la marca VERALIX únicamente para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Exhibir el sello digital Veralix en joyas certificadas oficialmente</li>
                <li>Mostrar la insignia "Powered by Veralix" en vitrinas, empaques o sitios web</li>
                <li>Utilizar los logotipos aprobados en campañas de marketing previamente validadas</li>
              </ul>
              <p className="text-foreground/90 mt-4">
                Queda expresamente prohibido:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Modificar o distorsionar el logotipo o los certificados digitales</li>
                <li>Emitir certificados o NFTs fuera de la infraestructura Veralix</li>
                <li>Usar la marca con fines no autorizados o ajenos al sector joyero</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>5. DURACIÓN Y REVOCACIÓN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                La licencia tiene una duración inicial de un (1) año, renovable automáticamente. Orilux Tech podrá revocar la licencia en cualquier momento por incumplimiento, uso indebido, fraude, daño reputacional o violación de políticas legales o contractuales.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>6. RESPONSABILIDADES DEL LICENCIATARIO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                El Licenciatario se compromete a mantener una reputación ética y comercial alineada con los valores de Veralix, cumplir los procesos de certificación y trazabilidad definidos por Orilux Tech, y abstenerse de realizar declaraciones o acciones que perjudiquen la imagen de la marca.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>7. CONFIDENCIALIDAD Y SEGURIDAD</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                Las partes mantendrán confidencialidad sobre la información técnica, comercial o estratégica compartida, incluyendo código fuente, infraestructura blockchain, contratos inteligentes, bases de datos y estrategias de negocio. La seguridad digital y la integridad de los sistemas son responsabilidad conjunta.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>8. ACEPTACIÓN DIGITAL Y VALIDEZ JURÍDICA</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                La aceptación digital del presente acuerdo tiene plena validez jurídica y constituye consentimiento expreso, equivalente a la firma manuscrita. Cada aceptación quedará registrada con los siguientes datos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                <li>Identificación del usuario o joyería</li>
                <li>Dirección IP y timestamp (fecha y hora exacta)</li>
                <li>Wallet asociada a la cuenta Veralix</li>
                <li>Hash criptográfico del texto legal almacenado en blockchain o servidor seguro</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>9. LEGISLACIÓN Y RESOLUCIÓN DE CONTROVERSIAS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                Este acuerdo se rige por las leyes de la República de Colombia y los principios internacionales de propiedad intelectual y comercio digital. Cualquier controversia será resuelta preferentemente por mecanismos alternativos de conciliación o arbitraje institucional en Bogotá D.C.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-premium border-border/50">
            <CardHeader>
              <CardTitle>10. REGISTRO DE ACEPTACIÓN DIGITAL</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/90">
                El sistema Veralix.io conservará un registro inmutable de la aceptación digital de este acuerdo, incluyendo los metadatos técnicos asociados, como prueba válida y verificable ante cualquier autoridad o tercero.
              </p>
              <p className="text-foreground/90 font-medium mt-4">
                Este documento no requiere firma física. La aceptación digital constituye ejecución plena del contrato entre Orilux Tech S.A.S. y la Joyería Licenciataria.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-premium border-border/50 bg-gradient-subtle mt-8">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Contacto de Licencias
            </h3>
            <p className="text-foreground/90 mb-2">
              <strong>© 2025 Orilux Tech S.A.S.</strong> – Marca y Ecosistema VERALIX<br />
              NIT 901.988.949-2 | Bogotá D.C., Colombia
            </p>
            <div className="space-y-1 mt-4">
              <p className="text-foreground/90">
                Asuntos legales: <a href="mailto:legal@veralix.io" className="text-primary hover:underline font-medium">legal@veralix.io</a>
              </p>
              <p className="text-foreground/90">
                Privacidad: <a href="mailto:privacidad@oriluxtech.com" className="text-primary hover:underline font-medium">privacidad@oriluxtech.com</a>
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
