import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSEO, StructuredData } from "@/utils/seoHelpers";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AppLayout } from "@/components/layout/AppLayout";
import { useOptimizedMarketplaceListings } from "@/hooks/useOptimizedMarketplaceListings";
import { useAdvancedSearch } from "@/hooks/useAdvancedSearch";
import { MarketplaceItemCard } from "@/components/marketplace/MarketplaceItemCard";
import { AdvancedSearchBar } from "@/components/marketplace/AdvancedSearchBar";
import { AdvancedFilters } from "@/components/marketplace/AdvancedFilters";
import { ActiveFilters } from "@/components/marketplace/ActiveFilters";
import { JewelryStoreFilter } from "@/components/marketplace/JewelryStoreFilter";
import { toast } from "sonner";
import { 
  Filter, 
  TrendingUp,
  Grid3X3,
  List,
  Diamond
} from "lucide-react";

const ITEMS_PER_PAGE = 12;

const Marketplace = () => {
  const navigate = useNavigate();
  const { data: paginatedData, isLoading: listingsLoading } = useOptimizedMarketplaceListings();
  const allListings = paginatedData?.listings || [];
  const [page, setPage] = useState(1);
  
  const {
    results,
    suggestions,
    loading: searchLoading,
    filters,
    setFilters,
    search,
    getSuggestions,
    clearRecentSearches,
    trackClick
  } = useAdvancedSearch();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  // Use search results if available, otherwise show all listings
  const displayedListings = useMemo(() => {
    const hasActiveFilters = filters.query || 
      filters.types?.length || 
      filters.materials?.length || 
      filters.minPrice || 
      filters.maxPrice || 
      filters.minRating;
      
    let filtered = hasActiveFilters
      ? results.map(r => allListings.find(l => l.id === r.id)).filter(Boolean)
      : allListings;
    
    // Apply store filter
    if (selectedStoreId) {
      filtered = filtered.filter(l => l.seller_id === selectedStoreId);
    }
    
    return filtered;
  }, [
    filters.query,
    filters.types,
    filters.materials,
    filters.minPrice,
    filters.maxPrice,
    filters.minRating,
    results,
    allListings,
    selectedStoreId
  ]);

  // Image preloading removed - React Query cache + browser cache handles this efficiently

  const paginatedListings = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return displayedListings.slice(startIndex, endIndex);
  }, [displayedListings, page]);

  const totalPages = Math.ceil(displayedListings.length / ITEMS_PER_PAGE);
  const loading = listingsLoading || searchLoading;

  useEffect(() => {
    if (searchQuery.length >= 2) {
      getSuggestions(searchQuery);
    } else if (searchQuery.length === 0) {
      getSuggestions("");
    }
  }, [searchQuery, getSuggestions]);

  const handleLike = (itemId: string) => {
    toast.success("¡Agregado a favoritos!");
  };

  const handleShare = (itemId: string) => {
    toast.success("¡Enlace copiado al portapapeles!");
  };

  const handleBuy = (itemId: string) => {
    trackClick(itemId);
    const item = allListings.find(l => l.id === itemId);
    if (item) {
      navigate(`/checkout?listing=${itemId}`);
    } else {
      toast.error('Producto no encontrado');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    search({ ...filters, query, sortBy: filters.sortBy || 'relevance' });
  };

  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    search({ ...newFilters, query: searchQuery });
  };

  const handleRemoveFilter = (key: string, value?: string) => {
    const newFilters = { ...filters };
    
    if (key === 'types' && value) {
      newFilters.types = filters.types?.filter(t => t !== value);
    } else if (key === 'materials' && value) {
      newFilters.materials = filters.materials?.filter(m => m !== value);
    } else if (key === 'query') {
      newFilters.query = undefined;
      setSearchQuery('');
    } else {
      delete newFilters[key as keyof typeof newFilters];
    }
    
    setFilters(newFilters);
    search(newFilters);
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setFilters({ sortBy: 'relevance' });
    search({ sortBy: 'relevance' });
  };

  // Search and Filters Section
  const SearchSection = () => (
    <div className="bg-card/50 backdrop-blur-sm border-b border-border/20 p-6">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-2xl">
            <AdvancedSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              suggestions={suggestions}
              onSuggestionSelect={(text) => {
                setSearchQuery(text);
                handleSearch(text);
              }}
              onClearRecent={clearRecentSearches}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Filter Button */}
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                  {(filters.types?.length || filters.materials?.length || filters.minRating) && (
                    <Badge variant="secondary" className="ml-2">
                      {(filters.types?.length || 0) + (filters.materials?.length || 0) + (filters.minRating ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 overflow-y-auto">
                <AdvancedFilters 
                  filters={filters} 
                  onFiltersChange={handleFiltersChange} 
                />
              </SheetContent>
            </Sheet>

            {/* Sort */}
            <Select 
              value={filters.sortBy || 'relevance'} 
              onValueChange={(value: any) => handleFiltersChange({ ...filters, sortBy: value })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevancia</SelectItem>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="price_asc">Precio: Menor</SelectItem>
                <SelectItem value="price_desc">Precio: Mayor</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <div className="mt-4">
          <ActiveFilters
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        </div>
      </div>
    </div>
  );

  // Featured Section
  const FeaturedSection = () => {
    const featuredItems = allListings.filter(item => item.featured).slice(0, 3);
    
    if (featuredItems.length === 0 || filters.query || filters.types?.length) return null;
    
    return (
      <section className="py-12 px-6 bg-muted/20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">
            Joyas <span className="bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">Destacadas</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredItems.map((item) => (
              <MarketplaceItemCard 
                key={item.id} 
                item={item}
                onLike={handleLike}
                onShare={handleShare}
                onBuy={handleBuy}
              />
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Main Content
  const MainContent = () => (
    <section className="py-8 px-6">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Jewelry Store Filter Sidebar (Desktop) */}
          <aside className="hidden lg:block lg:w-72 flex-shrink-0 space-y-6">
            <JewelryStoreFilter
              onSelectStore={setSelectedStoreId}
              selectedStoreId={selectedStoreId}
            />
            <AdvancedFilters 
              filters={filters} 
              onFiltersChange={handleFiltersChange} 
            />
          </aside>

          {/* Main Content Area */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">
                {paginatedListings.length} de {displayedListings.length} {displayedListings.length === 1 ? 'resultado' : 'resultados'}
              </h2>
              
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <TrendingUp className="w-4 h-4" />
                <span>Actualizado recientemente</span>
              </div>
            </div>
            
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="aspect-square bg-muted/20"></div>
                    <CardHeader>
                      <div className="h-4 bg-muted/20 rounded"></div>
                      <div className="h-3 bg-muted/20 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-muted/20 rounded mb-2"></div>
                      <div className="h-3 bg-muted/20 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayedListings.length === 0 ? (
              <div className="text-center py-12">
                <Diamond className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No se encontraron joyas</h3>
                <p className="text-muted-foreground mb-6">
                  Intenta ajustar tus filtros de búsqueda o explorar diferentes categorías
                </p>
                <Button onClick={handleClearAllFilters}>
                  Limpiar Filtros
                </Button>
              </div>
            ) : (
              <div className={`grid gap-6 ${
                viewMode === "grid" 
                  ? "md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3" 
                  : "grid-cols-1"
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
            {!loading && totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => {
                        return p === 1 || p === totalPages || Math.abs(p - page) <= 1;
                      })
                      .map((p, index, array) => {
                        const showEllipsisBefore = index > 0 && array[index - 1] !== p - 1;
                        return (
                          <React.Fragment key={p}>
                            {showEllipsisBefore && (
                              <PaginationItem key={`ellipsis-${p}`}>
                                <span className="px-3">...</span>
                              </PaginationItem>
                            )}
                            <PaginationItem>
                              <PaginationLink
                                onClick={() => setPage(p)}
                                isActive={page === p}
                                className="cursor-pointer"
                              >
                                {p}
                              </PaginationLink>
                            </PaginationItem>
                          </React.Fragment>
                        );
                      })}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  useSEO({
    title: 'Marketplace de Joyería Certificada NFT | Veralix',
    description: 'Compra y vende joyas certificadas con NFT en blockchain. Marketplace seguro de joyería de alta gama con verificación de autenticidad. Anillos, collares, pulseras y más.',
    keywords: 'marketplace joyería NFT, comprar joyas blockchain, vender joyas certificadas, anillos NFT, collares blockchain, joyería verificada',
    canonical: 'https://veralix.io/marketplace'
  });

  return (
    <AppLayout>
      <StructuredData 
        type="Product" 
        data={{
          name: 'Marketplace de Joyería Certificada',
          description: 'Compra y vende joyas con certificación NFT blockchain',
          brand: {
            '@type': 'Brand',
            name: 'Veralix'
          },
          category: 'Joyería',
          offers: {
            '@type': 'AggregateOffer',
            priceCurrency: 'COP',
            availability: 'https://schema.org/InStock'
          }
        }} 
      />
      
      <div className="min-h-screen bg-background -m-4 md:-m-6 lg:-m-8">
        <SearchSection />
        <FeaturedSection />
        <MainContent />
      </div>
    </AppLayout>
  );
};

export default Marketplace;