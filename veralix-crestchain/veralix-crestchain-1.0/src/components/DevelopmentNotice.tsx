import { AlertTriangle, Settings } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DevelopmentNoticeProps {
  title?: string;
  description?: string;
  showContactAdmin?: boolean;
}

export function DevelopmentNotice({ 
  title = "Funcionalidad en Desarrollo",
  description = "Esta funcionalidad está siendo configurada. Por favor contacta al administrador.",
  showContactAdmin = true 
}: DevelopmentNoticeProps) {
  return (
    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
      <AlertTriangle className="h-4 w-4 text-orange-600" />
      <AlertTitle className="text-orange-800 dark:text-orange-200">
        {title}
      </AlertTitle>
      <AlertDescription className="text-orange-700 dark:text-orange-300">
        {description}
        {showContactAdmin && (
          <div className="mt-3">
            <Button 
              variant="outline" 
              size="sm"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
              asChild
            >
              <a href="mailto:soporte@veralix.io">
                <Settings className="w-3 h-3 mr-2" />
                Contactar Administrador
              </a>
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}