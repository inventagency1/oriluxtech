import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Gem,
  FileCheck,
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  HelpCircle,
  Users,
  CreditCard,
  Gift,
  Tag,
  Database,
  Heart,
  Coins,
  Home,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Store,
  Bell,
  Sparkles
} from "lucide-react";
import { VeralixLogo } from "@/components/ui/veralix-logo";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

// Navegación para Joyero
const joyeroNavigation: NavSection[] = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Gestión",
    items: [
      { title: "Mis Joyas", href: "/dashboard/joyas", icon: Gem },
      { title: "Nueva Joya", href: "/new-jewelry", icon: Sparkles },
      { title: "Certificados", href: "/dashboard/certificados", icon: FileCheck },
    ]
  },
  {
    title: "Ventas",
    items: [
      { title: "Marketplace", href: "/dashboard/marketplace", icon: Store },
      { title: "Pedidos", href: "/dashboard/pedidos", icon: Package },
      { title: "Analytics", href: "/analytics", icon: BarChart3 },
    ]
  },
  {
    title: "Cuenta",
    items: [
      { title: "Tokens VRX", href: "/airdrop", icon: Coins },
      { title: "Configuración", href: "/dashboard/settings", icon: Settings },
      { title: "Ayuda", href: "/help", icon: HelpCircle },
    ]
  }
];

// Navegación para Cliente
const clienteNavigation: NavSection[] = [
  {
    items: [
      { title: "Inicio", href: "/dashboard", icon: Home },
    ]
  },
  {
    title: "Explorar",
    items: [
      { title: "Marketplace", href: "/marketplace", icon: ShoppingBag },
      { title: "Favoritos", href: "/favorites", icon: Heart },
    ]
  },
  {
    title: "Mis Compras",
    items: [
      { title: "Mis Certificados", href: "/certificates", icon: FileCheck },
      { title: "Mis Pedidos", href: "/dashboard/pedidos", icon: Package },
    ]
  },
  {
    title: "Cuenta",
    items: [
      { title: "Tokens VRX", href: "/airdrop", icon: Coins },
      { title: "Configuración", href: "/dashboard/settings", icon: Settings },
      { title: "Ayuda", href: "/help", icon: HelpCircle },
    ]
  }
];

// Navegación para Admin
const adminNavigation: NavSection[] = [
  {
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ]
  },
  {
    title: "Gestión",
    items: [
      { title: "Usuarios", href: "/dashboard/usuarios", icon: Users },
      { title: "Certificados", href: "/dashboard/admin-certificados", icon: FileCheck },
      { title: "Suscripciones", href: "/admin/subscriptions", icon: CreditCard },
    ]
  },
  {
    title: "Finanzas",
    items: [
      { title: "Pagos Wompi", href: "/admin/wompi", icon: CreditCard },
      { title: "Precios", href: "/dashboard/precios", icon: Tag },
    ]
  },
  {
    title: "Sistema",
    items: [
      { title: "Airdrops", href: "/dashboard/airdrops", icon: Gift },
      { title: "Marketplace", href: "/dashboard/marketplace-admin", icon: Store },
      { title: "Base de Datos", href: "/dashboard/database", icon: Database },
      { title: "Configuración", href: "/admin/settings", icon: Settings },
    ]
  }
];

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const location = useLocation();
  const { effectiveRole, isAdmin } = useUserRole();
  const { user, signOut } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const handleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapsedChange?.(newState);
  };

  // Seleccionar navegación según rol
  const getNavigation = (): NavSection[] => {
    switch (effectiveRole) {
      case 'admin':
        return adminNavigation;
      case 'joyero':
        return joyeroNavigation;
      case 'cliente':
      default:
        return clienteNavigation;
    }
  };

  const navigation = getNavigation();

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[260px]"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header del Sidebar */}
        <div className={cn(
          "flex h-16 items-center border-b border-border px-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <VeralixLogo size={32} />
              <span className="font-heading font-bold text-lg">Veralix</span>
            </Link>
          )}
          {isCollapsed && (
            <Link to="/dashboard">
              <VeralixLogo size={28} />
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 shrink-0",
              isCollapsed && "absolute -right-3 top-6 z-50 rounded-full border bg-background shadow-md"
            )}
            onClick={handleCollapse}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Rol Badge */}
        {!isCollapsed && (
          <div className="px-4 py-3">
            <Badge 
              variant="outline" 
              className={cn(
                "w-full justify-center py-1.5 text-xs font-medium",
                effectiveRole === 'admin' && "border-red-500/50 text-red-500 bg-red-500/10",
                effectiveRole === 'joyero' && "border-amber-500/50 text-amber-500 bg-amber-500/10",
                effectiveRole === 'cliente' && "border-blue-500/50 text-blue-500 bg-blue-500/10"
              )}
            >
              <Shield className="h-3 w-3 mr-1.5" />
              {effectiveRole === 'admin' && "Administrador"}
              {effectiveRole === 'joyero' && "Joyero"}
              {effectiveRole === 'cliente' && "Cliente"}
            </Badge>
          </div>
        )}

        {/* Navegación */}
        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-1 py-2">
            {navigation.map((section, sectionIndex) => (
              <div key={sectionIndex} className="mb-2">
                {section.title && !isCollapsed && (
                  <h4 className="mb-2 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {section.title}
                  </h4>
                )}
                {section.title && isCollapsed && sectionIndex > 0 && (
                  <Separator className="my-2" />
                )}
                <div className="flex flex-col gap-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActiveRoute(item.href);
                    
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          "hover:bg-accent hover:text-accent-foreground",
                          isActive 
                            ? "bg-primary text-primary-foreground shadow-sm" 
                            : "text-muted-foreground",
                          isCollapsed && "justify-center px-2"
                        )}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <Icon className={cn(
                          "shrink-0 transition-transform",
                          isActive ? "h-5 w-5" : "h-4 w-4"
                        )} />
                        {!isCollapsed && (
                          <>
                            <span className="flex-1">{item.title}</span>
                            {item.badge && (
                              <Badge 
                                variant={item.badgeVariant || "secondary"}
                                className="h-5 px-1.5 text-xs"
                              >
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Footer del Sidebar */}
        <div className="border-t border-border p-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {user?.email?.split('@')[0] || "Usuario"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || ""}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => signOut()}
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10 text-muted-foreground hover:text-destructive"
              onClick={() => signOut()}
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
