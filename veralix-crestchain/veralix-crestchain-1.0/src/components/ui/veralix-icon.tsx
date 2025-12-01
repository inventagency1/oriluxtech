import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  getIconSize, 
  getIconStrokeWidth, 
  getIconColor,
  type IconSize,
  type IconStrokeWidth,
  type IconColor
} from "@/lib/iconography";

interface VeralixIconProps {
  icon: LucideIcon;
  size?: IconSize;
  strokeWidth?: IconStrokeWidth;
  color?: IconColor;
  className?: string;
}

/**
 * Wrapper para iconos Lucide con estilo Veralix
 * Según el Manual de Identidad Corporativa
 * 
 * - Líneas finas (strokeWidth: thin)
 * - Estética minimalista
 * - Colores corporativos
 */
export const VeralixIcon = ({ 
  icon: Icon, 
  size = 'md',
  strokeWidth = 'thin',
  color = 'primary',
  className,
  ...props
}: VeralixIconProps & Omit<React.ComponentProps<LucideIcon>, 'ref'>) => {
  const iconSize = getIconSize(size);
  const iconStrokeWidth = getIconStrokeWidth(strokeWidth);
  
  const colorClass = {
    primary: 'text-veralix-gold',
    secondary: 'text-veralix-silver',
    neutral: 'text-veralix-black dark:text-veralix-white',
    light: 'text-veralix-white'
  }[color];

  return (
    <Icon 
      size={iconSize}
      strokeWidth={iconStrokeWidth}
      className={cn(colorClass, className)}
      {...props}
    />
  );
};
