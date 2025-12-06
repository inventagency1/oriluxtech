import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO, StructuredData } from "@/utils/seoHelpers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AppLayout } from "@/components/layout/AppLayout";
import { useOptimizedMarketplaceListings } from "@/hooks/useOptimizedMarketplaceListings";
import { MarketplaceItemCard } from "@/components/marketplace/MarketplaceItemCard";
import { toast } from "sonner";
import { 
  Search,
  Filter, 
  SlidersHorizontal,
  Grid3X3,
  LayoutGrid,
  List,
  Gem,
  Sparkles,
  Shield,
  TrendingUp,
  Clock,
  DollarSign,
  Star,
  X,
  ChevronDown,
  ChevronUp,
  Zap,
  Award,
  Heart,
  Eye,
  ArrowUpDown,
  RefreshCw
} from "lucide-react";

const ITEMS_PER_PAGE = 12;

// Tipos de joya
const JEWELRY_TYPES = [
  { value: 'anillo', label: 'Anillos', icon: '💍' },
  { value: 'collar', label: 'Collares', icon: '📿' },
  { value: 'pulsera', label: 'Pulseras', icon: '⌚' },
  { value: 'aretes', label: 'Aretes', icon: '✨' },
  { value: 'reloj', label: 'Relojes', icon: '⏱️' },
  { value: 'cadena', label: 'Cadenas', icon: '⛓️' },
  { value: 'pendiente', label: 'Pendientes', icon: '💎' },
  { value: 'dije', label: 'Dijes', icon: '🔮' },
  { value: 'broche', label: 'Broches', icon: '📌' },
  { value: 'gemelos', label: 'Gemelos', icon: '🎯' },
];

// Materiales
const MATERIALS = [
  { value: 'oro', label: 'Oro', color: 'bg-yellow-500' },
  { value: 'plata', label: 'Plata', color: 'bg-gray-400' },
  { value: 'platino', label: 'Platino', color: 'bg-slate-300' },
  { value: 'diamante', label: 'Diamante', color: 'bg-cyan-300' },
  { value: 'esmeralda', label: 'Esmeralda', color: 'bg-emerald-500' },
  { value: 'rubi', label: 'Rubí', color: 'bg-red-500' },
  { value: 'zafiro', label: 'Zafiro', color: 'bg-blue-500' },
  { value: 'perla', label: 'Perla', color: 'bg-pink-100' },
  { value: 'acero', label: 'Acero', color: 'bg-zinc-500' },
  { value: 'titanio', label: 'Titanio', color: 'bg-violet-400' },
];

// Rangos de precio predefinidos
const PRICE_RANGES = [
  { label: 'Todos', min: 0, max: 100000000 },
  { label: 'Hasta $500K', min: 0, max: 500000 },
  { label: '$500K - $1M', min: 500000, max: 1000000 },
  { label: '$1M - $5M', min: 1000000, max: 5000000 },
  { label: '$5M - $10M', min: 5000000, max: 10000000 },
  { label: 'Más de $10M', min: 10000000, max: 100000000 },
];

// Opciones de ordenamiento
const SORT_OPTIONS = [
  { value: 'newest', label: 'Más recientes', icon: Clock },
  { value: 'price_asc', label: 'Menor precio', icon: DollarSign },
  { value: 'price_desc', label: 'Mayor precio', icon: TrendingUp },
  { value: 'popular', label: 'Más populares', icon: Heart },
  { value: 'rating', label: 'Mejor valorados', icon: Star },
];

interface Filters {
  search: string;
  types: string[];
  materials: string[];
  priceRange: { min: number; max: number };
  certified: boolean;
  featured: boolean;
  sortBy: string;
}

const MarketplacePro = () => {
  const navigate = useNavigate();
  const { data: paginatedData, isLoading, refetch } = useOptimizedMarketplaceListings();
  const allListings = paginatedData?.listings || [];
  
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "compact" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    types: true,
    materials: true,
    price: true,
    options: true
  });

  const [filters, setFilters] = useState<Filters>({
    search: '',
    types: [],
    materials: [],
    priceRange: { min: 0, max: 100000000 },
    certified: false,
    featured: false,
    sortBy: 'newest'
  });

  // Filtrar y ordenar listings
  const filteredListings = useMemo(() => {
    let result = [...allListings];

    // Búsqueda por texto
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => 
        item.jewelry_item?.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.jewelry_item?.type?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por tipo
    if (filters.types.length > 0) {
      result = result.filter(item => 
        filters.types.some(type => 
          item.jewelry_item?.type?.toLowerCase().includes(type.toLowerCase())
        )
      );
    }

    // Filtro por material
    if (filters.materials.length > 0) {
      result = result.filter(item => 
        filters.materials.some(material => 
          item.jewelry_item?.materials?.some((m: string) => m.toLowerCase().includes(material.toLowerCase()))
        )
      );
    }

    // Filtro por precio
    result = result.filter(item => {
      const price = item.price || 0;
      return price >= filters.priceRange.min && price <= filters.priceRange.max;
    });

    // Filtro por certificado
    if (filters.certified) {
      result = result.filter(item => item.certificate?.is_verified);
    }

    // Filtro por destacado
    if (filters.featured) {
      result = result.filter(item => item.featured);
    }

    // Ordenamiento
    switch (filters.sortBy) {
      case 'price_asc':
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price_desc':
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'popular':
        result.sort((a, b) => (b.views || 0) - (a.views || 0));
        break;
      case 'rating':
        result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
    }

    return result;
  }, [allListings, filters]);

  // Paginación
  const paginatedListings = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    return filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredListings, page]);

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);

  // Estadísticas
  const stats = useMemo(() => ({
    total: allListings.length,
    certified: allListings.filter(i => i.certificate?.is_verified).length,
    featured: allListings.filter(i => i.featured).length,
    avgPrice: allListings.length > 0 
      ? allListings.reduce((sum, i) => sum + (i.price || 0), 0) / allListings.length 
      : 0
  }), [allListings]);

  // Contar filtros activos
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.types.length > 0) count += filters.types.length;
    if (filters.materials.length > 0) count += filters.materials.length;
    if (filters.priceRange.min > 0 || filters.priceRange.max < 100000000) count++;
    if (filters.certified) count++;
    if (filters.featured) count++;
    return count;
  }, [filters]);

  const handleLike = (itemId: string) => {
    toast.success("¡Agregado a favoritos!");
  };

  const handleShare = (itemId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/marketplace/item/${itemId}`);
    toast.success("¡Enlace copiado!");
  };

  const handleBuy = (itemId: string) => {
    navigate(`/checkout?listing=${itemId}`);
  };

  const clearAllFilters = () => {
    setFilters({
      search: '',
      types: [],
      materials: [],
      priceRange: { min: 0, max: 100000000 },
      certified: false,
      featured: false,
      sortBy: 'newest'
    });
    setPage(1);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatPrice = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  useSEO({
    title: 'Marketplace de Joyería Certificada NFT | Veralix',
    description: 'Compra y vende joyas certificadas con NFT en blockchain. Marketplace seguro de joyería de alta gama con verificación de autenticidad.',
    keywords: 'marketplace joyería NFT, comprar joyas blockchain, vender joyas certificadas',
    canonical: 'https://veralix.io/marketplace'
  });

  // Componente de filtros lateral
  const FiltersPanel = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-emerald-500" />
          Filtros
        </h3>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs text-muted-foreground hover:text-destructive">
            <X className="w-3 h-3 mr-1" />
            Limpiar ({activeFiltersCount})
          </Button>
        )}
      </div>

      <Separator className="bg-border/50" />

      {/* Tipo de Joya */}
      <div className="space-y-3">
        <button 
          onClick={() => toggleSection('types')}
          className="flex items-center justify-between w-full text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <Gem className="w-4 h-4 text-emerald-500" />
            Tipo de Joya
          </span>
          {expandedSections.types ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.types && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {JEWELRY_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    types: prev.types.includes(type.value)
                      ? prev.types.filter(t => t !== type.value)
                      : [...prev.types, type.value]
                  }));
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  filters.types.includes(type.value)
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-emerald-500/30'
                }`}
              >
                <span>{type.icon}</span>
                {type.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator className="bg-border/50" />

      {/* Materiales */}
      <div className="space-y-3">
        <button 
          onClick={() => toggleSection('materials')}
          className="flex items-center justify-between w-full text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Materiales
          </span>
          {expandedSections.materials ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.materials && (
          <div className="flex flex-wrap gap-2 pt-2">
            {MATERIALS.map((material) => (
              <button
                key={material.value}
                onClick={() => {
                  setFilters(prev => ({
                    ...prev,
                    materials: prev.materials.includes(material.value)
                      ? prev.materials.filter(m => m !== material.value)
                      : [...prev.materials, material.value]
                  }));
                  setPage(1);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.materials.includes(material.value)
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                    : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-amber-500/30'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${material.color}`} />
                {material.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <Separator className="bg-border/50" />

      {/* Rango de Precio */}
      <div className="space-y-3">
        <button 
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            Rango de Precio
          </span>
          {expandedSections.price ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.price && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFilters(prev => ({ ...prev, priceRange: { min: range.min, max: range.max } }));
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    filters.priceRange.min === range.min && filters.priceRange.max === range.max
                      ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                      : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:border-green-500/30'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            <div className="px-2">
              <Slider
                min={0}
                max={50000000}
                step={500000}
                value={[filters.priceRange.min, filters.priceRange.max]}
                onValueChange={([min, max]) => {
                  setFilters(prev => ({ ...prev, priceRange: { min, max } }));
                  setPage(1);
                }}
                className="w-full"
              />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{formatPrice(filters.priceRange.min)}</span>
                <span>{formatPrice(filters.priceRange.max)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Separator className="bg-border/50" />

      {/* Opciones adicionales */}
      <div className="space-y-3">
        <button 
          onClick={() => toggleSection('options')}
          className="flex items-center justify-between w-full text-sm font-semibold"
        >
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-500" />
            Opciones
          </span>
          {expandedSections.options ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {expandedSections.options && (
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.certified}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({ ...prev, certified: !!checked }));
                  setPage(1);
                }}
              />
              <span className="flex items-center gap-2 text-sm group-hover:text-emerald-400 transition-colors">
                <Shield className="w-4 h-4 text-emerald-500" />
                Solo certificados NFT
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <Checkbox
                checked={filters.featured}
                onCheckedChange={(checked) => {
                  setFilters(prev => ({ ...prev, featured: !!checked }));
                  setPage(1);
                }}
              />
              <span className="flex items-center gap-2 text-sm group-hover:text-amber-400 transition-colors">
                <Award className="w-4 h-4 text-amber-500" />
                Solo destacados
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AppLayout>
      <StructuredData 
        type="Product" 
        data={{
          name: 'Marketplace de Joyería Certificada',
          description: 'Compra y vende joyas con certificación NFT blockchain',
          brand: { '@type': 'Brand', name: 'Veralix' },
          category: 'Joyería'
        }} 
      />
      
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 -m-4 md:-m-6 lg:-m-8">
        {/* Hero Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHptMCAzMmMtNy43MzIgMC0xNC02LjI2OC0xNC0xNHM2LjI2OC0xNCAxNC0xNCAxNCA2LjI2OCAxNCAxNC02LjI2OCAxNC0xNCAxNHoiIGZpbGw9InJnYmEoMTYsMTg1LDEyOSwwLjAzKSIvPjwvZz48L3N2Zz4=')] opacity-50"></div>
          
          <div className="relative container mx-auto px-6 py-12">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                  Marketplace
                </span>
                <span className="text-white"> de Joyería</span>
              </h1>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Descubre joyas únicas certificadas en blockchain. Autenticidad garantizada con NFT.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-white">{stats.total}</div>
                <div className="text-xs text-slate-400">Joyas disponibles</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-400">{stats.certified}</div>
                <div className="text-xs text-slate-400">Certificadas NFT</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-400">{stats.featured}</div>
                <div className="text-xs text-slate-400">Destacadas</div>
              </div>
              <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-cyan-400">{formatPrice(stats.avgPrice)}</div>
                <div className="text-xs text-slate-400">Precio promedio</div>
              </div>
            </div>
          </div>
        </div>

        {/* Search & Controls Bar */}
        <div className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-xl w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  placeholder="Buscar joyas, materiales, tipos..."
                  value={filters.search}
                  onChange={(e) => {
                    setFilters(prev => ({ ...prev, search: e.target.value }));
                    setPage(1);
                  }}
                  className="pl-12 pr-4 h-12 bg-slate-800/50 border-slate-700 focus:border-emerald-500 rounded-xl text-white placeholder:text-slate-500"
                />
                {filters.search && (
                  <button 
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
                {/* Mobile Filter Button */}
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden border-slate-700 bg-slate-800/50">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                      {activeFiltersCount > 0 && (
                        <Badge className="ml-2 bg-emerald-500">{activeFiltersCount}</Badge>
                      )}
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 bg-slate-900 border-slate-800 overflow-y-auto">
                    <FiltersPanel />
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select 
                  value={filters.sortBy} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                >
                  <SelectTrigger className="w-44 bg-slate-800/50 border-slate-700">
                    <ArrowUpDown className="w-4 h-4 mr-2 text-slate-400" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white">
                        <span className="flex items-center gap-2">
                          <option.icon className="w-4 h-4" />
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex items-center bg-slate-800/50 rounded-lg p-1 border border-slate-700">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("compact")}
                    className={viewMode === "compact" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-400"}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                {/* Refresh */}
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => refetch()}
                  className="text-slate-400 hover:text-emerald-400"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {filters.types.map(type => (
                  <Badge 
                    key={type} 
                    variant="secondary" 
                    className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer hover:bg-emerald-500/30"
                    onClick={() => setFilters(prev => ({ ...prev, types: prev.types.filter(t => t !== type) }))}
                  >
                    {JEWELRY_TYPES.find(t => t.value === type)?.label}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {filters.materials.map(material => (
                  <Badge 
                    key={material} 
                    variant="secondary" 
                    className="bg-amber-500/20 text-amber-400 border border-amber-500/30 cursor-pointer hover:bg-amber-500/30"
                    onClick={() => setFilters(prev => ({ ...prev, materials: prev.materials.filter(m => m !== material) }))}
                  >
                    {MATERIALS.find(m => m.value === material)?.label}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
                {(filters.priceRange.min > 0 || filters.priceRange.max < 100000000) && (
                  <Badge 
                    variant="secondary" 
                    className="bg-green-500/20 text-green-400 border border-green-500/30 cursor-pointer hover:bg-green-500/30"
                    onClick={() => setFilters(prev => ({ ...prev, priceRange: { min: 0, max: 100000000 } }))}
                  >
                    {formatPrice(filters.priceRange.min)} - {formatPrice(filters.priceRange.max)}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {filters.certified && (
                  <Badge 
                    variant="secondary" 
                    className="bg-purple-500/20 text-purple-400 border border-purple-500/30 cursor-pointer hover:bg-purple-500/30"
                    onClick={() => setFilters(prev => ({ ...prev, certified: false }))}
                  >
                    Certificados NFT
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
                {filters.featured && (
                  <Badge 
                    variant="secondary" 
                    className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 cursor-pointer hover:bg-yellow-500/30"
                    onClick={() => setFilters(prev => ({ ...prev, featured: false }))}
                  >
                    Destacados
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="flex gap-8">
            {/* Desktop Filters Sidebar */}
            <aside className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-32 bg-slate-800/30 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                <FiltersPanel />
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Results Count */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-slate-400">
                  Mostrando <span className="text-white font-semibold">{paginatedListings.length}</span> de{' '}
                  <span className="text-white font-semibold">{filteredListings.length}</span> resultados
                </p>
              </div>

              {/* Loading */}
              {isLoading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                      <div className="aspect-square bg-slate-700/50 rounded-t-lg"></div>
                      <CardContent className="p-4 space-y-3">
                        <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
                        <div className="h-3 bg-slate-700/50 rounded w-1/2"></div>
                        <div className="h-8 bg-slate-700/50 rounded"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-16">
                  <Gem className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No se encontraron joyas</h3>
                  <p className="text-slate-400 mb-6">Intenta ajustar tus filtros de búsqueda</p>
                  <Button onClick={clearAllFilters} className="bg-emerald-500 hover:bg-emerald-600">
                    Limpiar Filtros
                  </Button>
                </div>
              ) : (
                <div className={`grid gap-6 ${
                  viewMode === "grid" ? "md:grid-cols-2 xl:grid-cols-3" :
                  viewMode === "compact" ? "md:grid-cols-3 xl:grid-cols-4" :
                  "grid-cols-1"
                }`}>
                  {paginatedListings.map((item) => (
                    <MarketplaceItemCard 
                      key={item.id} 
                      item={item}
                      onLike={handleLike}
                      onShare={handleShare}
                      onBuy={handleBuy}
                    />
                  ))}
                </div>
              )}

              {/* Pagination */}
              {!isLoading && totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="border-slate-700 bg-slate-800/50"
                  >
                    Anterior
                  </Button>
                  
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                      .map((p, index, array) => {
                        const showEllipsis = index > 0 && array[index - 1] !== p - 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && <span className="px-2 text-slate-500">...</span>}
                            <Button
                              variant={page === p ? "default" : "outline"}
                              size="sm"
                              onClick={() => setPage(p)}
                              className={page === p 
                                ? "bg-emerald-500 hover:bg-emerald-600" 
                                : "border-slate-700 bg-slate-800/50"
                              }
                            >
                              {p}
                            </Button>
                          </React.Fragment>
                        );
                      })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="border-slate-700 bg-slate-800/50"
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MarketplacePro;
