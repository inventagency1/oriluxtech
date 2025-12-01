import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, ArrowLeft, Calendar, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VeralixLogo } from "@/components/ui/veralix-logo";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link 
            to="/" 
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-fast"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al inicio</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <div className="flex items-center space-x-2">
              <VeralixLogo size={32} />
              <span className="text-xl font-bold font-heading bg-gradient-gold bg-clip-text text-transparent">
                Veralix
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">📝 Términos y Condiciones de Uso – VERALIX</h1>
            <p className="text-muted-foreground flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Última actualización: Octubre de 2025
            </p>
            <p className="text-muted-foreground mt-2">
              El presente documento establece los Términos y Condiciones de Uso aplicables al acceso y utilización del ecosistema Veralix.
            </p>
          </div>

          <div className="space-y-8">
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>1. 🏢 ENTIDAD RESPONSABLE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  Veralix es un ecosistema digital desarrollado y administrado por <strong>Orilux Tech S.A.S.</strong>, sociedad legalmente constituida en Colombia, registrada ante la Cámara de Comercio de Bogotá bajo el <strong>NIT 901.988.949-2</strong>, con domicilio principal en Bogotá D.C., Colombia.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>2. 🎯 OBJETO Y ALCANCE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  Los presentes Términos regulan el acceso, uso y participación en:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                  <li>El ecosistema y plataforma web Veralix</li>
                  <li>El Marketplace para joyerías verificadas</li>
                  <li>Los sistemas de verificación blockchain</li>
                  <li>La emisión de certificados digitales de autenticidad (NFTs)</li>
                  <li>Las campañas de airdrops y otros servicios actuales o futuros desarrollados por Orilux Tech S.A.S.</li>
                </ul>
                <p className="text-foreground/90 mt-4">
                  Este acuerdo tiene alcance internacional, siendo aplicable a cualquier usuario que acceda o utilice los servicios desde cualquier país. Se rige conforme a normas internacionales de comercio electrónico, protección de datos y derecho digital, sin perjuicio de la legislación colombiana, que constituye la base jurídica principal para Orilux Tech S.A.S.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>3. 📚 DEFINICIONES</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  Para efectos de interpretación, se establecen las siguientes definiciones:
                </p>
                <ul className="list-none pl-0 space-y-3 text-foreground/90">
                  <li><strong>a) "Veralix":</strong> Ecosistema digital de autenticidad y trazabilidad de joyas, operado por Orilux Tech S.A.S.</li>
                  <li><strong>b) "Usuario":</strong> Persona natural o jurídica que accede, utiliza o interactúa con el ecosistema Veralix.</li>
                  <li><strong>c) "Joyería Verificada":</strong> Comercio autorizado por Orilux Tech para emitir certificados digitales o listar piezas en el Marketplace.</li>
                  <li><strong>d) "Certificado Veralix" / "NFT de Autenticidad":</strong> Documento digital único, inscrito en blockchain, que acredita la autenticidad de una pieza de joyería. No posee valor financiero.</li>
                  <li><strong>e) "Marketplace Veralix":</strong> Plataforma digital de exhibición e intercambio de piezas certificadas.</li>
                  <li><strong>f) "Blockchain":</strong> Infraestructura tecnológica descentralizada utilizada para el registro seguro e inmutable de información.</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>4. 👤 REGISTRO Y USO DE LA PLATAFORMA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  Para acceder a funcionalidades avanzadas (como emisión de certificados, participación en el Marketplace o recepción de airdrops), el usuario deberá:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                  <li>Crear una cuenta en Veralix</li>
                  <li>Aceptar íntegramente estos Términos y Condiciones</li>
                  <li>Completar los procesos de verificación KYC/AML cuando corresponda</li>
                </ul>
                <p className="text-foreground/90 mt-4">
                  El usuario es único responsable de la veracidad de la información proporcionada y de la custodia de sus credenciales y claves privadas. Veralix no tiene acceso ni controla wallets personales ni claves asociadas a certificados digitales emitidos.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>5. 🧠 PROPIEDAD INTELECTUAL E INDUSTRIAL</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  Todo el contenido del ecosistema Veralix —incluyendo marcas, logotipos, código fuente, interfaces, certificados digitales, documentación, textos, imágenes y software— es propiedad exclusiva de Orilux Tech S.A.S. y está protegido por las leyes nacionales e internacionales de propiedad intelectual.
                </p>
                <p className="text-foreground/90">
                  El uso del ecosistema no otorga derechos de propiedad intelectual sobre la marca Veralix ni sobre sus contenidos, salvo autorización previa, expresa y escrita de Orilux Tech.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>6. 💎 CERTIFICADOS DIGITALES (NFT VERALIX)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  Cada Certificado Veralix representa un registro digital único de autenticidad y trazabilidad, emitido como un token no fungible (NFT) en una o más redes blockchain compatibles.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                  <li>Estos certificados no constituyen instrumentos financieros, valores, inversiones ni derechos económicos sobre la pieza certificada</li>
                  <li>Su única finalidad es acreditar autenticidad, procedencia y trazabilidad, sin valor monetario</li>
                  <li>Orilux Tech se reserva el derecho de revocar, suspender o anular certificados en casos de fraude, falsificación, errores de información o incumplimientos contractuales</li>
                </ul>
                <p className="text-foreground/90 mt-4">
                  En futuras fases del proyecto, los certificados podrán incorporar funciones extendidas (ej. interoperabilidad, tokenización avanzada), sin alterar su carácter original de autenticidad.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>7. 🛍 MARKETPLACE Y OPERACIONES ENTRE USUARIOS</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  El Marketplace Veralix permite a joyerías verificadas listar piezas certificadas, y a usuarios consultarlas o adquirirlas. Orilux Tech no actúa como intermediario financiero ni custodio de fondos o criptomonedas; las transacciones se realizan directamente entre las partes.
                </p>
                <p className="text-foreground/90">
                  Los usuarios eximen a Orilux Tech de cualquier responsabilidad derivada de:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                  <li>Fallos en la red blockchain</li>
                  <li>Errores de transacción</li>
                  <li>Variaciones de precio</li>
                  <li>Desacuerdos comerciales entre terceros</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>8. ⚠ DESCARGO DE RESPONSABILIDAD</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  El uso del ecosistema Veralix es bajo entera responsabilidad del usuario. Orilux Tech S.A.S. no garantiza disponibilidad continua ni se responsabiliza por:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-foreground/90">
                  <li>Pérdidas causadas por caídas del sistema, ataques informáticos o fallos de red</li>
                  <li>Vulnerabilidades inherentes a la tecnología blockchain</li>
                  <li>Tasaciones de joyas o determinación de valor económico de certificados</li>
                </ul>
                <p className="text-foreground/90 mt-4">
                  Cualquier valoración económica es determinada libremente entre las partes fuera de la plataforma.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>9. ⚖ CUMPLIMIENTO Y JURISDICCIÓN APLICABLE</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  Este documento se rige por los principios del derecho comercial digital y la protección de datos global. Sin perjuicio de lo anterior, cualquier controversia se someterá preferentemente a la legislación de la República de Colombia y a la jurisdicción de los tribunales de Bogotá D.C., salvo acuerdo distinto entre las partes.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle>10. 📝 MODIFICACIONES Y VIGENCIA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/90">
                  Orilux Tech S.A.S. podrá modificar estos Términos en cualquier momento. La versión actualizada será publicada en veralix.io. Los cambios entrarán en vigor treinta (30) días después de su publicación o notificación al usuario.
                </p>
              </CardContent>
            </Card>
          </div>

          <Card className="shadow-premium border-border/50 bg-gradient-subtle mt-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                📬 AVISO FINAL Y CONTACTO
              </h3>
              <p className="text-foreground/90 mb-2">
                <strong>Veralix © 2025</strong> – Todos los derechos reservados.
              </p>
              <p className="text-foreground/90 mb-4">
                Desarrollado y administrado por <strong>Orilux Tech S.A.S.</strong> | NIT 901.988.949-2 | Bogotá D.C., Colombia
              </p>
              <div className="space-y-1">
                <p className="text-foreground/90">
                  📧 Contacto legal: <a href="mailto:legal@veralix.io" className="text-primary hover:underline font-medium">legal@veralix.io</a>
                </p>
                <p className="text-foreground/90">
                  Soporte: <a href="mailto:soporte@oriluxtech.com" className="text-primary hover:underline font-medium">soporte@oriluxtech.com</a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Terms;