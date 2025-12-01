import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Gem, ArrowLeft, Calendar, Mail, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VeralixLogo } from "@/components/ui/veralix-logo";

const Privacy = () => {
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
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold font-heading mb-4">
              Política de Privacidad
            </h1>
            <div className="flex items-center justify-center space-x-4 text-muted-foreground mb-6">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Última actualización: 15 de enero, 2024</span>
              </div>
            </div>
             <div className="flex items-center justify-center space-x-2 text-primary">
               <Shield className="w-4 h-4" />
               <span className="text-sm">Sus datos están protegidos con cifrado de nivel empresarial</span>
             </div>
          </div>

          <div className="space-y-8">
            {/* Introduction */}
            <Card className="shadow-premium border-border/50">
              <CardContent className="pt-6">
                <p className="text-muted-foreground">
                  En Veralix, respetamos su privacidad y nos comprometemos a proteger sus datos personales. 
                  Esta Política de Privacidad explica cómo recopilamos, utilizamos, almacenamos y 
                  protegemos su información cuando utiliza nuestros servicios de certificación NFT.
                </p>
              </CardContent>
            </Card>

            {/* Section 1 */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">1. Información que Recopilamos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1.1 Información de Cuenta</h4>
                  <ul className="text-muted-foreground space-y-1 pl-4">
                    <li>• Nombre de contacto y nombre de la joyería</li>
                    <li>• Dirección de correo electrónico</li>
                    <li>• Número de teléfono</li>
                    <li>• Dirección física del negocio</li>
                    <li>• Información de identificación fiscal (NIT/RUT)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">1.2 Información de Joyería</h4>
                  <ul className="text-muted-foreground space-y-1 pl-4">
                    <li>• Fotografías de las piezas de joyería</li>
                    <li>• Descripciones y especificaciones técnicas</li>
                    <li>• Materiales utilizados y origen</li>
                    <li>• Precios de venta</li>
                    <li>• Información del artesano o fabricante</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">1.3 Datos Técnicos</h4>
                  <ul className="text-muted-foreground space-y-1 pl-4">
                    <li>• Dirección IP y ubicación geográfica</li>
                    <li>• Información del navegador y dispositivo</li>
                    <li>• Registros de actividad en la plataforma</li>
                    <li>• Datos de transacciones blockchain</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Section 2 */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">2. Cómo Utilizamos su Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">2.1 Prestación del Servicio</h4>
                  <ul className="text-muted-foreground space-y-1 pl-4">
                    <li>• Generar y gestionar certificados NFT</li>
                    <li>• Proporcionar acceso a su dashboard personalizado</li>
                    <li>• Procesar pagos y facturación</li>
                    <li>• Ofrecer soporte técnico</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2.2 Comunicación</h4>
                  <ul className="text-muted-foreground space-y-1 pl-4">
                    <li>• Enviar notificaciones sobre el estado de certificaciones</li>
                    <li>• Informar sobre actualizaciones del servicio</li>
                    <li>• Responder a consultas de soporte</li>
                    <li>• Enviar reportes mensuales (opcional)</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2.3 Mejora del Servicio</h4>
                  <ul className="text-muted-foreground space-y-1 pl-4">
                    <li>• Analizar patrones de uso para mejorar la plataforma</li>
                    <li>• Desarrollar nuevas funcionalidades</li>
                    <li>• Prevenir fraude y garantizar seguridad</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Section 3 */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">3. Compartir Información</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">3.1 Información Pública en Blockchain</h4>
                  <p className="text-muted-foreground">
                    Los metadatos del NFT (información de la joya, materiales, fecha) 
                    se almacenan en blockchain público y son visibles para cualquiera 
                    que verifique el certificado. No incluimos información personal 
                    del propietario en estos metadatos.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3.2 Proveedores de Servicios</h4>
                  <p className="text-muted-foreground">
                    Compartimos información limitada con proveedores confiables que 
                    nos ayudan a operar el servicio (procesadores de pago, servicios 
                    de almacenamiento en la nube, proveedores de email).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3.3 Requerimientos Legales</h4>
                  <p className="text-muted-foreground">
                    Podemos divulgar información cuando sea requerido por ley, 
                    orden judicial o autoridades gubernamentales competentes.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4 */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">4. Seguridad de Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">4.1 Medidas Técnicas</h4>
                  <ul className="text-muted-foreground space-y-1 pl-4">
                    <li>• Cifrado AES-256 para datos en reposo</li>
                    <li>• Cifrado TLS 1.3 para datos en tránsito</li>
                    <li>• Autenticación multifactor disponible</li>
                    <li>• Auditorías de seguridad regulares</li>
                    <li>• Respaldos automatizados y seguros</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">4.2 Medidas Organizacionales</h4>
                  <ul className="text-muted-foreground space-y-1 pl-4">
                    <li>• Acceso restringido basado en roles</li>
                    <li>• Capacitación regular del personal en seguridad</li>
                    <li>• Políticas estrictas de manejo de datos</li>
                    <li>• Monitoreo continuo de actividades sospechosas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Section 5 */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">5. Sus Derechos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">5.1 Acceso y Rectificación</h4>
                  <p className="text-muted-foreground">
                    Puede acceder, actualizar o corregir su información personal 
                    en cualquier momento desde su panel de control.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">5.2 Eliminación</h4>
                  <p className="text-muted-foreground">
                    Puede solicitar la eliminación de su cuenta y datos personales. 
                    Note que los NFTs ya generados permanecerán en blockchain 
                    por su naturaleza inmutable.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">5.3 Portabilidad</h4>
                  <p className="text-muted-foreground">
                    Puede solicitar una copia de sus datos en formato estructurado 
                    y legible para transferir a otros servicios.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">5.4 Objeción</h4>
                  <p className="text-muted-foreground">
                    Puede oponerse al procesamiento de sus datos para fines de 
                    marketing directo en cualquier momento.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 6 */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">6. Cookies y Tecnologías Similares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">6.1 Cookies Esenciales</h4>
                  <p className="text-muted-foreground">
                    Utilizamos cookies necesarias para el funcionamiento básico 
                    de la plataforma, como mantener su sesión activa.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">6.2 Cookies Analíticas</h4>
                  <p className="text-muted-foreground">
                    Con su consentimiento, utilizamos cookies para analizar 
                    el uso de la plataforma y mejorar la experiencia del usuario.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 7 */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">7. Retención de Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Conservamos su información personal solo durante el tiempo necesario 
                  para cumplir con los propósitos descritos en esta política, 
                  salvo que la ley requiera un período de retención más largo. 
                  Los datos de facturación se conservan según los requisitos 
                  contables y fiscales aplicables.
                </p>
              </CardContent>
            </Card>

            {/* Section 8 */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">8. Transferencias Internacionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Sus datos pueden ser procesados en servidores ubicados fuera 
                  de su país de residencia. Garantizamos que todas las 
                  transferencias se realizan con las medidas de seguridad 
                  apropiadas y en cumplimiento con las leyes aplicables.
                </p>
              </CardContent>
            </Card>

            {/* Section 9 */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="font-heading">9. Cambios en la Política</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Nos reservamos el derecho de actualizar esta Política de Privacidad. 
                  Le notificaremos sobre cambios significativos por email o 
                  mediante aviso en nuestra plataforma. El uso continuado 
                  de nuestros servicios constituye aceptación de los cambios.
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card className="shadow-premium border-border/50 bg-gradient-subtle">
              <CardHeader>
                <CardTitle className="font-heading">Contacto - Oficial de Protección de Datos</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Si tiene preguntas sobre esta Política de Privacidad o desea 
                  ejercer sus derechos de protección de datos, contáctenos:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>privacidad@veralix.io</span>
                  </div>
                   <div className="flex items-center space-x-2">
                     <Shield className="w-4 h-4 text-primary" />
                     <span>Oficial de Protección de Datos - Veralix SAS</span>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;