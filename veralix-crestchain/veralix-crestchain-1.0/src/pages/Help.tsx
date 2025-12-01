import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MessageCircle, Book, Mail, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { AISupportChat } from "@/components/AISupportChat";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);

  const faqs = [
    {
      question: "¿Qué es un certificado NFT?",
      answer: "Un certificado NFT es un token digital único en blockchain que representa la autenticidad y propiedad de una joya. Es inmutable, transferible y verificable globalmente.",
    },
    {
      question: "¿Cómo creo un certificado para mi joya?",
      answer: "Para crear un certificado: 1) Registra tu joya con fotos y detalles, 2) Selecciona el plan de certificación, 3) Completa el pago, 4) Recibe tu certificado NFT con código QR.",
    },
    {
      question: "¿Cuánto cuesta certificar una joya?",
      answer: "Ofrecemos paquetes prepagados de certificados con descuentos por volumen. Visita nuestra página de Precios para ver los paquetes disponibles: Pack de 10, 50 o 100 certificados.",
    },
    {
      question: "¿Cómo verifico la autenticidad de una joya?",
      answer: "Puedes verificar una joya escaneando su código QR con tu smartphone o ingresando el ID del certificado en nuestra página de verificación. La información se valida contra blockchain.",
    },
    {
      question: "¿Puedo transferir el certificado a otro propietario?",
      answer: "Sí, los certificados NFT son transferibles. Ve a la sección de Certificados, selecciona la joya y usa la opción 'Transferir Certificado' para enviarla a otro usuario de Veralix.",
    },
    {
      question: "¿Qué blockchain utilizan?",
      answer: "Utilizamos Polygon (MATIC) por su bajo costo de transacción, velocidad y compatibilidad con estándares ERC-721. Esto garantiza certificaciones económicas y rápidas.",
    },
    {
      question: "¿Qué pasa si pierdo el código QR?",
      answer: "No hay problema. Puedes regenerar el código QR desde tu dashboard en cualquier momento. El certificado blockchain permanece intacto y verificable.",
    },
    {
      question: "¿Cómo funciona el marketplace?",
      answer: "El marketplace permite a joyerías listar sus piezas certificadas para venta. Los compradores pueden filtrar por tipo, precio, materiales y ver el historial de certificación blockchain.",
    },
  ];

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Centro de Ayuda</h1>
          <p className="text-muted-foreground">
            Encuentra respuestas a tus preguntas y aprende cómo usar Veralix
          </p>
        </div>

        {/* Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Buscar en la ayuda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Enlaces Rápidos */}
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/help/guides">
            <Card className="hover:shadow-veralix-gold transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-4">
                <Book className="h-8 w-8 mx-auto mb-2 text-veralix-gold" />
                <CardTitle className="text-lg font-heading">Guías</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  Tutoriales detallados paso a paso
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card 
            onClick={() => setIsAIChatOpen(true)}
            className="hover:shadow-veralix-gold transition-shadow cursor-pointer"
          >
            <CardHeader className="text-center pb-4">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 text-veralix-gold" />
              <CardTitle className="text-lg font-heading">Chat IA</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground">
                Asistente virtual inteligente
              </p>
            </CardContent>
          </Card>

          <a href="mailto:soporte@veralix.io">
            <Card className="hover:shadow-veralix-gold transition-shadow cursor-pointer h-full">
              <CardHeader className="text-center pb-4">
                <Mail className="h-8 w-8 mx-auto mb-2 text-veralix-gold" />
                <CardTitle className="text-lg font-heading">Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground">
                  soporte@veralix.io
                </p>
              </CardContent>
            </Card>
          </a>
        </div>

        {/* FAQs */}
        <Card>
          <CardHeader>
            <CardTitle>Preguntas Frecuentes</CardTitle>
            <CardDescription>
              Respuestas a las preguntas más comunes sobre Veralix
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No se encontraron resultados para "{searchQuery}"
              </div>
            )}
          </CardContent>
        </Card>

        {/* Guías Rápidas */}
        <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
              <CardTitle>Para Joyerías</CardTitle>
              <CardDescription>Guía rápida para certificar tus joyas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  1
                </div>
                <p className="text-sm">Registra tu joyería y completa tu perfil</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  2
                </div>
                <p className="text-sm">Carga información detallada de cada joya</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  3
                </div>
                <p className="text-sm">Genera certificados NFT para tus piezas</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  4
                </div>
                <p className="text-sm">Entrega códigos QR a tus clientes</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Ver Guía Completa
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Para Clientes</CardTitle>
              <CardDescription>Guía rápida para verificar tus joyas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  1
                </div>
                <p className="text-sm">Recibe tu joya con código QR</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  2
                </div>
                <p className="text-sm">Escanea el QR o ingresa el ID del certificado</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  3
                </div>
                <p className="text-sm">Visualiza toda la información verificada en blockchain</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                  4
                </div>
                <p className="text-sm">Transfiere la propiedad cuando vendas la joya</p>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Ver Guía Completa
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>¿No encontraste lo que buscabas?</CardTitle>
            <CardDescription>
              Nuestro equipo de soporte está listo para ayudarte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <a 
              href="mailto:soporte@veralix.io" 
              className="flex items-center gap-4 hover:text-primary transition-colors"
            >
              <Mail className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">soporte@veralix.io</p>
              </div>
            </a>
            <Button 
              className="w-full"
              onClick={() => setIsAIChatOpen(true)}
            >
              Contactar Soporte
            </Button>
          </CardContent>
        </Card>
      </div>

      <AISupportChat 
        isOpen={isAIChatOpen} 
        onOpenChange={setIsAIChatOpen}
      />
    </AppLayout>
  );
};

export default Help;
