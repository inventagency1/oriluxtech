import { Home, Search, ShoppingBag, User, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

export function BottomNav() {
  const location = useLocation();
  const { isJoyero, isCliente } = useUserRole();
  const isMobile = useIsMobile();

  if (!isMobile) return null; // Solo mostrar en móvil

  const navItems = isJoyero 
    ? [
        { icon: Home, label: 'Inicio', path: '/dashboard' },
        { icon: Plus, label: 'Nueva', path: '/nueva-joya' },
        { icon: ShoppingBag, label: 'Vender', path: '/mi-marketplace' },
        { icon: User, label: 'Perfil', path: '/perfil' },
      ]
    : [
        { icon: Home, label: 'Inicio', path: '/dashboard' },
        { icon: Search, label: 'Buscar', path: '/marketplace' },
        { icon: ShoppingBag, label: 'Órdenes', path: '/mi-marketplace' },
        { icon: User, label: 'Perfil', path: '/perfil' },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-t border-border/30 pb-safe shadow-veralix-premium">
      <div className="flex justify-around items-center h-16 relative">
        {/* Gradient overlay sutil */}
        <div className="absolute inset-0 bg-gradient-to-t from-veralix-gold/5 to-transparent pointer-events-none" />
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full space-y-1 relative z-10 transition-all duration-300",
                isActive 
                  ? "text-veralix-gold scale-105" 
                  : "text-muted-foreground hover:text-veralix-gold hover:scale-105"
              )}
            >
              {/* Indicador activo con pill dorado */}
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-veralix-gold rounded-full animate-fade-in" />
              )}
              
              {/* Icono con animación de glow en activo */}
              <div className={cn(
                "relative transition-all duration-300",
                isActive && "animate-glow-pulse"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-all duration-300",
                  isActive && "filter drop-shadow-[0_0_8px_hsl(var(--veralix-gold))]"
                )} />
              </div>
              
              <span className={cn(
                "text-[10px] font-medium transition-all duration-300",
                isActive && "font-semibold"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
