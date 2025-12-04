import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Gem, 
  Upload, 
  X, 
  Camera, 
  Coins, 
  MapPin, 
  Calendar,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useOnboarding } from "@/hooks/useOnboarding";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { useNFTCertificate } from "@/hooks/useNFTCertificate";
import { AppLayout } from "@/components/layout/AppLayout";

type JewelryType = Database["public"]["Enums"]["jewelry_type"];

const NewJewelry = () => {
  const [formData, setFormData] = useState({
    name: "",
    type: "" as JewelryType | "",
    typeDisplay: "", // Nombre específico del tipo (ej: "Cadena Italiana")
    description: "",
    materials: [] as string[],
    weight: "",
    dimensions: "",
    origin: "",
    craftsman: "",
    salePrice: "",
    currency: "COP",
    purchaseDate: "",
    serialNumber: "",
    certification: ""
  });
  const [images, setImages] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { generateCertificate } = useNFTCertificate();
  const { autoCompleteTask } = useOnboarding();

  // Tipos de joyas con referencias reales del negocio
  const jewelryTypes = [
    // Cadenas
    { display: "Cadena Italiana", value: "cadena" as JewelryType, id: "cadena-italiana" },
    { display: "Cadena Eslabón", value: "cadena" as JewelryType, id: "cadena-eslabon" },
    { display: "Cadena Rústica", value: "cadena" as JewelryType, id: "cadena-rustica" },
    // Anillos
    { display: "Anillo Caballero", value: "anillo" as JewelryType, id: "anillo-caballero" },
    { display: "Anillo de Compromiso", value: "anillo" as JewelryType, id: "anillo-compromiso" },
    { display: "Anillo Dama", value: "anillo" as JewelryType, id: "anillo-dama" },
    { display: "Argolla de Matrimonio", value: "anillo" as JewelryType, id: "argolla-matrimonio" },
    // Dijes y Colgantes
    { display: "Dije", value: "dije" as JewelryType, id: "dije" },
    // Pulseras
    { display: "Pulsera Italiana", value: "pulsera" as JewelryType, id: "pulsera-italiana" },
    { display: "Pulsera Eslabón", value: "pulsera" as JewelryType, id: "pulsera-eslabon" },
    { display: "Pulsera Tejida con Balineria", value: "pulsera" as JewelryType, id: "pulsera-tejida" },
    // Rosarios
    { display: "Rosario", value: "collar" as JewelryType, id: "rosario" },
    // Aretes
    { display: "Topos", value: "pendientes" as JewelryType, id: "topos" },
    { display: "Candongas", value: "pendientes" as JewelryType, id: "candongas" },
    // Otros
    { display: "Set Cadena + Dije", value: "otro" as JewelryType, id: "set-cadena-dije" },
    { display: "Otro", value: "otro" as JewelryType, id: "otro" }
  ];

  // Materiales actualizados con tipos de oro y piedras preciosas
  const commonMaterials = [
    // Tipos de Oro
    "Oro 18k Nacional",
    "Oro 18k Italiano Ley 750", 
    "Oro 14k", 
    "Oro 10k",
    // Plata y Platino
    "Plata 925", 
    "Platino",
    // Piedras Preciosas
    "Diamante", 
    "Esmeralda", 
    "Rubí", 
    "Zafiro",
    // Perlas
    "Perlas Naturales",
    "Perlas Cultivadas",
    // Otras piedras
    "Topacio", 
    "Amatista", 
    "Cuarzo",
    "Aguamarina",
    "Ópalo"
  ];

  const currencies = ["COP", "USD", "EUR"];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addMaterial = (material: string) => {
    if (!formData.materials.includes(material)) {
      setFormData(prev => ({
        ...prev,
        materials: [...prev.materials, material]
      }));
    }
  };

  const removeMaterial = (material: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m !== material)
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 5) {
      toast({
        title: "Límite de imágenes",
        description: "Máximo 5 imágenes por joya",
        variant: "destructive",
      });
      return;
    }
    setImages(prev => [...prev, ...files]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async (jewelryId: string): Promise<string[]> => {
    const uploadPromises = images.map(async (image, index) => {
      const fileExt = image.name.split('.').pop();
      // Use consistent naming: main.ext for first image, image-N.ext for others
      const imageName = index === 0 ? `main.${fileExt}` : `image-${index}.${fileExt}`;
      const filePath = `${user?.id}/${jewelryId}/${imageName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('jewelry-images')
        .upload(filePath, image);

      if (uploadError) {
        throw new Error(`Error uploading image ${index + 1}: ${uploadError.message}`);
      }

      // Return the complete public URL directly
      return `https://hykegpmjnpaupvwptxtl.supabase.co/storage/v1/object/public/jewelry-images/${filePath}`;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Error de autenticación",
        description: "Debes estar logueado para registrar una joya",
        variant: "destructive",
      });
      return;
    }

    // Validación de campos obligatorios
    if (!formData.name || !formData.type || !formData.salePrice) {
      toast({
        title: "Campos obligatorios",
        description: "Por favor completa todos los campos marcados con *",
        variant: "destructive",
      });
      return;
    }

    // Validación de precio
    const priceValue = parseFloat(formData.salePrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Precio inválido",
        description: "El precio debe ser un número mayor a 0",
        variant: "destructive",
      });
      return;
    }

    // Validación de descripción
    if (formData.description && formData.description.length < 20) {
      toast({
        title: "Descripción muy corta",
        description: "La descripción debe tener al menos 20 caracteres para un certificado de calidad",
        variant: "destructive",
      });
      return;
    }

    // Validación de materiales
    if (formData.materials.length === 0) {
      toast({
        title: "Materiales requeridos",
        description: "Debes especificar al menos un material para la joya",
        variant: "destructive",
      });
      return;
    }

    // Validación de peso
    if (formData.weight && (isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) <= 0)) {
      toast({
        title: "Peso inválido",
        description: "Si especificas el peso, debe ser un número mayor a 0",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Insert jewelry item into database
      const { data: jewelryData, error: jewelryError } = await supabase
        .from('jewelry_items')
        .insert({
          user_id: user.id,
          name: formData.name,
          type: formData.type as JewelryType,
          description: formData.description || null,
          materials: formData.materials,
          weight: formData.weight ? parseFloat(formData.weight) : null,
          dimensions: formData.dimensions || null,
          origin: formData.origin || null,
          craftsman: formData.craftsman || null,
          serial_number: formData.serialNumber || null,
          certification_info: formData.certification || null,
          sale_price: parseFloat(formData.salePrice),
          currency: formData.currency,
          purchase_date: formData.purchaseDate || null,
          images_count: images.length,
          status: 'draft'
        })
        .select()
        .single();

      if (jewelryError) {
        throw new Error(jewelryError.message);
      }

      // Upload images if any
      if (images.length > 0) {
        const imageUrls = await uploadImages(jewelryData.id);
        const mainImageUrl = imageUrls[0] || null;
        
        // Update jewelry item with image URLs
        const { error: updateError } = await supabase
          .from('jewelry_items')
          .update({
            main_image_url: mainImageUrl,
            image_urls: imageUrls
          })
          .eq('id', jewelryData.id);
          
        if (updateError) {
          console.error('Error updating image URLs:', updateError);
        }
      }

      // Generate NFT certificate automatically
      const certificateResult = await generateCertificate(jewelryData.id);
      
      if (certificateResult.success) {
        toast({
          title: "¡Joya registrada y certificada!",
          description: `"${formData.name}" ha sido registrada y su certificado NFT generado exitosamente. ID: ${certificateResult.certificate?.id}`,
        });
        // Auto-complete onboarding task
        await autoCompleteTask('first-jewelry');
      } else {
        toast({
          title: "Joya registrada - Certificado pendiente",
          description: `"${formData.name}" fue registrada, pero hubo un problema generando el certificado NFT. Puedes intentar nuevamente desde el dashboard.`,
          variant: "destructive",
        });
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating jewelry item:', error);
      toast({
        title: "Error al registrar la joya",
        description: error instanceof Error ? error.message : "Ocurrió un error inesperado",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold font-heading mb-2">
              Registrar Nueva Joya
            </h1>
            <p className="text-muted-foreground">
              Completa la información para generar el certificado NFT
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* Basic Information */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center text-base sm:text-xl">
                  <Gem className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                  Información Básica
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Datos principales de la pieza de joyería
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Joya *</Label>
                    <Input
                      id="name"
                      type="text"
                      autoComplete="off"
                      placeholder="Anillo de Oro con Diamante"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                      aria-label="Nombre de la joya"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Tipo de Joya *</Label>
                    <Select 
                      value={formData.typeDisplay || formData.type} 
                      onValueChange={(selectedId) => {
                        const selectedType = jewelryTypes.find(t => t.id === selectedId);
                        if (selectedType) {
                          setFormData(prev => ({
                            ...prev,
                            type: selectedType.value,
                            typeDisplay: selectedType.display
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo">
                          {formData.typeDisplay || "Seleccionar tipo"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {jewelryTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>{type.display}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe la joya, su estilo, características especiales... (mínimo 20 caracteres)"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    rows={3}
                  />
                  {formData.description && formData.description.length < 20 && (
                    <p className="text-xs text-muted-foreground">
                      {formData.description.length}/20 caracteres (recomendado para certificado de calidad)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Materiales *</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.materials.map((material) => (
                      <Badge key={material} variant="secondary" className="px-3 py-1">
                        {material}
                        <button
                          type="button"
                          onClick={() => removeMaterial(material)}
                          className="ml-2 text-muted-foreground hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Select onValueChange={addMaterial}>
                    <SelectTrigger>
                      <SelectValue placeholder="Agregar material" />
                    </SelectTrigger>
                    <SelectContent>
                      {commonMaterials
                        .filter(material => !formData.materials.includes(material))
                        .map((material) => (
                        <SelectItem key={material} value={material}>{material}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Physical Details */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                 <CardTitle className="flex items-center text-base sm:text-xl">
                   <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-primary" />
                   Detalles Físicos
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Peso (gramos)</Label>
                    <Input
                      id="weight"
                      type="text"
                      inputMode="decimal"
                      placeholder="15.5"
                      value={formData.weight}
                      onChange={(e) => handleInputChange("weight", e.target.value)}
                      aria-label="Peso en gramos"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dimensions">Dimensiones</Label>
                    <Input
                      id="dimensions"
                      type="text"
                      placeholder="2.5 x 1.8 cm"
                      value={formData.dimensions}
                      onChange={(e) => handleInputChange("dimensions", e.target.value)}
                      aria-label="Dimensiones de la joya"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="serialNumber">Número de Serie</Label>
                    <Input
                      id="serialNumber"
                      placeholder="VRX-2024-001"
                      value={formData.serialNumber}
                      onChange={(e) => handleInputChange("serialNumber", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="certification">Certificación Previa</Label>
                    <Input
                      id="certification"
                      placeholder="GIA, IGI, etc."
                      value={formData.certification}
                      onChange={(e) => handleInputChange("certification", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Origen y Procedencia */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                 <CardTitle className="flex items-center">
                   <MapPin className="w-5 h-5 mr-2 text-primary" />
                   Origen y Procedencia
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="origin">Origen/Fabricante</Label>
                    <Input
                      id="origin"
                      placeholder="Italia, Colombia, etc."
                      value={formData.origin}
                      onChange={(e) => handleInputChange("origin", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="craftsman">Artesano/Marca</Label>
                    <Input
                      id="craftsman"
                      placeholder="Nombre del artesano o marca"
                      value={formData.craftsman}
                      onChange={(e) => handleInputChange("craftsman", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Comercial */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                 <CardTitle className="flex items-center">
                   <Coins className="w-5 h-5 mr-2 text-primary" />
                   Información Comercial
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="salePrice">Precio de Venta *</Label>
                    <Input
                      id="salePrice"
                      type="text"
                      inputMode="numeric"
                      placeholder="850000"
                      value={formData.salePrice}
                      onChange={(e) => handleInputChange("salePrice", e.target.value)}
                      required
                      aria-label="Precio de venta"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select value={formData.currency} onValueChange={(value) => handleInputChange("currency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="purchaseDate">Fecha de Venta</Label>
                    <Input
                      id="purchaseDate"
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => handleInputChange("purchaseDate", e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Imágenes */}
            <Card className="shadow-premium border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-primary" />
                  Fotografías de la Joya
                </CardTitle>
                <CardDescription>
                  Agrega hasta 5 imágenes de alta calidad (máximo 5MB cada una)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(image)}
                        alt={`Joya ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  {images.length < 5 && (
                    <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                      <Upload className="w-6 h-6 text-muted-foreground mb-1" />
                      <span className="text-xs text-muted-foreground">Agregar</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Submit */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/dashboard')}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="w-full sm:flex-1 bg-gradient-gold hover:shadow-gold transition-premium h-12 text-base sm:text-lg font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Registrando joya..." : "Registrar Joya"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default NewJewelry;