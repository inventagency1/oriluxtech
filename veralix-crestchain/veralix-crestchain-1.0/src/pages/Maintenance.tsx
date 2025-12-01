import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWaitlist } from '@/hooks/useWaitlist';
import { useMaintenanceMode } from '@/hooks/useMaintenanceMode';
import { Settings, Mail, User, Phone, Building2, MessageSquare, CheckCircle2 } from 'lucide-react';

const waitlistSchema = z.object({
  email: z.string().email('Email inválido'),
  full_name: z.string().min(3, 'Mínimo 3 caracteres'),
  phone: z.string().optional(),
  user_type: z.enum(['joyero', 'cliente', 'otro']),
  company_name: z.string().optional(),
  interest_reason: z.string().max(500).optional()
});

type WaitlistForm = z.infer<typeof waitlistSchema>;

export default function Maintenance() {
  const [submitted, setSubmitted] = useState(false);
  const { submitWaitlistEntry } = useWaitlist();
  const { maintenanceData } = useMaintenanceMode();

  const { register, handleSubmit, formState: { errors, isSubmitting }, watch } = useForm<WaitlistForm>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      user_type: 'cliente'
    }
  });

  const userType = watch('user_type');

  const onSubmit = async (data: WaitlistForm) => {
    const result = await submitWaitlistEntry({
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      user_type: data.user_type,
      company_name: data.company_name,
      interest_reason: data.interest_reason
    });
    if (result.success) {
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">¡Gracias por tu interés!</h2>
            <p className="text-muted-foreground">
              Te notificaremos por email cuando Veralix esté nuevamente disponible.
            </p>
          </div>
          <Button
            onClick={() => setSubmitted(false)}
            variant="outline"
            className="w-full"
          >
            Registrar otro email
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
              <Settings className="w-10 h-10 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Estamos mejorando para ti
          </h1>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            {maintenanceData?.message || 'Estamos realizando mejoras en Veralix. Vuelve pronto.'}
          </p>
          {maintenanceData?.estimated_end && (
            <p className="text-sm text-muted-foreground">
              Tiempo estimado: {new Date(maintenanceData.estimated_end).toLocaleString('es-ES')}
            </p>
          )}
        </div>

        {/* Waitlist Form */}
        <Card className="p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Únete a la lista de espera</h2>
            <p className="text-muted-foreground">
              Regístrate y te notificaremos cuando Veralix esté disponible
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email *
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Nombre completo *
              </Label>
              <Input
                id="full_name"
                placeholder="Juan Pérez"
                {...register('full_name')}
                className={errors.full_name ? 'border-destructive' : ''}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Teléfono (opcional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+57 300 123 4567"
                {...register('phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_type">
                ¿Eres joyero o cliente? *
              </Label>
              <Select
                defaultValue="cliente"
                onValueChange={(value) => register('user_type').onChange({ target: { value } })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="joyero">Joyero / Vendedor</SelectItem>
                  <SelectItem value="cliente">Cliente / Comprador</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {userType === 'joyero' && (
              <div className="space-y-2">
                <Label htmlFor="company_name" className="flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Nombre de la empresa (opcional)
                </Label>
                <Input
                  id="company_name"
                  placeholder="Joyería XYZ"
                  {...register('company_name')}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="interest_reason" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                ¿Por qué te interesa Veralix? (opcional)
              </Label>
              <Textarea
                id="interest_reason"
                placeholder="Cuéntanos qué funcionalidad te gustaría usar..."
                {...register('interest_reason')}
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Unirme a la lista de espera'}
            </Button>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>© 2025 Veralix. Certificación de joyas con blockchain.</p>
        </div>
      </div>
    </div>
  );
}
