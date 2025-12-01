import React from "react";
import { VeralixLogo } from "./veralix-logo";

export const AnimatedLogo: React.FC = () => {
  return (
    <div className="relative flex items-center justify-center w-96 h-96">
      {/* Outer rotating ring */}
      <div className="absolute inset-0 rounded-full border border-muted-foreground/20 animate-spin-slow">
        <div className="absolute top-0 left-1/2 w-2 h-2 bg-gold rounded-full transform -translate-x-1/2 -translate-y-1 glow-gold"></div>
        <div className="absolute top-1/4 right-0 w-1 h-1 bg-primary rounded-full transform translate-x-1 glow-primary"></div>
        <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-accent rounded-full transform -translate-x-1 glow-accent"></div>
      </div>
      
      {/* Middle rotating ring */}
      <div className="absolute inset-8 rounded-full border border-muted-foreground/30 animate-spin-reverse">
        <div className="absolute top-1/3 right-0 w-1.5 h-1.5 bg-gold-light rounded-full transform translate-x-1 glow-gold"></div>
        <div className="absolute bottom-1/3 left-0 w-1 h-1 bg-primary/80 rounded-full transform -translate-x-1 glow-primary"></div>
      </div>
      
      {/* Inner rotating ring */}
      <div className="absolute inset-16 rounded-full border border-muted-foreground/40 animate-spin-slow">
        <div className="absolute top-0 left-1/2 w-1 h-1 bg-accent rounded-full transform -translate-x-1/2 -translate-y-1 glow-accent"></div>
      </div>
      
      {/* Central logo */}
      <div className="relative z-10 flex items-center justify-center w-48 h-48 rounded-full bg-background/10 backdrop-blur-sm border border-muted-foreground/20">
        <VeralixLogo size={120} className="animate-spin-3d" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-gold rounded-full animate-float glow-gold"></div>
        <div className="absolute top-3/4 right-1/4 w-0.5 h-0.5 bg-primary rounded-full animate-float-delayed glow-primary"></div>
        <div className="absolute bottom-1/3 left-1/3 w-0.5 h-0.5 bg-accent rounded-full animate-float-slow glow-accent"></div>
      </div>
    </div>
  );
};