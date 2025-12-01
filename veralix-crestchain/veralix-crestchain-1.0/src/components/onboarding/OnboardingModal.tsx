import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles, Shield, ShoppingBag, BarChart3, Check, Crown, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VeralixLogo } from '@/components/ui/veralix-logo';
import { useUserRole } from '@/hooks/useUserRole';

interface OnboardingStep {
  title: string;
  description: string;
  icon: React.ElementType;
  image?: string;
  features?: string[];
  roles?: ('joyero' | 'cliente' | 'admin')[];
}

const joyeroSteps: OnboardingStep[] = [
  {
    title: 'Bienvenida Joyería',
    description: 'La plataforma blockchain para certificar y vender tus joyas de lujo',
    icon: Crown,
    features: [
      'Certificados NFT inmutables para tus joyas',
      'Marketplace premium para vender',
      'Analytics de tus ventas',
    ],
    roles: ['joyero'],
  },
  {
    title: 'Certificación Blockchain',
    description: 'Genera certificados NFT de autenticidad para tus joyas',
    icon: Shield,
    features: [
      'Creación rápida de certificados',
      'QR único para cada joya',
      'Registro inmutable en blockchain',
    ],
    roles: ['joyero'],
  },
  {
    title: 'Marketplace de Lujo',
    description: 'Vende tus joyas certificadas a compradores verificados',
    icon: ShoppingBag,
    features: [
      'Listados con certificación incluida',
      'Sistema de pagos seguro',
      'Gestión de órdenes completa',
    ],
    roles: ['joyero'],
  },
  {
    title: 'Analytics Profesional',
    description: 'Monitorea tus ventas y certificados en tiempo real',
    icon: BarChart3,
    features: [
      'Dashboard de métricas',
      'Historial de certificados',
      'Reportes de ventas',
    ],
    roles: ['joyero'],
  },
];

const clienteSteps: OnboardingStep[] = [
  {
    title: 'Bienvenido Cliente',
    description: 'Descubre y compra joyas de lujo certificadas con blockchain',
    icon: UserCheck,
    features: [
      'Joyas certificadas y verificadas',
      'Compra segura y confiable',
      'Verifica autenticidad con QR',
    ],
    roles: ['cliente'],
  },
  {
    title: 'Verificación Instantánea',
    description: 'Escanea certificados QR y verifica la autenticidad de tus joyas',
    icon: Shield,
    features: [
      'Escaneo de QR rápido',
      'Historial completo de la joya',
      'Verificación blockchain',
    ],
    roles: ['cliente'],
  },
  {
    title: 'Marketplace Premium',
    description: 'Explora joyas de lujo certificadas de joyerías verificadas',
    icon: ShoppingBag,
    features: [
      'Catálogo premium',
      'Filtros avanzados',
      'Compra segura',
    ],
    roles: ['cliente'],
  },
];

interface OnboardingModalProps {
  open: boolean;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onComplete }) => {
  const { role } = useUserRole();
  const [currentStep, setCurrentStep] = useState(0);

  // Get steps based on role
  const onboardingSteps = useMemo(() => {
    if (role === 'joyero') return joyeroSteps;
    if (role === 'cliente') return clienteSteps;
    return joyeroSteps; // Default
  }, [role]);

  const isLastStep = currentStep === onboardingSteps.length - 1;
  const step = onboardingSteps[currentStep];
  const Icon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSkip = () => {
    onComplete();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-background dark:bg-card border-border shadow-xl">
        <DialogHeader className="p-6 pb-4 space-y-3 bg-muted/30 dark:bg-accent/10">
          <div className="flex items-center justify-between">
            <VeralixLogo size={48} />
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Saltar
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            {onboardingSteps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "w-8 bg-primary" 
                    : "w-2 bg-muted"
                )}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="p-6 pt-2">
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shadow-glow">
              <Icon className="w-10 h-10 text-primary" />
            </div>

            <div className="space-y-2">
              <DialogTitle className="text-2xl font-heading">{step.title}</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground max-w-md">
                {step.description}
              </DialogDescription>
            </div>

            {step.features && (
              <div className="w-full max-w-md space-y-3 pt-2">
                {step.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 text-left p-3 rounded-lg bg-card/80 dark:bg-accent/20 border border-border"
                  >
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 pt-4 border-t border-border bg-muted/20 dark:bg-accent/5">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={currentStep === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentStep + 1} de {onboardingSteps.length}
          </span>

          <Button
            variant={isLastStep ? "default" : "outline"}
            onClick={handleNext}
            className="gap-2"
          >
            {isLastStep ? (
              <>
                Comenzar
                <Sparkles className="w-4 h-4" />
              </>
            ) : (
              <>
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
