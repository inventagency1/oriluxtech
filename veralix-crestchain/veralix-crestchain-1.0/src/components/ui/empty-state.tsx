import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center animate-fade-in",
      className
    )}>
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 animate-bounce-in">
        <Icon className="w-10 h-10 text-primary" />
      </div>
      
      <h3 className="text-xl font-heading font-semibold mb-2">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-6 max-w-md">
        {description}
      </p>
      
      {actionLabel && onAction && (
        <Button 
          onClick={onAction}
          className="shadow-veralix-gold hover:shadow-veralix-premium transition-premium"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
