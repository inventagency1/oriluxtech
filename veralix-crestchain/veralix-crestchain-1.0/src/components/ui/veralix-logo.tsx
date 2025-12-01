import React from "react";
import veralixLogoNew from "@/assets/veralix-logo-new.png";

interface VeralixLogoProps {
  className?: string;
  size?: number;
}

export const VeralixLogo: React.FC<VeralixLogoProps> = ({ 
  className = "", 
  size = 40 
}) => {
  return (
    <img 
      src={veralixLogoNew}
      width={size} 
      height={size} 
      className={`${className} object-contain`}
      alt="Veralix Logo"
    />
  );
};