import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MessageCircle, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateWhatsAppNumber, COUNTRY_CODES } from "@/utils/whatsappHelper";

interface EditWhatsAppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentPhone?: string;
  currentCountry?: string;
  userName: string;
  onSuccess: () => void;
}

export function EditWhatsAppModal({
  open,
  onOpenChange,
  userId,
  currentPhone = '',
  currentCountry = 'Colombia',
  userName,
  onSuccess
}: EditWhatsAppModalProps) {
  const [phone, setPhone] = useState(currentPhone);
  const [country, setCountry] = useState(currentCountry);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    // Validar
    if (!phone.trim()) {
      setError('El número de WhatsApp es obligatorio');
      return;
    }

    const validation = validateWhatsAppNumber(phone, country);
    if (!validation.isValid) {
      setError(validation.error || 'Número inválido');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: validation.cleanNumber,
          country: country
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast({
        title: "WhatsApp actualizado",
        description: `Número de ${userName} actualizado correctamente`,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error('Error updating WhatsApp:', err);
      toast({
        title: "Error",
        description: "No se pudo actualizar el número de WhatsApp",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Editar WhatsApp
          </DialogTitle>
          <DialogDescription>
            Configurar número de WhatsApp para {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(COUNTRY_CODES).map((countryName) => (
                  <SelectItem key={countryName} value={countryName}>
                    {countryName} (+{COUNTRY_CODES[countryName]})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">
              Número de WhatsApp <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phone"
              placeholder="Ej: 3001234567"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError('');
              }}
              className={error ? 'border-destructive' : ''}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Código país: +{COUNTRY_CODES[country]}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
