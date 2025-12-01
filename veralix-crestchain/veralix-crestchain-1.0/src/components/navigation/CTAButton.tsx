import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, ShoppingBag, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface CTAButtonProps {
  role: string | null;
  isJoyero: boolean;
  isCliente: boolean;
  isAdmin: boolean;
  size?: "default" | "sm" | "lg";
  className?: string;
  variant?: "default" | "gold" | "outline";
}

export const CTAButton = ({ 
  role, 
  isJoyero, 
  isCliente, 
  isAdmin, 
  size = "default",
  className,
  variant = "default"
}: CTAButtonProps) => {
  if (isJoyero || isAdmin) {
    return (
      <Button 
        asChild 
        size={size} 
        variant={variant}
        className={cn("bg-gradient-veralix-gold hover:shadow-veralix-gold", className)}
      >
        <Link to="/nueva-joya">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Joya
        </Link>
      </Button>
    );
  }

  if (isCliente) {
    return (
      <Button 
        asChild 
        size={size} 
        variant="outline"
        className={cn("border-veralix-gold/30 hover:bg-veralix-gold/10", className)}
      >
        <Link to="/marketplace">
          <ShoppingBag className="w-4 h-4 mr-2" />
          Explorar
        </Link>
      </Button>
    );
  }

  if (isAdmin && !isJoyero) {
    return (
      <Button 
        asChild 
        size={size} 
        variant="secondary"
        className={className}
      >
        <Link to="/admin/settings">
          <Shield className="w-4 h-4 mr-2" />
          Panel Admin
        </Link>
      </Button>
    );
  }

  return null;
};
