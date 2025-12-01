import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { SearchFilters } from '@/hooks/useAdvancedSearch';

interface AdvancedFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}

const jewelryTypes = [
  { value: 'anillo', label: 'Anillos' },
  { value: 'collar', label: 'Collares' },
  { value: 'pulsera', label: 'Pulseras' },
  { value: 'aretes', label: 'Aretes' },
  { value: 'reloj', label: 'Relojes' },
  { value: 'cadena', label: 'Cadenas' },
  { value: 'pendiente', label: 'Pendientes' },
  { value: 'dije', label: 'Dijes' },
];

const materials = [
  'Oro', 'Plata', 'Platino', 'Diamante', 'Esmeralda',
  'Rubí', 'Zafiro', 'Perla', 'Acero', 'Titanio'
];

export const AdvancedFilters = ({ filters, onFiltersChange }: AdvancedFiltersProps) => {
  const handleClearAll = () => {
    onFiltersChange({ sortBy: 'relevance' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg">
          Filtros
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearAll}
            className="h-auto py-1 px-2 text-xs"
          >
            Limpiar todo
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Rango de Precio */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Rango de Precio</Label>
          <div className="pt-2">
            <Slider
              min={0}
              max={10000000}
              step={100000}
              value={[filters.minPrice || 0, filters.maxPrice || 10000000]}
              onValueChange={([min, max]) =>
                onFiltersChange({ ...filters, minPrice: min, maxPrice: max })
              }
              className="w-full"
            />
            <div className="flex justify-between mt-3 text-sm text-muted-foreground">
              <span>{formatCurrency(filters.minPrice || 0)}</span>
              <span>{formatCurrency(filters.maxPrice || 10000000)}</span>
            </div>
          </div>
        </div>

        {/* Tipo de Joya */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Tipo de Joya</Label>
          <div className="space-y-2">
            {jewelryTypes.map((type) => (
              <div key={type.value} className="flex items-center space-x-2">
                <Checkbox
                  id={type.value}
                  checked={filters.types?.includes(type.value)}
                  onCheckedChange={(checked) => {
                    const newTypes = checked
                      ? [...(filters.types || []), type.value]
                      : filters.types?.filter((t) => t !== type.value) || [];
                    onFiltersChange({ ...filters, types: newTypes });
                  }}
                />
                <label
                  htmlFor={type.value}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Materiales */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Materiales</Label>
          <div className="space-y-2">
            {materials.map((material) => (
              <div key={material} className="flex items-center space-x-2">
                <Checkbox
                  id={material}
                  checked={filters.materials?.includes(material)}
                  onCheckedChange={(checked) => {
                    const newMaterials = checked
                      ? [...(filters.materials || []), material]
                      : filters.materials?.filter((m) => m !== material) || [];
                    onFiltersChange({ ...filters, materials: newMaterials });
                  }}
                />
                <label
                  htmlFor={material}
                  className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {material}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Rating Mínimo */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Calificación Mínima</Label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    minRating: filters.minRating === rating ? undefined : rating,
                  })
                }
                className={`flex items-center gap-1 px-3 py-2 rounded-md border transition-colors ${
                  filters.minRating === rating
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-border'
                }`}
              >
                <Star
                  className="w-4 h-4"
                  fill={filters.minRating === rating ? 'currentColor' : 'none'}
                />
                <span className="text-sm">{rating}+</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
