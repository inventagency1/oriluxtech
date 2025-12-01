import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSEO, StructuredData, organizationSchema } from "@/utils/seoHelpers";
import { useHomepageStats } from "@/hooks/useHomepageStats";
import {
  Gem, 
  Shield, 
  Zap, 
  Users, 
  Trophy, 
  Target,
  Heart,
  Globe,
  ArrowLeft,
  Sparkles,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { VeralixLogo } from "@/components/ui/veralix-logo";

const About = () => {
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, []);

  useSEO({
    title: 'Sobre Veralix - Certificación NFT de Joyería | Nuestra Historia',
    description: 'Conoce la historia de Veralix, la primera plataforma de certificación NFT para joyería en Colombia. Tecnología blockchain al servicio de la autenticidad.',
    keywords: 'sobre veralix, historia blockchain joyería, certificación NFT Colombia, equipo veralix, misión visión',
    canonical: 'https://veralix.io/sobre-nosotros'
  });

  const features = [
    {
      icon: Shield,
      title: "Seguridad Inmutable",
      description: "Tecnología blockchain que garantiza certificados imposibles de falsificar"
    },
    {
      icon: Zap,
      title: "Generación Instantánea", 
      description: "Crea certificados NFT en segundos con nuestro flujo optimizado"
    },
    {
      icon: Globe,
      title: "Verificación Global",
      description: "Valida la autenticidad desde cualquier parte del mundo"
    },
    {
      icon: Users,
      title: "Fácil de Usar",
      description: "Interfaz intuitiva diseñada para joyerías, no para técnicos"
    }
  ];

  const { data: statsData } = useHomepageStats();

  const stats = [
    { number: statsData?.formattedStores || "...", label: "Joyerías Registradas" },
    { number: statsData?.formattedNfts || "...", label: "NFTs Generados" },
    { number: "98%", label: "Satisfacción del Cliente" },
    { number: "24/7", label: "Soporte Disponible" }
  ];

  const values = [
    {
      icon: Trophy,
      title: "Excelencia",
      description: "Nos comprometemos a ofrecer la mejor tecnología blockchain para joyerías"
    },
    {
      icon: Heart,
      title: "Confianza",
      description: "Construimos relaciones duraderas basadas en transparencia y resultados"
    },
    {
      icon: Target,
      title: "Innovación",
      description: "Pioneros en llevar la tecnología NFT al mundo de la joyería tradicional"
    }
  ];

  return (
    <>
      <StructuredData type="Organization" data={organizationSchema} />
      
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
          <Badge className="bg-gradient-gold text-primary-foreground mb-4">
            Sobre Veralix
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            El Futuro de la Certificación de Joyería
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Transformamos la industria joyera combinando la tradición artesanal 
            con la tecnología blockchain más avanzada, garantizando autenticidad 
            y trazabilidad para cada pieza única.
          </p>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16" aria-label="Estadísticas de Veralix">
          {stats.map((stat, index) => (
            <Card key={index} className="text-center shadow-premium border-border/50 hover:shadow-gold transition-premium">
              <CardContent className="pt-8 pb-6">
                <div className="text-3xl font-bold font-heading bg-gradient-gold bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Mission */}
        <div className="mb-16">
          <Card className="shadow-premium border-border/50 bg-gradient-subtle">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="text-3xl font-bold font-heading mb-4">Nuestra Misión</h2>
              <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
                Democratizar el acceso a la tecnología blockchain para joyerías de todos los tamaños, 
                proporcionando herramientas simples y poderosas que protejan la autenticidad de cada 
                pieza y fortalezcan la confianza entre joyerías y clientes en todo el mundo.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading mb-4">
              ¿Por qué elegir Veralix?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Combinamos años de experiencia en joyería con la tecnología más avanzada
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="shadow-premium border-border/50 hover:shadow-crypto transition-premium">
                  <CardContent className="pt-6">
                    <div className="flex items-start space-x-4">
                       <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center flex-shrink-0">
                         <IconComponent className="w-6 h-6 text-primary-foreground" />
                       </div>
                      <div>
                        <h3 className="font-semibold font-heading mb-2">{feature.title}</h3>
                        <p className="text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-heading mb-4">
              Nuestros Valores
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Los principios que guían cada decisión y cada línea de código que escribimos
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center shadow-premium border-border/50 hover:shadow-gold transition-premium">
                  <CardContent className="pt-8 pb-6">
                    <div className="w-16 h-16 bg-gradient-gold rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="font-semibold font-heading mb-3">{value.title}</h3>
                    <p className="text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Story */}
        <div className="mb-16">
          <Card className="shadow-premium border-border/50">
            <CardContent className="pt-8 pb-8">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold font-heading mb-6">
                    Nuestra Historia
                  </h2>
                  <div className="space-y-4 text-muted-foreground">
                    <p>
                      Veralix nació en 2024, impulsado por una necesidad clara en el sector joyero: 
                      recuperar la confianza y garantizar la autenticidad en un mercado cada vez más digital.
                    </p>
                    <p>
                      Durante años, la industria de la joyería ha enfrentado desafíos de falsificación, 
                      pérdida de trazabilidad y desconfianza del consumidor. Frente a esta realidad, 
                      un grupo de emprendedores e ingenieros en tecnología blockchain decidió crear 
                      una solución diseñada especialmente para proteger lo más valioso: la autenticidad de cada joya.
                    </p>
                    <p>
                      Tras meses de investigación, desarrollo y pruebas con joyerías reales, Veralix se prepara 
                      para su lanzamiento oficial como la primera plataforma de certificación digital privada 
                      enfocada en el sector joyero latinoamericano.
                    </p>
                    <p>
                      Nuestro propósito es claro: construir un nuevo estándar de confianza, donde cada joya 
                      pueda contar su historia con respaldo tecnológico y transparencia absoluta.
                    </p>
                    <p className="font-semibold text-veralix-gold">
                      Porque en el futuro de la joyería, la confianza también se certifica.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-veralix-gold" />
                    <span>2024 - Fundación de Veralix</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-veralix-gold" />
                    <span>Investigación y desarrollo de la plataforma</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-veralix-gold" />
                    <span>Pruebas con joyerías reales</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-veralix-gold" />
                    <span>Primera plataforma privada de certificación NFT en Latinoamérica</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-veralix-gold" />
                    <span>{statsData?.formattedNfts || "..."} NFTs generados exitosamente</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-veralix-gold" />
                    <span>{statsData?.formattedStores || "..."} joyerías en la plataforma</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Technology */}
        <div className="mb-16">
          <Card className="shadow-premium border-border/50 bg-gradient-crypto/10">
            <CardContent className="pt-8 pb-8 text-center">
              <h2 className="text-3xl font-bold font-heading mb-6">
                Tecnología de Vanguardia
              </h2>
              <p className="text-muted-foreground mb-8 max-w-3xl mx-auto">
                Utilizamos las blockchains más seguras y confiables del mundo para garantizar 
                que tus certificados sean inmutables y verificables por siempre.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                   <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center mx-auto mb-3">
                     <span className="font-bold text-primary-foreground">CRS</span>
                   </div>
                  <h3 className="font-semibold mb-2">Crestchain</h3>
                  <p className="text-sm text-muted-foreground">Red pública confiable y verificable globalmente</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-gold rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="font-bold text-primary-foreground">SOL</span>
                  </div>
                  <h3 className="font-semibold mb-2">Solana</h3>
                  <p className="text-sm text-muted-foreground">Rápida y eficiente para volúmenes altos</p>
                </div>
                
                <div className="text-center">
                   <div className="w-12 h-12 bg-gradient-premium rounded-lg flex items-center justify-center mx-auto mb-3">
                     <span className="font-bold text-secondary-foreground">POL</span>
                   </div>
                  <h3 className="font-semibold mb-2">Polygon</h3>
                  <p className="text-sm text-muted-foreground">Económica y amigable con el medio ambiente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold font-heading mb-4">
            ¿Listo para proteger tus joyas?
          </h2>
          <p className="text-muted-foreground mb-8">
            Únete a la revolución de la certificación digital y lleva tu joyería al siguiente nivel
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button asChild className="bg-gradient-gold hover:shadow-gold transition-premium px-8">
              <Link to="/register">Comenzar Gratis</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/pricing">Ver Planes</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
    </>
  );
};

export default About;