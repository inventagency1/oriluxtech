import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ImageIcon, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const ImageMigrationButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    fixed: number;
    errors?: any[];
    message?: string;
  } | null>(null);
  const { toast } = useToast();

  const handleMigration = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('migrate-jewelry-images', {
        method: 'POST'
      });

      if (error) throw error;

      setResult(data);
      
      toast({
        title: data.success ? "Migración exitosa" : "Migración completada con errores",
        description: data.message || `${data.fixed} imágenes migradas correctamente`,
        variant: data.success ? "default" : "destructive",
      });
    } catch (error: any) {
      console.error('Migration error:', error);
      toast({
        title: "Error en migración",
        description: error.message || "No se pudo completar la migración",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Migración de Imágenes
        </CardTitle>
        <CardDescription>
          Arreglar joyas antiguas que tienen imágenes en storage pero no tienen main_image_url configurado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={handleMigration} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Migrando imágenes...
            </>
          ) : (
            <>
              <ImageIcon className="w-4 h-4 mr-2" />
              Ejecutar Migración
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-2 p-4 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              )}
              <span className="font-semibold">
                {result.message || 'Migración completada'}
              </span>
            </div>
            
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-400">
                ✓ {result.fixed} arregladas
              </Badge>
              
              {result.errors && result.errors.length > 0 && (
                <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                  ⚠ {result.errors.length} errores
                </Badge>
              )}
            </div>

            {result.errors && result.errors.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-muted-foreground">
                  Ver errores ({result.errors.length})
                </summary>
                <div className="mt-2 space-y-1 text-xs">
                  {result.errors.map((err: any, i: number) => (
                    <div key={i} className="text-red-600 dark:text-red-400">
                      {err.id}: {err.error}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};