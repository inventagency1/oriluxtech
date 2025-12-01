import { cn } from "@/lib/utils";

interface VeralixDecorativeLinesProps {
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  variant?: 'gold' | 'silver';
}

/**
 * Líneas decorativas finas inspiradas en la forma del logomark
 * Según el Manual de Identidad Corporativa Veralix
 */
export const VeralixDecorativeLines = ({ 
  position = 'top',
  className,
  variant = 'gold'
}: VeralixDecorativeLinesProps) => {
  const colorClass = variant === 'gold' ? 'bg-veralix-gold' : 'bg-veralix-silver';
  
  const positionClasses = {
    top: 'top-0 left-0 right-0 flex-row',
    bottom: 'bottom-0 left-0 right-0 flex-row',
    left: 'left-0 top-0 bottom-0 flex-col',
    right: 'right-0 top-0 bottom-0 flex-col'
  };

  return (
    <div 
      className={cn(
        "absolute flex gap-1 pointer-events-none",
        positionClasses[position],
        className
      )}
      aria-hidden="true"
    >
      {/* Línea fina principal */}
      <div className={cn("h-px w-12", colorClass, "opacity-60")} />
      {/* Línea fina secundaria */}
      <div className={cn("h-px w-8", colorClass, "opacity-40")} />
      {/* Línea fina terciaria */}
      <div className={cn("h-px w-4", colorClass, "opacity-20")} />
    </div>
  );
};
