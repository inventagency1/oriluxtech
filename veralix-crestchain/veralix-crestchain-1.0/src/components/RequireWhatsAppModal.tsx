import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { validateWhatsAppNumber } from "@/utils/whatsappHelper";

const COUNTRIES = [
  { code: 'Colombia', prefix: '+57' },
  { code: 'México', prefix: '+52' },
  { code: 'Argentina', prefix: '+54' },
  { code: 'Chile', prefix: '+56' },
  { code: 'Perú', prefix: '+51' },
  { code: 'Ecuador', prefix: '+593' },
  { code: 'Venezuela', prefix: '+58' },
  { code: 'Bolivia', prefix: '+591' },
  { code: 'Paraguay', prefix: '+595' },
  { code: 'Uruguay', prefix: '+598' },
  { code: 'Costa Rica', prefix: '+506' },
  { code: 'Panamá', prefix: '+507' },
  { code: 'Guatemala', prefix: '+502' },
  { code: 'Honduras', prefix: '+504' },
  { code: 'Nicaragua', prefix: '+505' },
  { code: 'El Salvador', prefix: '+503' },
  { code: 'República Dominicana', prefix: '+1809' },
  { code: 'Puerto Rico', prefix: '+1787' },
  { code: 'España', prefix: '+34' },
  { code: 'Estados Unidos', prefix: '+1' },
];

interface RequireWhatsAppModalProps {
  userId: string;
  onComplete: () => void;
}

/**
 * Modal bloqueante que obliga a joyerías a registrar su WhatsApp
 * No se puede cerrar hasta completar el registro
 */
export const RequireWhatsAppModal = ({ userId, onComplete }: RequireWhatsAppModalProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("Colombia");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validar número de teléfono
    const validation = validateWhatsAppNumber(phone, country);
    if (!validation.isValid) {
      setError(validation.error || "Formato de número inválido");
      return;
    }

    setIsLoading(true);

    try {
      // Actualizar perfil con número de WhatsApp
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          phone: validation.cleanNumber,
          country: country,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      toast({
        title: "✅ WhatsApp registrado",
        description: "Ahora puedes usar todas las funciones de Veralix",
      });

      onComplete();
    } catch (err) {
      console.error('Error updating WhatsApp:', err);
      toast({
        title: "Error",
        description: "No se pudo guardar el número de WhatsApp",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-6 h-6 text-yellow-500" />
            <DialogTitle className="text-xl">WhatsApp Requerido</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Tu joyería debe registrar un número de WhatsApp para continuar usando Veralix.
            Este número será usado para:
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2 text-sm text-muted-foreground mb-4">
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Contacto directo con clientes desde el Marketplace</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Asistente de ventas con IA</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary">•</span>
            <span>Cierre de ventas automático</span>
          </li>
        </ul>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code} ({c.prefix})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Número de WhatsApp</Label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-muted rounded-md border min-w-[80px]">
                <span className="text-sm font-medium">
                  {COUNTRIES.find(c => c.code === country)?.prefix}
                </span>
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="3001234567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ''));
                  setError("");
                }}
                className={error ? "border-destructive" : ""}
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Ingresa solo números, sin espacios ni caracteres especiales
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading || phone.length < 7}
            >
              <Phone className="w-4 h-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar WhatsApp"}
            </Button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-md">
          <p className="text-xs text-yellow-600 dark:text-yellow-500">
            <strong>Nota:</strong> No podrás usar el Dashboard ni otras funciones hasta completar este paso.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
