import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Upload } from "lucide-react";
import type { ProfileData } from "@/types";

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl?: string;
  userName: string;
  onAvatarUpdate: (url: string) => void;
}

export function AvatarUpload({ userId, currentAvatarUrl, userName, onAvatarUpdate }: AvatarUploadProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo de imagen",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "La imagen debe ser menor a 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('jewelry-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('jewelry-images')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL using upsert for safety
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert(
          { user_id: userId, avatar_url: publicUrl },
          { onConflict: 'user_id' }
        );

      if (updateError) {
        console.error('Avatar update error:', updateError);
        throw updateError;
      }

      onAvatarUpdate(publicUrl);
      
      toast({
        title: "Avatar actualizado",
        description: "Tu foto de perfil ha sido actualizada exitosamente",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative group">
      <Avatar className="w-24 h-24 border-4 border-primary/20 shadow-veralix-gold">
        <AvatarImage src={currentAvatarUrl} alt={userName} />
        <AvatarFallback className="bg-gradient-veralix-gold text-primary-foreground text-2xl font-heading">
          {getInitials(userName || "U")}
        </AvatarFallback>
      </Avatar>
      
      <Button
        size="sm"
        variant="secondary"
        className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 shadow-veralix-premium opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
      >
        {isUploading ? (
          <Upload className="w-4 h-4 animate-pulse" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
}
