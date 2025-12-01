import { cn } from "@/lib/utils";

interface VeralixGradientOverlayProps {
  variant?: 'gold' | 'silver' | 'premium' | 'hero';
  opacity?: number;
  className?: string;
}

/**
 * Overlay con degradados suaves oro-blanco
 * Según el Manual de Identidad Corporativa Veralix
 */
export const VeralixGradientOverlay = ({ 
  variant = 'gold',
  opacity = 10,
  className
}: VeralixGradientOverlayProps) => {
  const gradientClass = {
    gold: 'bg-gradient-veralix-gold',
    silver: 'bg-gradient-veralix-silver',
    premium: 'bg-gradient-veralix-premium',
    hero: 'bg-gradient-veralix-hero'
  }[variant];

  return (
    <div 
      className={cn(
        "absolute inset-0 pointer-events-none",
        gradientClass,
        className
      )}
      style={{ opacity: opacity / 100 }}
      aria-hidden="true"
    />
  );
};
