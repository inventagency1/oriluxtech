import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = "Algo salió mal",
  message,
  onRetry,
  className
}: ErrorStateProps) => {
  return (
    <div className={cn("flex items-center justify-center py-12 px-4 animate-fade-in", className)}>
      <Alert variant="destructive" className="max-w-md">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
        </AlertDescription>
        {onRetry && (
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="w-full"
            >
              🔄 Reintentar
            </Button>
          </div>
        )}
      </Alert>
    </div>
  );
};
