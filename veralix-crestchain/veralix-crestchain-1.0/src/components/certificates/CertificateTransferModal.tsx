import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useCertificateTransfers } from '@/hooks/useCertificateTransfers';
import { Send, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const transferSchema = z.object({
  recipientEmail: z.string().email('Email inválido').min(1, 'Email requerido'),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type TransferFormData = z.infer<typeof transferSchema>;

interface CertificateTransferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  certificateId: string;
  certificateName: string;
  onSuccess?: () => void;
}

export function CertificateTransferModal({
  open,
  onOpenChange,
  certificateId,
  certificateName,
  onSuccess,
}: CertificateTransferModalProps) {
  const { initiateTransfer, isLoading } = useCertificateTransfers();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
  });

  const onSubmit = async (data: TransferFormData) => {
    setError(null);
    const result = await initiateTransfer({
      certificateId,
      recipientEmail: data.recipientEmail,
      notes: data.notes,
    });

    if (result.error) {
      setError(result.error);
    } else if (result.success) {
      reset();
      onOpenChange(false);
      onSuccess?.();
    }
  };

  const handleClose = () => {
    reset();
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-primary" />
            Transferir Certificado
          </DialogTitle>
          <DialogDescription>
            Transfiere la propiedad del certificado <strong>{certificateName}</strong> a otro usuario.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="recipientEmail">
              Email del destinatario <span className="text-destructive">*</span>
            </Label>
            <Input
              id="recipientEmail"
              type="email"
              placeholder="usuario@ejemplo.com"
              {...register('recipientEmail')}
              className={errors.recipientEmail ? 'border-destructive' : ''}
            />
            {errors.recipientEmail && (
              <p className="text-sm text-destructive">{errors.recipientEmail.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              El destinatario debe estar registrado en Veralix
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Agrega notas sobre esta transferencia..."
              rows={4}
              {...register('notes')}
              className={errors.notes ? 'border-destructive' : ''}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes.message}</p>
            )}
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Importante:</strong> Una vez que el destinatario acepte la transferencia,
              perderás el acceso a este certificado. Esta acción no se puede deshacer.
            </AlertDescription>
          </Alert>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-gold hover:shadow-gold transition-premium"
            >
              {isLoading ? 'Enviando...' : 'Enviar Transferencia'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
