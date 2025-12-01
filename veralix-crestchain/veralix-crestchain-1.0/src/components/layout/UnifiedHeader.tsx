import { useState } from "react";
import { Link, useLocation, NavLink } from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { VeralixLogo } from "@/components/ui/veralix-logo";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { NotificationBell } from "@/components/NotificationBell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getNavigationItems } from "@/components/layout/NavigationItems";
import { CTAButton, UserCard } from "@/components/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";

interface UnifiedHeaderProps {
  title?: string;
  showAuth?: boolean;
}

export function UnifiedHeader({ 
  title,
  showAuth = true 
}: UnifiedHeaderProps) {
  const { user, signOut } = useAuth();
  const { role, isJoyero, isCliente, isAdmin } = useUserRole();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationGroups = getNavigationItems(role, isAdmin, isJoyero, isCliente);
  
  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const getRoleLabel = () => {
    if (isAdmin) return "Admin";
    if (isJoyero) return "Joyero";
    if (isCliente) return "Cliente";
    return role || "";
  };

  const handleSignOut = async () => {
    await signOut();
    setMobileMenuOpen(false);
  };

  return (
    <header className="w-full h-14 md:h-16 px-3 md:px-4 flex items-center justify-between bg-background/85 backdrop-blur-md border-b border-border/30 sticky top-0 z-50 shadow-sm transition-all duration-300">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Logo con animación sutil */}
        <Link to="/" className="flex items-center gap-2 hover:scale-105 transition-transform duration-300 group">
          <div className="animate-fade-scale">
            <VeralixLogo size={32} />
          </div>
          <span className="hidden sm:block text-xl font-bold bg-gradient-gold bg-clip-text text-transparent group-hover:animate-shimmer">
            Veralix
          </span>
        </Link>

        {/* Optional Page Title */}
        {title && (
          <>
            <Separator orientation="vertical" className="h-6 hidden md:block" />
            <h1 className="hidden md:block text-lg font-semibold text-foreground animate-slide-up">{title}</h1>
          </>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Hamburger Menu - Always visible, improved for all screens */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-foreground hover:text-veralix-gold hover:bg-veralix-gold/10 transition-all duration-300 hover:scale-110"
            >
              {mobileMenuOpen ? 
                <X className="h-5 w-5 animate-fade-in" /> : 
                <Menu className="h-5 w-5 animate-fade-in" />
              }
              <span className="sr-only">Menú de navegación</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 sm:w-96 p-0">
            {/* Sticky Header */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-veralix-gold/5 to-transparent border-b border-veralix-gold/20 p-4">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-3">
                  <VeralixLogo size={32} />
                  <div className="flex-1 min-w-0">
                    <span className="text-xl font-bold bg-gradient-gold bg-clip-text text-transparent">
                      Veralix
                    </span>
                    {user && role && (
                      <Badge 
                        variant="outline" 
                        className="ml-2 text-xs border-veralix-gold/30 text-veralix-gold"
                      >
                        {getRoleLabel()}
                      </Badge>
                    )}
                  </div>
                </SheetTitle>
              </SheetHeader>
            </div>
            
            {/* Scrollable Navigation */}
            <ScrollArea className="h-[calc(100vh-80px)]">
              <div className="flex flex-col gap-6 p-4">
                {user ? (
                  <>
                    {/* User Card */}
                    <div className="pb-4 border-b border-border/40">
                      <UserCard
                        email={user.email || undefined}
                        roleLabel={getRoleLabel()}
                        variant="dropdown"
                      />
                    </div>

                    {/* Navigation Groups */}
                    {navigationGroups.map((group, index) => (
                      <div key={group.label} className="space-y-3">
                        <h3 className="text-xs font-semibold text-veralix-gold uppercase tracking-wider">
                          {group.label}
                        </h3>
                        <div className="space-y-1">
                          {group.items.map((item) => (
                            <NavLink
                              key={item.url}
                              to={item.url}
                              onClick={() => setMobileMenuOpen(false)}
                              className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                  isActive
                                    ? 'bg-veralix-gold/10 text-veralix-gold font-medium shadow-sm'
                                    : 'text-foreground hover:text-veralix-gold hover:bg-veralix-gold/5'
                                }`
                              }
                            >
                              <item.icon className="w-5 h-5 flex-shrink-0" />
                              <span className="flex-1">{item.title}</span>
                              {item.badge && (
                                <Badge 
                                  variant="secondary" 
                                  className="text-xs"
                                >
                                  {item.badge}
                                </Badge>
                              )}
                            </NavLink>
                          ))}
                        </div>
                        {index < navigationGroups.length - 1 && (
                          <Separator className="mt-4" />
                        )}
                      </div>
                    ))}

                    {/* Sign Out Button */}
                    <div className="pt-4 border-t border-border/40">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSignOut}
                        className="w-full justify-start text-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-3 text-veralix-gold" />
                        <span>Cerrar Sesión</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Public Links */}
                    <div className="space-y-1">
                      <NavLink
                        to="/"
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-veralix-gold/10 text-veralix-gold font-medium'
                              : 'text-foreground hover:text-veralix-gold hover:bg-veralix-gold/5'
                          }`
                        }
                      >
                        Inicio
                      </NavLink>
                      <NavLink
                        to="/marketplace"
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-veralix-gold/10 text-veralix-gold font-medium'
                              : 'text-foreground hover:text-veralix-gold hover:bg-veralix-gold/5'
                          }`
                        }
                      >
                        Marketplace
                      </NavLink>
                      <NavLink
                        to="/verify"
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-veralix-gold/10 text-veralix-gold font-medium'
                              : 'text-foreground hover:text-veralix-gold hover:bg-veralix-gold/5'
                          }`
                        }
                      >
                        Verificar
                      </NavLink>
                      <NavLink
                        to="/about"
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                            isActive
                              ? 'bg-veralix-gold/10 text-veralix-gold font-medium'
                              : 'text-foreground hover:text-veralix-gold hover:bg-veralix-gold/5'
                          }`
                        }
                      >
                        Nosotros
                      </NavLink>
                    </div>

                    <Separator />

                    {/* Auth Buttons */}
                    <div className="space-y-2">
                      <Button 
                        asChild 
                        variant="outline" 
                        className="w-full border-veralix-gold/30 hover:bg-veralix-gold/10"
                      >
                        <Link to="/login">Iniciar Sesión</Link>
                      </Button>
                      <Button 
                        asChild 
                        className="w-full bg-gradient-gold hover:opacity-90 transition-opacity"
                      >
                        <Link to="/register">Registrarse</Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </SheetContent>
        </Sheet>

        {/* Notifications Bell */}
        {user && <NotificationBell />}
        
        <ThemeToggle />
        
        {/* Auth Section - Desktop */}
        {showAuth && !user && (
          <div className="hidden md:flex items-center gap-2">
            <Button 
              asChild 
              variant="ghost" 
              size="sm"
              className="hover:bg-veralix-gold/10 transition-colors"
            >
              <Link to="/login">Iniciar Sesión</Link>
            </Button>
            <Button 
              asChild 
              size="sm" 
              className="bg-gradient-gold hover:opacity-90 transition-opacity"
            >
              <Link to="/register">Registrarse</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
