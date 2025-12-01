import { ReactNode, useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { DashboardHeader } from "./DashboardHeader";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { AdminRoleSwitcher } from "@/components/admin/AdminRoleSwitcher";
import { DevelopmentRolePanel } from "@/components/DevelopmentRolePanel";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

// Breakpoint para móvil (768px = md en Tailwind)
const MOBILE_BREAKPOINT = 768;

export function DashboardLayout({ children, title, description }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  // Detectar tamaño de ventana
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cerrar sidebar móvil cuando cambia la ruta
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname]);

  const isMobile = windowWidth < MOBILE_BREAKPOINT;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Siempre visible en Desktop */}
      <div className={cn(
        "fixed left-0 top-0 z-40 h-full transition-transform duration-300",
        isMobile && !mobileSidebarOpen && "-translate-x-full"
      )}>
        <Sidebar 
          collapsed={!isMobile && sidebarCollapsed} 
          onCollapsedChange={setSidebarCollapsed}
        />
      </div>

      {/* Overlay para móvil */}
      {isMobile && mobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Botón cerrar en móvil */}
      {isMobile && mobileSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-[220px] top-4 z-50 bg-background/80 backdrop-blur"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <X className="h-5 w-5" />
        </Button>
      )}

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          // En desktop, aplicar margen según estado del sidebar
          !isMobile && (sidebarCollapsed ? "ml-[70px]" : "ml-[260px]"),
          // En móvil, sin margen
          isMobile && "ml-0"
        )}
      >
        {/* Header */}
        <DashboardHeader 
          title={title}
          description={description}
          onMenuClick={() => setMobileSidebarOpen(true)}
          showMenuButton={isMobile}
        />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Utilities */}
      <ScrollToTop />
      <AdminRoleSwitcher />
      {import.meta.env.DEV && <DevelopmentRolePanel />}
    </div>
  );
}
