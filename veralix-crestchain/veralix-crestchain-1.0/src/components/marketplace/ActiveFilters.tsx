import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchFilters } from '@/hooks/useAdvancedSearch';

interface ActiveFiltersProps {
  filters: SearchFilters;
  onRemoveFilter: (key: keyof SearchFilters, value?: string) => void;
  onClearAll: () => void;
}

export const ActiveFilters = ({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const activeFilters: Array<{
    key: keyof SearchFilters;
    label: string;
    value?: string;
  }> = [];

  if (filters.query) {
    activeFilters.push({ key: 'query', label: `"${filters.query}"` });
  }

  if (filters.minPrice && filters.minPrice > 0) {
    activeFilters.push({
      key: 'minPrice',
      label: `Desde ${formatCurrency(filters.minPrice)}`,
    });
  }

  if (filters.maxPrice && filters.maxPrice < 10000000) {
    activeFilters.push({
      key: 'maxPrice',
      label: `Hasta ${formatCurrency(filters.maxPrice)}`,
    });
  }

  if (filters.types && filters.types.length > 0) {
    filters.types.forEach((type) => {
      activeFilters.push({
        key: 'types',
        label: type.charAt(0).toUpperCase() + type.slice(1),
        value: type,
      });
    });
  }

  if (filters.materials && filters.materials.length > 0) {
    filters.materials.forEach((material) => {
      activeFilters.push({
        key: 'materials',
        label: material,
        value: material,
      });
    });
  }

  if (filters.minRating) {
    activeFilters.push({
      key: 'minRating',
      label: `${filters.minRating}+ estrellas`,
    });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center p-4 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">
        Filtros activos:
      </span>
      {activeFilters.map((filter, i) => (
        <Badge
          key={`${filter.key}-${filter.value || ''}-${i}`}
          variant="secondary"
          className="gap-1 pr-1 py-1"
        >
          <span>{filter.label}</span>
          <button
            onClick={() => onRemoveFilter(filter.key, filter.value)}
            className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-auto py-1 px-2 text-xs ml-2"
      >
        Limpiar todo
      </Button>
    </div>
  );
};
