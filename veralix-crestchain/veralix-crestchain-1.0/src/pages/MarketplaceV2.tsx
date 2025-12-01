import React, { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MarketplaceGrid } from '@/components/marketplace-v2/MarketplaceGrid';
import { InfiniteMarketplaceGrid } from '@/components/marketplace-v2/InfiniteMarketplaceGrid';
import { useMarketplace } from '@/hooks/useMarketplace';
import { AdvancedFilters } from '@/components/marketplace/AdvancedFilters';
import { ActiveFilters } from '@/components/marketplace/ActiveFilters';
import { AdvancedSearchBar } from '@/components/marketplace/AdvancedSearchBar';
import { useAdvancedSearch, SearchFilters } from '@/hooks/useAdvancedSearch';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Filter, Grid3X3, Diamond } from 'lucide-react';
import { useSEO } from '@/utils/seoHelpers';
import { FEATURE_FLAGS } from '@/lib/featureFlags';
import { MarketplaceSalesChat, MarketplaceSalesChatButton } from '@/components/marketplace/MarketplaceSalesChat';

const ITEMS_PER_PAGE = 12;
const SESSION_KEY = "veralix_marketplace_chat_visited";

export default function MarketplaceV2() {
  useSEO({
    title: 'Marketplace de Joyería | Veralix',
    description: 'Compra y vende joyería certificada con NFT en el marketplace de Veralix',
    keywords: 'marketplace joyería, comprar joyas, vender joyas, NFT joyería'
  });

  const { listings: allListings, loading: listingsLoading, error } = useMarketplace();
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  
  // Auto-open chat for new visitors
  useEffect(() => {
    const hasVisited = localStorage.getItem(SESSION_KEY);
    if (!hasVisited) {
      // Wait 2 seconds before opening chat for first-time visitors
      const timer = setTimeout(() => {
        setChatOpen(true);
        localStorage.setItem(SESSION_KEY, "true");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Listen for external chat open requests
  useEffect(() => {
    const handleOpenChat = () => {
      setChatOpen(true);
    };
    
    window.addEventListener('open-marketplace-chat', handleOpenChat);
    return () => window.removeEventListener('open-marketplace-chat', handleOpenChat);
  }, []);
  
  const {
    results,
    loading: searchLoading,
    filters,
    setFilters,
    search,
  } = useAdvancedSearch();

  // Use search results if available, otherwise show all listings
  const displayedListings = useMemo(() => {
    const hasActiveFilters = filters.query || 
      filters.types?.length || 
      filters.materials?.length || 
      filters.minPrice || 
      filters.maxPrice || 
      filters.minRating;
      
    if (hasActiveFilters) {
      return results
        .map(r => allListings.find(l => l.id === r.id))
        .filter(Boolean);
    }
    
    return allListings;
  }, [filters, results, allListings]);

  const paginatedListings = useMemo(() => {
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return displayedListings.slice(startIndex, endIndex);
  }, [displayedListings, page]);

  const totalPages = Math.ceil(displayedListings.length / ITEMS_PER_PAGE);
  const loading = listingsLoading || searchLoading;

  const handleSearch = (query: string) => {
    search({ ...filters, query });
    setPage(1);
  };

  const handleFiltersChange = (newFilters: SearchFilters) => {
    setFilters(newFilters);
    search(newFilters);
    setPage(1);
  };

  const handleRemoveFilter = (key: keyof SearchFilters, value?: string) => {
    const newFilters = { ...filters };
    
    if (key === 'types' && value && Array.isArray(newFilters.types)) {
      newFilters.types = newFilters.types.filter(t => t !== value);
    } else if (key === 'materials' && value && Array.isArray(newFilters.materials)) {
      newFilters.materials = newFilters.materials.filter(m => m !== value);
    } else {
      delete newFilters[key];
    }
    
    handleFiltersChange(newFilters);
  };

  const handleClearAllFilters = () => {
    handleFiltersChange({ sortBy: 'relevance' });
  };

  if (error) {
    return (
      <AppLayout>
        <div className="container py-8">
          <div className="text-center text-destructive">
            <h2 className="text-2xl font-bold">Error al cargar el marketplace</h2>
            <p className="text-muted-foreground mt-2">
              {error instanceof Error ? error.message : 'Error desconocido'}
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container py-8 space-y-6">
        {/* Hero Header */}
        <div className="relative rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background p-8 md:p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
          <div className="relative space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Diamond className="w-6 h-6" />
              <span className="font-semibold">Certificación NFT</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold">
              Marketplace de Joyería
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Descubre piezas únicas certificadas con tecnología blockchain. 
              Cada joya viene con su certificado NFT de autenticidad.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <AdvancedSearchBar
          value={filters.query || ''}
          onChange={(value) => setFilters({ ...filters, query: value })}
          onSearch={handleSearch}
          suggestions={[]}
          onSuggestionSelect={handleSearch}
        />

        {/* Active Filters */}
        {(filters.query || filters.types?.length || filters.materials?.length || 
          filters.minPrice || filters.maxPrice || filters.minRating) && (
          <ActiveFilters
            filters={filters}
            onRemoveFilter={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        )}

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-72 shrink-0">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </aside>

          {/* Mobile Filter Button */}
          <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="outline" 
                className="lg:hidden w-full mb-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtros
                {(filters.types?.length || filters.materials?.length || filters.minPrice || filters.maxPrice) && (
                  <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {(filters.types?.length || 0) + (filters.materials?.length || 0) + (filters.minPrice ? 1 : 0) + (filters.maxPrice ? 1 : 0)}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 overflow-y-auto">
              <AdvancedFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  handleFiltersChange(newFilters);
                  setFiltersOpen(false);
                }}
              />
            </SheetContent>
          </Sheet>

        {/* Products Grid */}
        <div className="flex-1 space-y-6">
          {/* Feature flag: Infinite scroll o paginación tradicional */}
          {FEATURE_FLAGS.INFINITE_SCROLL_MARKETPLACE ? (
            <InfiniteMarketplaceGrid />
          ) : (
            <>
              {/* Results Header */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {loading ? (
                    'Cargando...'
                  ) : (
                    <>
                      <span className="font-semibold text-foreground">
                        {displayedListings.length}
                      </span>
                      {' '}productos encontrados
                    </>
                  )}
                </p>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Grid3X3 className="w-4 h-4" />
                  Vista Grid
                </Button>
              </div>

              {/* Grid */}
              <MarketplaceGrid 
                listings={paginatedListings}
                loading={loading}
              />

              {/* Pagination - solo se muestra cuando NO está el infinite scroll */}
              {!loading && totalPages > 1 && (
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
                        return p === 1 || 
                               p === totalPages || 
                               (p >= page - 1 && p <= page + 1);
                      })
                      .map((p, i, arr) => {
                        const prev = arr[i - 1];
                        const showEllipsis = prev && p - prev > 1;
                        
                        return (
                          <React.Fragment key={p}>
                            {showEllipsis && (
                              <PaginationItem>
                                <span className="px-4">...</span>
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
              )}
            </>
          )}
          </div>
        </div>
      </div>

      {/* Sales Chat Assistant */}
      <MarketplaceSalesChat isOpen={chatOpen} onOpenChange={setChatOpen} />
      <MarketplaceSalesChatButton onClick={() => setChatOpen(true)} />
    </AppLayout>
  );
}
