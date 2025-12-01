import { ReactNode } from "react";
import { UnifiedHeader } from "./UnifiedHeader";
import { BottomNav } from "./BottomNav";
import { ScrollToTop } from "@/components/ui/scroll-to-top";
import { DevelopmentRolePanel } from "@/components/DevelopmentRolePanel";
import { AdminRoleSwitcher } from "@/components/admin/AdminRoleSwitcher";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col w-full">
      <UnifiedHeader />
      
      {/* FASE 6: Espaciado móvil optimizado */}
      <main className={cn(
        "flex-1 bg-background transition-all duration-300",
        // Espaciado moderado - ~0.5cm (aprox 4-6px)
        "p-2",
        isMobile && "pb-20"     // Espacio para BottomNav
      )}>
        <div className="w-full max-w-none">
          {children}
        </div>
      </main>
      
      <BottomNav />
      <ScrollToTop />
      
      {/* Admin Role Switcher - Funciona en producción para admins */}
      <AdminRoleSwitcher />
      
      {/* Panel de desarrollo - Solo en modo DEV */}
      {import.meta.env.DEV && <DevelopmentRolePanel />}
    </div>
  );
};