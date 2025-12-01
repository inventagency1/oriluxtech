import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO, StructuredData } from "@/utils/seoHelpers";
import { 
  Gem, 
  Check, 
  Star, 
  Shield, 
  Zap, 
  Crown, 
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VeralixLogo } from "@/components/ui/veralix-logo";
import { useCertificatePackages } from "@/hooks/useCertificatePackages";

const Pricing = () => {
  const { packages, loading: packagesLoading, fetchPackages } = useCertificatePackages();

  useSEO({
    title: 'Paquetes de Certificados NFT | Veralix',
    description: 'Compra certificados NFT prepagados en paquetes desde COP $270.000. Sin suscripciones mensuales. Paga una vez, certifica tus joyas cuando quieras. Ahorra hasta 17%.',
    keywords: 'certificados NFT prepagados, paquetes blockchain joyería, comprar certificados NFT, precio certificación joyas',
    canonical: 'https://veralix.io/precios'
  });

  // Fetch packages only once on mount
  useEffect(() => {
    fetchPackages();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const getIconComponent = (iconName: string) => {
    switch(iconName) {
      case 'Star': return Star;
      case 'Crown': return Crown;
      case 'Gem':
      default: return Gem;
    }
  };

  const packagesOld = [
    {
      id: "pack-10",
      name: "Pack de 10 Certificados",
      certificates: 10,
      price: "270.000",
      pricePerCert: "27.000",
      savings: 0,
      description: "Ideal para comenzar o joyerías pequeñas",
      icon: Gem,
      color: "crypto-blue",
      features: [
        "10 Certificados NFT prepagados",
        "Blockchain Crestchain",
        "Soporte por email",
        "Dashboard completo",
        "Verificación pública + QR",
        "Sin expiración",
        "Usuarios ilimitados"
      ],
      popular: false
    },
    {
      id: "pack-50",
      name: "Pack de 50 Certificados",
      certificates: 50,
      price: "1.350.000",
      pricePerCert: "27.000",
      originalPrice: "1.350.000",
      savings: 0,
      description: "Perfecto para joyerías establecidas",
      icon: Star,
      color: "primary",
      features: [
        "50 Certificados NFT prepagados",
        "Blockchain Crestchain",
        "Soporte prioritario",
        "Dashboard con analytics",
        "Verificación pública + QR",
        "Sin expiración",
        "Usuarios ilimitados",
        "API access incluido"
      ],
      popular: true
    },
    {
      id: "pack-100",
      name: "Pack de 100 Certificados", 
      certificates: 100,
      price: "2.500.000",
      pricePerCert: "25.000",
      originalPrice: "2.700.000",
      savings: 200000,
      savingsPercent: 7,
      description: "Máximo volumen con mejor precio",
      icon: Crown,
      color: "secondary",
      features: [
        "100 Certificados NFT prepagados",
        "¡Ahorra COP $200.000!",
        "Blockchain Crestchain",
        "Soporte dedicado",
        "Dashboard premium + BI",
        "Verificación avanzada",
        "Sin expiración",
        "Usuarios ilimitados",
        "API completo",
        "Personalización de marca"
      ],
      popular: false
    }
  ];

  const getIconColor = (color: string) => {
    switch(color) {
      case "crypto-blue": return "text-crypto-blue";
      case "primary": return "text-primary";
      case "secondary": return "text-secondary";
      default: return "text-primary";
    }
  };

  const getGradient = (color: string) => {
    switch(color) {
      case "crypto-blue": return "bg-gradient-crypto";
      case "primary": return "bg-gradient-gold";
      case "secondary": return "bg-gradient-subtle";
      default: return "bg-gradient-gold";
    }
  };

  return (
    <>
      <StructuredData 
        type="Product" 
        data={{
          name: 'Paquetes de Certificados NFT Veralix',
          description: 'Certificados NFT prepagados para autenticación de joyería con blockchain',
          brand: {
            '@type': 'Brand',
            name: 'Veralix'
          },
          offers: packages.map(pkg => ({
            '@type': 'Offer',
            name: pkg.package_name,
            price: pkg.base_price.toString(),
            priceCurrency: pkg.currency,
            description: pkg.description,
            availability: 'https://schema.org/InStock'
          }))
        }} 
      />
      
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

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Paquetes de Certificados NFT
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Compra certificados prepagados y úsalos cuando quieras. Sin suscripciones mensuales.
            Paga una vez, certifica la autenticidad de tus joyas con blockchain. Sin expiración.
          </p>

          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex items-center space-x-2">
               <Shield className="w-5 h-5 text-primary" />
               <span className="text-sm">Blockchain Inmutable</span>
             </div>
             <div className="flex items-center space-x-2">
               <Zap className="w-5 h-5 text-primary" />
               <span className="text-sm">Generación Instantánea</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <span className="text-sm">Verificación Global</span>
            </div>
          </div>
        </section>

        {/* Package Cards */}
        <section className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16" aria-label="Paquetes de certificados">
          {packagesLoading ? (
            <div className="col-span-3 text-center py-16">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando paquetes...</p>
            </div>
          ) : packages.map((pkg) => {
            const IconComponent = getIconComponent(pkg.icon_name);
            return (
              <Card 
                key={pkg.id} 
                className={`relative hover:shadow-premium transition-premium ${
                  pkg.is_popular ? 'border-primary shadow-gold' : 'border-border/50'
                }`}
              >
                {pkg.is_popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-gold text-primary-foreground px-4 py-1">
                      Más Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 ${getGradient(pkg.color_scheme)} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <IconComponent className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-2xl font-heading">{pkg.package_name}</CardTitle>
                  <CardDescription className="text-base">{pkg.description}</CardDescription>
                  
                  <div className="py-4">
                    <div className="flex items-end justify-center mb-2">
                      <span className="text-sm text-muted-foreground">{pkg.currency} $</span>
                      <span className="text-4xl font-bold font-heading mx-1">{pkg.base_price.toLocaleString('es-CO')}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      ${pkg.price_per_certificate?.toLocaleString('es-CO')} por certificado
                    </div>
                    {pkg.savings_amount > 0 && (
                      <Badge variant="secondary" className="mt-2">
                        Ahorra {pkg.currency} ${pkg.savings_amount.toLocaleString('es-CO')}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    asChild
                    className={`w-full h-11 ${
                      pkg.is_popular 
                        ? 'bg-gradient-gold hover:shadow-gold' 
                        : 'border-border hover:bg-accent'
                    } transition-premium`}
                    variant={pkg.is_popular ? "default" : "outline"}
                  >
                    <Link to={`/checkout?package=${pkg.package_id}`}>
                      {pkg.is_popular ? "Comprar Paquete" : "Seleccionar Paquete"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </section>

        {/* Package Comparison */}
        <section className="max-w-4xl mx-auto mb-16" aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-3xl font-bold font-heading text-center mb-8">
            Comparación de Paquetes
          </h2>
          
          <Card className="shadow-premium border-border/50">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">Característica</th>
                      <th className="text-center p-4 font-semibold">Pack 10</th>
                      <th className="text-center p-4 font-semibold">Pack 50</th>
                      <th className="text-center p-4 font-semibold">Pack 100</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4">Certificados incluidos</td>
                      <td className="text-center p-4 font-semibold">10</td>
                      <td className="text-center p-4 font-semibold">50</td>
                      <td className="text-center p-4 font-semibold">100</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Precio por certificado</td>
                      <td className="text-center p-4">$27.000</td>
                      <td className="text-center p-4">$27.000</td>
                      <td className="text-center p-4 text-primary font-semibold">$25.000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Ahorro total</td>
                      <td className="text-center p-4">-</td>
                      <td className="text-center p-4">-</td>
                      <td className="text-center p-4 text-primary font-semibold">$200.000</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Blockchain</td>
                      <td className="text-center p-4">Crestchain</td>
                      <td className="text-center p-4">Crestchain</td>
                      <td className="text-center p-4">Crestchain</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">Usuarios Dashboard</td>
                      <td className="text-center p-4">Ilimitados</td>
                      <td className="text-center p-4">Ilimitados</td>
                      <td className="text-center p-4">Ilimitados</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4">API Access</td>
                      <td className="text-center p-4">❌</td>
                      <td className="text-center p-4">✅</td>
                      <td className="text-center p-4">✅ Completo</td>
                    </tr>
                    <tr>
                      <td className="p-4">Soporte</td>
                      <td className="text-center p-4">Email</td>
                      <td className="text-center p-4">Prioritario</td>
                      <td className="text-center p-4">Dedicado</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* FAQ Section */}
        <section className="max-w-3xl mx-auto" aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="text-3xl font-bold font-heading text-center mb-8">
            Preguntas Frecuentes
          </h2>
          
          <div className="space-y-6">
            {[
              {
                q: "¿Los certificados tienen fecha de expiración?",
                a: "No. Los certificados prepagados nunca expiran. Puedes usarlos cuando quieras, sin presión de tiempo ni fechas límite."
              },
              {
                q: "¿Puedo comprar más certificados después?",
                a: "Sí, en cualquier momento puedes comprar paquetes adicionales. Tu balance se acumula y puedes usar certificados de diferentes compras."
              },
              {
                q: "¿Hay descuentos por volumen?",
                a: "Sí. El Pack de 100 certificados tiene un precio especial de $25.000 por certificado (vs $27.000), ahorrándote COP $200.000 en total."
              },
              {
                q: "¿Qué pasa si me quedo sin certificados?",
                a: "Simplemente compras otro paquete cuando lo necesites. Recibirás una notificación cuando te queden pocos certificados disponibles."
              },
              {
                q: "¿Hay reembolsos?",
                a: "Los certificados prepagados no son reembolsables una vez comprados, pero nunca expiran y puedes transferirlos a otro usuario de tu organización."
              },
              {
                q: "¿Los certificados son válidos internacionalmente?",
                a: "Absolutamente. Al estar en blockchain público (Crestchain), los certificados son verificables globalmente desde cualquier país, 24/7."
              }
            ].map((faq, index) => (
              <Card key={index} className="shadow-premium border-border/50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold font-heading mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center mt-16" aria-label="Llamado a la acción">
          <h2 className="text-2xl font-bold font-heading mb-4">
            ¿Listo para autenticar tus joyas con blockchain?
          </h2>
          <p className="text-muted-foreground mb-6">
            Compra tu paquete de certificados y comienza hoy mismo. Sin suscripciones, sin complicaciones.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild className="bg-gradient-gold hover:shadow-gold transition-premium px-8">
              <Link to="/register">Crear Cuenta Gratis</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/verify">Ver Certificado Demo</Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
    </>
  );
};

export default Pricing;