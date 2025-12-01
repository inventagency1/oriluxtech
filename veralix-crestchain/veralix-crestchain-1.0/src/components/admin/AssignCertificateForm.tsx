import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileItem {
  user_id: string;
  full_name: string | null;
  email: string | null;
}

interface GeneratedCertificate {
  id: string;
  certificateId: string;
  verificationUrl: string;
  qrCodeUrl: string;
}

export function AssignCertificateForm() {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<ProfileItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [tokenId, setTokenId] = useState("");
  const [jewelryName, setJewelryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [result, setResult] = useState<GeneratedCertificate | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadUsers = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .order('full_name', { ascending: true });
      if (error) return;
      setUsers((data || []) as ProfileItem[]);
    };
    loadUsers();
  }, []);

  const handleAssign = async () => {
    if (!selectedUserId || !tokenId || !jewelryName) {
      toast({ title: "Error", description: "Todos los campos son obligatorios", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: jewelryItem, error: insertError } = await supabase
        .from('jewelry_items')
        .insert({
          user_id: selectedUserId,
          name: jewelryName,
          type: 'otro',
          status: 'pending'
        })
        .select('id')
        .single();

      if (insertError || !jewelryItem) {
        throw new Error(insertError?.message || 'No se pudo crear la joya');
      }

      const response = await supabase.functions.invoke('generate-nft-certificate', {
        body: {
          jewelryItemId: jewelryItem.id,
          userId: selectedUserId
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Error generando certificado');
      }

      const data = response.data as any;
      if (!data?.success || !data?.certificate) {
        throw new Error(data?.error || 'No se pudo generar el certificado');
      }

      const certId = data.certificate.id as string;

      if (tokenId) {
        await supabase
          .from('nft_certificates')
          .update({ token_id: tokenId })
          .eq('id', certId);
      }

      setResult({
        id: certId,
        certificateId: data.certificate.certificateId,
        verificationUrl: data.certificate.verificationUrl || data.certificate.certificateViewUrl,
        qrCodeUrl: data.certificate.qrCodeUrl
      });
      setSuccess(true);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || 'Ocurrió un error', variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="default" size="sm">
        Asignar Certificado NFT
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Asignar Certificado NFT</DialogTitle>
            <DialogDescription>
              Asigna un NFT existente a un usuario registrado
            </DialogDescription>
          </DialogHeader>

          {!success ? (
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="user">Usuario</Label>
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger id="user">
                    <SelectValue placeholder="Selecciona un usuario" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((u) => (
                      <SelectItem key={u.user_id} value={u.user_id}>
                        {(u.full_name || 'Sin nombre')} {u.email ? `(${u.email})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="tokenId">Token ID (NFT CrestChain)</Label>
                <Input id="tokenId" type="number" value={tokenId} onChange={(e) => setTokenId(e.target.value)} placeholder="Ingresa el ID del NFT" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="jewelryName">Nombre de la Joya</Label>
                <Input id="jewelryName" value={jewelryName} onChange={(e) => setJewelryName(e.target.value)} placeholder="Ej: Anillo de Oro" />
              </div>
            </div>
          ) : (
            <Card className="mt-2">
              <CardHeader>
                <CardTitle>Certificado asignado</CardTitle>
                <CardDescription>Enlace de verificación y QR generados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Enlace de Verificación</Label>
                  <Input value={result?.verificationUrl || ''} readOnly />
                </div>
                <div>
                  <Label>QR Code</Label>
                  <div className="flex justify-center p-4">
                    {result?.qrCodeUrl && (
                      <img src={result.qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <DialogFooter>
            {!success ? (
              <Button onClick={handleAssign} disabled={loading}>
                {loading ? 'Asignando...' : 'Asignar'}
              </Button>
            ) : (
              <Button onClick={() => { setSuccess(false); setOpen(false); }}>
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}