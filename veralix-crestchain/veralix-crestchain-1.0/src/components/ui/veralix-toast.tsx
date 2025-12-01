import { toast as sonnerToast } from "sonner";
import { VeralixLogo } from "@/components/ui/veralix-logo";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";

interface VeralixToastProps {
  title: string;
  description?: string;
  type?: ToastType;
}

const getIcon = (type: ToastType) => {
  switch (type) {
    case "success": return CheckCircle2;
    case "error": return XCircle;
    case "warning": return AlertCircle;
    case "info": return Info;
  }
};

const getColor = (type: ToastType) => {
  switch (type) {
    case "success": return "text-green-600 dark:text-green-400";
    case "error": return "text-red-600 dark:text-red-400";
    case "warning": return "text-amber-600 dark:text-amber-400";
    case "info": return "text-blue-600 dark:text-blue-400";
  }
};

export const veralixToast = ({ 
  title, 
  description, 
  type = "info" 
}: VeralixToastProps) => {
  const Icon = getIcon(type);
  const color = getColor(type);
  
  return sonnerToast.custom((t) => (
    <div className="bg-background border border-gold/20 rounded-lg shadow-lg p-4 w-full max-w-md backdrop-blur-sm">
      <div className="flex items-start gap-3">
        {/* Logo de Veralix */}
        <div className="flex-shrink-0 mt-0.5">
          <VeralixLogo size={28} />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Título con icono */}
          <div className="flex items-center gap-2 mb-1">
            <Icon className={`h-4 w-4 ${color}`} />
            <p className="font-semibold text-sm text-foreground">
              {title}
            </p>
          </div>
          
          {/* Descripción */}
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
          
          {/* Badge Veralix */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[10px] text-gold font-medium tracking-wider">
              VERALIX
            </span>
          </div>
        </div>
      </div>
    </div>
  ));
};

// Helpers específicos
export const veralixToastSuccess = (title: string, description?: string) => 
  veralixToast({ title, description, type: "success" });

export const veralixToastError = (title: string, description?: string) => 
  veralixToast({ title, description, type: "error" });

export const veralixToastWarning = (title: string, description?: string) => 
  veralixToast({ title, description, type: "warning" });

export const veralixToastInfo = (title: string, description?: string) => 
  veralixToast({ title, description, type: "info" });
