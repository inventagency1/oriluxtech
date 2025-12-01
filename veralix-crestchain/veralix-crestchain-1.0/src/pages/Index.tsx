import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Zap, Globe, Upload, FileCheck, Share, User, LogOut, Smartphone, Check, Mail, Phone, MapPin, HelpCircle, Lock, Building2, Award, RefreshCw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VeralixLogo } from "@/components/ui/veralix-logo";
import { AnimatedLogo } from "@/components/ui/animated-logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useHomepageStats } from "@/hooks/useHomepageStats";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSEO, StructuredData, organizationSchema } from "@/utils/seoHelpers";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

const Index = () => {
  const { user, signOut } = useAuth();
  const { role, isJoyero, isCliente } = useUserRole();
  const { data: stats, isLoading: statsLoading } = useHomepageStats();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleRefreshStats = () => {
    queryClient.invalidateQueries({ queryKey: ["homepage-stats"] });
  };
  
  useSEO({
    title: 'Veralix - Certificación NFT Premium de Joyería | Blockchain Colombia',
    description: 'Certifica la autenticidad de tus joyas con tecnología blockchain NFT. La primera plataforma en Colombia para joyerías. Verificación instantánea, inmutable y global.',
    keywords: 'certificación NFT joyería, blockchain Colombia, autenticidad joyas, certificados digitales, NFT oro, NFT diamantes, verificación blockchain',
    canonical: 'https://veralix.io/'
  });

  // Header Component
  const Header = () => (
    <header className="w-full py-4 sm:py-6 px-4 sm:px-6 flex justify-between items-center bg-background/80 backdrop-blur-sm border-b border-border/20">
      <div className="flex items-center space-x-2 sm:space-x-3">
        <VeralixLogo size={28} className="sm:w-8 sm:h-8" />
        <span className="text-xl sm:text-2xl font-bold text-foreground">Veralix</span>
      </div>
      
      <nav className="hidden md:flex items-center space-x-8">
        <a href="#features" className="text-muted-foreground hover:text-primary transition-colors hover:glow-primary">
          Certificación
        </a>
        <Link to="/marketplace" className="text-muted-foreground hover:text-primary transition-colors hover:glow-primary">
          Marketplace
        </Link>
        <a href="#features" className="text-muted-foreground hover:text-primary transition-colors hover:glow-primary">
          Verificación
        </a>
        <Link to="/pricing" className="text-muted-foreground hover:text-primary transition-colors hover:glow-primary">
          Precios
        </Link>
        <a href="#verify" className="text-muted-foreground hover:text-primary transition-colors hover:glow-primary">
          Más
        </a>
      </nav>
      
      <div className="flex items-center space-x-2 sm:space-x-4">
        <ThemeToggle />
        {user ? (
          <div className="flex items-center space-x-2">
            {role && (
              <Badge variant="secondary" className="hidden md:inline-flex">
                {isJoyero ? 'Joyero' : isCliente ? 'Cliente' : role}
              </Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hover:glow-primary">
                  <User className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">
                    {user.email?.split('@')[0] || 'Perfil'}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-56 bg-background/95 backdrop-blur-sm border border-border/50"
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.email}</p>
                  {role && (
                    <p className="text-xs text-muted-foreground">
                      {isJoyero ? 'Joyero' : isCliente ? 'Cliente' : role}
                    </p>
                  )}
                </div>
                <div className="border-t border-border/20 my-1"></div>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/airdrop">Airdrop</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/perfil">Perfil</Link>
                </DropdownMenuItem>
                <div className="border-t border-border/20 my-1"></div>
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="hover:glow-primary">
                <span className="hidden sm:inline">Iniciar Sesión</span>
                <span className="sm:hidden">Login</span>
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="bg-veralix-gold text-veralix-black hover:shadow-gold transition-premium">
                <span className="hidden sm:inline">Registrarse</span>
                <span className="sm:hidden">Sign Up</span>
              </Button>
            </Link>
            <Link to="/airdrop">
              <Button size="sm" variant="outline" className="border-primary/50 hover:bg-primary/10 hover:border-primary">
                <span className="hidden sm:inline">Airdrop</span>
                <span className="sm:hidden">💎</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </header>
  );

  // Hero Section
  const HeroSection = () => (
    <section className="relative min-h-[calc(100vh-64px)] sm:min-h-screen flex items-center justify-center px-4 sm:px-6 overflow-hidden pt-16 sm:pt-24">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-veralix-silver/5"></div>
      
      <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center relative z-10">
        {/* Left content */}
        <div className="text-left space-y-4 sm:space-y-8">
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight">
            <span className="text-foreground">Certificación NFT Premium de </span>
            <span className="text-veralix-gold block sm:inline">
              Joyería
            </span>
          </h1>
          
          <p className="text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Autentifica y protege tu joyería con tecnología blockchain. 
            La primera plataforma en Colombia para certificar la procedencia 
            y autenticidad de cada pieza.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {user ? (
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button size="lg" variant="gold" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
                  Ir al Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="gold" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
                  Activar cuenta de joyería
                </Button>
              </Link>
            )}
            <Link to="/verify" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 border-primary/50 hover:bg-primary/10">
                Verificar Joya
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 sm:gap-8 pt-4 sm:pt-8">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-veralix-gold">
                {statsLoading ? (
                  <span className="animate-pulse bg-veralix-gold/20 rounded h-8 w-24 inline-block"></span>
                ) : (
                  stats?.formattedValue
                )}
              </div>
              <div className="text-xs sm:text-base text-veralix-silver/80">Valor Certificado</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-veralix-gold">
                {statsLoading ? (
                  <span className="animate-pulse bg-veralix-gold/20 rounded h-8 w-24 inline-block"></span>
                ) : (
                  stats?.formattedCount
                )}
              </div>
              <div className="text-xs sm:text-base text-veralix-silver/80">Joyas Certificadas</div>
            </div>
          </div>

          {/* Last Updated & Refresh */}
          {stats?.lastUpdated && (
            <div className="flex items-center gap-3 pt-2 text-xs text-veralix-silver/60">
              <span>
                Actualizado {formatDistanceToNow(stats.lastUpdated, { addSuffix: true, locale: es })}
              </span>
              <button 
                onClick={handleRefreshStats}
                className="inline-flex items-center gap-1 text-veralix-gold hover:text-veralix-gold-light transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw className="w-3 h-3" />
                Actualizar
              </button>
            </div>
          )}
        </div>
        
        {/* Right animated logo - hidden on mobile portrait */}
        <div className="hidden lg:flex justify-center lg:justify-end">
          <AnimatedLogo />
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 w-2 h-2 bg-veralix-gold rounded-full animate-float shadow-veralix-gold/50"></div>
      <div className="absolute bottom-1/3 right-20 w-1 h-1 bg-veralix-silver rounded-full animate-float-delayed shadow-veralix-silver/50"></div>
      <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-veralix-gold-light rounded-full animate-float-slow shadow-veralix-gold-light/50"></div>
    </section>
  );

  // Features Section
  const FeaturesSection = () => (
    <section id="features" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Por qué las joyerías líderes eligen <span className="bg-gradient-to-r from-veralix-gold to-veralix-gold-light bg-clip-text text-transparent">Veralix</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Porque transforma cada pieza en una oportunidad de crecimiento y confianza.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="hover:shadow-veralix-gold transition-all duration-300 group border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-veralix-gold to-veralix-gold-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-veralix-gold transition-all duration-300">
                <Shield className="w-8 h-8 text-veralix-black" />
              </div>
              <CardTitle className="text-xl font-bold">Proteja su inventario y su reputación</CardTitle>
              <CardDescription className="text-muted-foreground">
                Cada joya recibe un certificado digital NFT imposible de falsificar. Elimine riesgos y aumente la percepción de valor de sus productos.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-primary transition-all duration-300 group border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-veralix-silver to-veralix-silver-light rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-veralix-silver transition-all duration-300">
                <FileCheck className="w-8 h-8 text-veralix-black" />
              </div>
              <CardTitle className="text-xl font-bold">Venda con respaldo verificable</CardTitle>
              <CardDescription className="text-muted-foreground">
                Permita que sus clientes comprueben la autenticidad en segundos desde su teléfono. Menos dudas, más ventas.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-accent transition-all duration-300 group border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-accent to-muted rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-accent transition-all duration-300">
                <Globe className="w-8 h-8 text-foreground" />
              </div>
              <CardTitle className="text-xl font-bold">Expanda su mercado</CardTitle>
              <CardDescription className="text-muted-foreground">
                Con certificaciones blockchain compatibles a nivel global, su joyería gana credibilidad para exportar y atraer inversionistas o aliados.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </section>
  );

  // How it Works Section
  const HowItWorksSection = () => (
    <section className="py-20 px-6 bg-muted/20">
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Cómo <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">funciona</span>?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Transforme la autenticidad de sus joyas en confianza digital. Un proceso simple, seguro y diseñado para joyerías.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-gold to-gold-light rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-gold transition-all duration-300">
              <Upload className="w-10 h-10 text-background" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Registre su inventario</h3>
            <p className="text-muted-foreground text-lg">
              Desde su cuenta Veralix, cargue fotografías, materiales, peso, procedencia y detalles de fabricación.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary-light rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-primary transition-all duration-300">
              <FileCheck className="w-10 h-10 text-background" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Genere el certificado digital (NFT)</h3>
            <p className="text-muted-foreground text-lg">
              Nuestro sistema crea un NFT único en blockchain que actúa como certificado inalterable.
            </p>
          </div>

          <div className="text-center group">
            <div className="w-20 h-20 bg-gradient-to-r from-accent to-muted-foreground rounded-full flex items-center justify-center mx-auto mb-6 group-hover:shadow-accent transition-all duration-300">
              <Share className="w-10 h-10 text-background" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Entregue y verifique</h3>
            <p className="text-muted-foreground text-lg">
              Su cliente recibe un certificado digital con código QR verificable en segundos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );

  // Contact Section
  const ContactSection = () => (
    <section id="contact" className="py-20 px-6 bg-muted/10">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            ¿Necesitas <span className="bg-gradient-to-r from-veralix-gold to-veralix-gold-light bg-clip-text text-transparent">ayuda</span>?
          </h2>
          <p className="text-xl text-muted-foreground">
            Estamos aquí para responder todas tus preguntas
          </p>
        </div>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Info de contacto */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Contáctanos</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-veralix-gold" />
                      <a href="mailto:hola@veralix.io" className="hover:text-veralix-gold transition-colors">
                        hola@veralix.io
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-veralix-gold" />
                      <a href="tel:+573222679173" className="hover:text-veralix-gold transition-colors">
                        +57 322 267 9173
                      </a>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-veralix-gold" />
                      <span>Bogotá, Colombia</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Horario de atención</h4>
                  <p className="text-sm text-muted-foreground">
                    Lunes a Viernes: 9:00 AM - 6:00 PM<br/>
                    Sábados: 9:00 AM - 1:00 PM
                  </p>
                </div>
              </div>

              {/* Formulario de contacto simple */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold mb-4">Envíanos un mensaje</h3>
                <form className="space-y-4">
                  <Input placeholder="Tu nombre" />
                  <Input type="email" placeholder="Tu email" />
                  <Textarea placeholder="Tu mensaje" rows={4} />
                  <Button className="w-full bg-veralix-gold text-veralix-black hover:shadow-veralix-gold transition-premium">
                    Enviar Mensaje
                  </Button>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enlaces rápidos de ayuda */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground mb-4">O visita nuestro centro de ayuda:</p>
          <Link to="/help">
            <Button variant="outline" size="lg">
              <HelpCircle className="w-4 h-4 mr-2" />
              Centro de Ayuda
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );

  // Legal Section
  const LegalSection = () => (
    <section id="legal" className="py-16 px-6 bg-background border-t border-border/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Información Legal
          </h2>
          <p className="text-muted-foreground">
            Transparencia y cumplimiento normativo
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-veralix-gold transition-all duration-300">
            <CardHeader>
              <Shield className="w-10 h-10 text-veralix-gold mb-4" />
              <CardTitle>Términos y Condiciones</CardTitle>
              <CardDescription>
                Conoce los términos de uso de nuestra plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/terms">
                <Button variant="outline" className="w-full">
                  Ver Términos
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-primary transition-all duration-300">
            <CardHeader>
              <Lock className="w-10 h-10 text-veralix-gold mb-4" />
              <CardTitle>Política de Privacidad</CardTitle>
              <CardDescription>
                Cómo protegemos y manejamos tus datos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/privacy">
                <Button variant="outline" className="w-full">
                  Ver Política
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-accent transition-all duration-300">
            <CardHeader>
              <FileCheck className="w-10 h-10 text-veralix-gold mb-4" />
              <CardTitle>Aviso Legal</CardTitle>
              <CardDescription>
                Información corporativa y regulatoria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/legal-notice">
                <Button variant="outline" className="w-full">
                  Ver Aviso Legal
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-secondary transition-all duration-300">
            <CardHeader>
              <Building2 className="w-10 h-10 text-veralix-gold mb-4" />
              <CardTitle>Contrato de Colaboración</CardTitle>
              <CardDescription>
                Marco de alianza estratégica para joyerías
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/partnership-agreement">
                <Button variant="outline" className="w-full">
                  Ver Contrato
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-accent transition-all duration-300">
            <CardHeader>
              <Award className="w-10 h-10 text-veralix-gold mb-4" />
              <CardTitle>Licencia de Marca</CardTitle>
              <CardDescription>
                Acuerdo de uso de marca Veralix
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/brand-license">
                <Button variant="outline" className="w-full">
                  Ver Licencia
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );

  // CTA Section
  const CTASection = () => (
    <section className="py-20 px-6 bg-gradient-to-br from-background via-muted/10 to-background relative overflow-hidden">
      <div className="container mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          ¿Listo para <span className="text-veralix-gold">llevar su joyería</span> al siguiente nivel?
        </h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
        Únase a las joyerías que ya certifican sus piezas con tecnología blockchain Veralix, generando confianza real en cada venta.
      </p>
        <Link to={user ? "/dashboard" : "/register"}>
          <Button size="lg" className="bg-veralix-gold text-veralix-black hover:scale-105 transition-transform text-lg px-8 py-4">
            {user ? "Ir al Dashboard" : "Activarse como joyería"}
          </Button>
        </Link>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-10 left-1/4 w-2 h-2 bg-gold rounded-full animate-float glow-gold"></div>
      <div className="absolute bottom-10 right-1/4 w-1 h-1 bg-primary rounded-full animate-float-delayed glow-primary"></div>
    </section>
  );

  // Footer Component
  const Footer = () => (
    <footer className="bg-[#0A0A0A] text-[#f4f4f4] relative overflow-hidden">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Columna 1 - Identidad */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <VeralixLogo size={40} className="filter brightness-0 invert" />
              <span className="text-2xl font-bold text-[#CFA349]">Veralix</span>
            </div>
            <p className="text-[#CFA349] font-medium text-lg mb-4 leading-relaxed">
              "La autenticidad tiene un nuevo código"
            </p>
            <p className="text-[#f4f4f4]/90 leading-relaxed">
              El sello digital de autenticidad en blockchain para joyas de 18k.
            </p>
          </div>

          {/* Columna 2 - Enlaces */}
          <div>
            <h4 className="font-bold text-[#CFA349] mb-6 text-lg">Enlaces</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/" 
                  className="text-[#f4f4f4]/80 hover:text-[#CFA349] transition-all duration-300 hover:translate-x-1 inline-block"
                  aria-label="Ir a inicio"
                >
                  Inicio
                </Link>
              </li>
              <li>
                <Link 
                  to="/about" 
                  className="text-[#f4f4f4]/80 hover:text-[#CFA349] transition-all duration-300 hover:translate-x-1 inline-block"
                  aria-label="Conocer sobre nosotros"
                >
                  Sobre nosotros
                </Link>
              </li>
              <li>
                <Link 
                  to="/certificados" 
                  className="text-[#f4f4f4]/80 hover:text-[#CFA349] transition-all duration-300 hover:translate-x-1 inline-block"
                  aria-label="Ver certificados digitales"
                >
                  Certificados digitales
                </Link>
              </li>
              <li>
                <Link 
                  to="/help" 
                  className="text-[#f4f4f4]/80 hover:text-[#CFA349] transition-all duration-300 hover:translate-x-1 inline-block"
                  aria-label="Centro de ayuda"
                >
                  Ayuda
                </Link>
              </li>
              <li>
                <a 
                  href="#contact" 
                  className="text-[#f4f4f4]/80 hover:text-[#CFA349] transition-all duration-300 hover:translate-x-1 inline-block"
                  aria-label="Contactarnos"
                >
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Columna 3 - Legal */}
          <div>
            <h4 className="font-bold text-[#CFA349] mb-6 text-lg">Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  to="/terms" 
                  className="text-[#f4f4f4]/80 hover:text-[#CFA349] transition-all duration-300 hover:translate-x-1 inline-block"
                  aria-label="Ver términos y condiciones"
                >
                  Términos y condiciones
                </Link>
              </li>
              <li>
                <Link 
                  to="/privacy" 
                  className="text-[#f4f4f4]/80 hover:text-[#CFA349] transition-all duration-300 hover:translate-x-1 inline-block"
                  aria-label="Ver política de privacidad"
                >
                  Política de privacidad
                </Link>
              </li>
              <li>
                <Link 
                  to="/legal-notice" 
                  className="text-[#f4f4f4]/80 hover:text-[#CFA349] transition-all duration-300 hover:translate-x-1 inline-block"
                  aria-label="Ver aviso legal"
                >
                  Aviso legal
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 4 - Contacto */}
          <div>
            <h4 className="font-bold text-[#CFA349] mb-6 text-lg">Contacto</h4>
            <div className="space-y-4">
              <div>
                <p className="text-[#f4f4f4]/90 font-medium">Bogotá, Colombia</p>
              </div>
              <div>
                <a 
                  href="mailto:hola@veralix.io" 
                  className="text-[#f4f4f4]/80 hover:text-[#CFA349] transition-colors duration-300"
                  aria-label="Enviar correo a hola@veralix.io"
                >
                  hola@veralix.io
                </a>
              </div>
              <div>
                <a 
                  href="tel:+573222679173" 
                  className="text-[#f4f4f4]/80 hover:text-[#CFA349] transition-colors duration-300"
                  aria-label="Llamar al +57 322 267 9173"
                >
                  +57 322 267 9173
                </a>
              </div>
              
              {/* Redes Sociales */}
              <div className="flex space-x-4 pt-2">
                <a 
                  href="https://linkedin.com/company/veralix" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#CFA349]/10 flex items-center justify-center text-[#CFA349] hover:text-[#f4f4f4] hover:bg-[#CFA349] transition-all duration-300 transform hover:scale-110"
                  aria-label="Seguir en LinkedIn"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a 
                  href="https://instagram.com/veralix.io" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#CFA349]/10 flex items-center justify-center text-[#CFA349] hover:text-[#f4f4f4] hover:bg-[#CFA349] transition-all duration-300 transform hover:scale-110"
                  aria-label="Seguir en Instagram"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.004 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.596-3.205-1.529l1.718-1.718c.39.585.984.939 1.668.939.827 0 1.496-.67 1.496-1.496s-.669-1.496-1.496-1.496c-.684 0-1.278.354-1.668.939L4.244 10.91c.757-.933 1.908-1.529 3.205-1.529 2.271 0 4.112 1.841 4.112 4.112s-1.841 4.112-4.112 4.112zm7.441-2.662c0 .827-.669 1.496-1.496 1.496s-1.496-.669-1.496-1.496V8.112c0-.827.669-1.496 1.496-1.496s1.496.669 1.496 1.496v6.214z"/>
                  </svg>
                </a>
                <a 
                  href="https://x.com/veralix" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#CFA349]/10 flex items-center justify-center text-[#CFA349] hover:text-[#f4f4f4] hover:bg-[#CFA349] transition-all duration-300 transform hover:scale-110"
                  aria-label="Seguir en X (Twitter)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bloque Corporativo */}
      <div className="border-t border-[#CFA349]/20 bg-[#0A0A0A]/95">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center space-y-4">
            <div className="text-[#CFA349] font-semibold text-lg mb-4">
              Una solución de Orilux Tech S.A.S.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-[#f4f4f4]/70">
              <div>NIT: 901.988.949-2</div>
              <div>Registro Mercantil: Cámara de Comercio de Bogotá (CCB)</div>
              <div className="lg:col-span-2">Marca registrada en la Superintendencia de Industria y Comercio (SIC), Colombia</div>
            </div>
            <div className="text-[#f4f4f4]/60 text-sm pt-4">
              © 2025 Orilux Tech S.A.S. – Todos los derechos reservados.
            </div>
          </div>
        </div>
      </div>

      {/* Logos Institucionales */}
      <div className="border-t border-[#CFA349]/10 bg-[#0A0A0A]">
        <div className="container mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-12">
            <div className="flex items-center space-x-2 opacity-60 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-[#CFA349]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#CFA349] font-bold text-xs">CCB</span>
              </div>
              <span className="text-[#f4f4f4]/50 text-xs">Cámara de Comercio de Bogotá</span>
            </div>
            <div className="flex items-center space-x-2 opacity-60 hover:opacity-80 transition-opacity">
              <div className="w-12 h-12 bg-[#CFA349]/20 rounded-lg flex items-center justify-center">
                <span className="text-[#CFA349] font-bold text-xs">SIC</span>
              </div>
              <span className="text-[#f4f4f4]/50 text-xs">Superintendencia de Industria y Comercio</span>
            </div>
          </div>
          
          {/* Admin Access - Discreto */}
          <div className="mt-8 text-center">
            <Link 
              to="/admin" 
              className="text-xs text-[#f4f4f4]/30 hover:text-[#CFA349]/50 transition-colors duration-300"
              aria-label="Acceso administrativo"
            >
              Acceso Administrativo
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );

  return (
    <>
      <StructuredData type="Organization" data={organizationSchema} />
      <StructuredData 
        type="Service" 
        data={{
          name: 'Certificación NFT de Joyería',
          provider: {
            '@type': 'Organization',
            name: 'Veralix'
          },
          serviceType: 'Certificación Blockchain',
          areaServed: 'Colombia',
          description: 'Servicio de certificación digital mediante NFTs para joyería de alta gama'
        }} 
      />
      
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <ContactSection />
          <LegalSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;