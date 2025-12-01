import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { useMarketplaceListings } from "@/hooks/useMarketplaceListings";
import { MarketplaceItemCard } from "@/components/marketplace/MarketplaceItemCard";
import { toast } from "sonner";
import { 
  Search, 
  Filter, 
  TrendingUp,
  Grid3X3,
  List,
  Star,
  Diamond
} from "lucide-react";
import { AppLayout } from "./AppLayout";

const MigratedMarketplace = () => {
  const { user } = useAuth();
  const { role, isJoyero, isCliente } = useUserRole();
  const navigate = useNavigate();
  const { 
    listings, 
    loading, 
    searchListings, 
    filterByCategory, 
    filterByPriceRange, 
    sortListings 
  } = useMarketplaceListings();
  
  const [filteredItems, setFilteredItems] = useState(listings);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    let filtered = listings;
    
    // Apply search filter
    if (searchTerm) {
      filtered = searchListings(searchTerm);
    }
    
    // Apply category filter
    filtered = filterByCategory(selectedCategory);
    
    // Apply price range filter
    filtered = filterByPriceRange(priceRange);
    
    // Apply sorting
    filtered = sortListings(filtered, sortBy);
    
    setFilteredItems(filtered);
  }, [listings, searchTerm, selectedCategory, priceRange, sortBy, searchListings, filterByCategory, filterByPriceRange, sortListings]);

  const handleLike = (itemId: string) => {
    toast.success("¡Agregado a favoritos!");
  };

  const handleShare = (itemId: string) => {
    toast.success("¡Enlace copiado al portapapeles!");
  };

  const handleBuy = (itemId: string) => {
    console.log('🛒 Buy button clicked for item:', itemId);
    console.log('🛒 Current listings:', listings);
    const item = listings.find(l => l.id === itemId);
    console.log('📦 Found item:', item);
    if (item) {
      console.log('✅ Navigating to checkout with URL:', `/checkout?listing=${itemId}`);
      navigate(`/checkout?listing=${itemId}`);
    } else {
      console.error('❌ Item not found:', itemId);
      toast.error('Producto no encontrado');
    }
  };

  // Filters Section
  const FiltersSection = () => (
    <div className="bg-card/50 backdrop-blur-sm border-b border-border/20 p-6">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar joyas, materiales, vendedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="ring">Anillos</SelectItem>
                <SelectItem value="necklace">Collares</SelectItem>
                <SelectItem value="bracelet">Pulseras</SelectItem>
                <SelectItem value="earrings">Aretes</SelectItem>
                <SelectItem value="watch">Relojes</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Precio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="low">Menos de $1M</SelectItem>
                <SelectItem value="medium">$1M - $3M</SelectItem>
                <SelectItem value="high">Más de $3M</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más recientes</SelectItem>
                <SelectItem value="price_low">Precio: Menor</SelectItem>
                <SelectItem value="price_high">Precio: Mayor</SelectItem>
                <SelectItem value="popular">Más populares</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
    </div>
  );

  // Featured Section
  const FeaturedSection = () => {
    const featuredItems = listings.filter(item => item.featured).slice(0, 3);
    
    if (featuredItems.length === 0) return null;
    
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {filteredItems.length} {filteredItems.length === 1 ? 'resultado' : 'resultados'} encontrados
          </h2>
          
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <TrendingUp className="w-4 h-4" />
            <span>Actualizado hace 5 min</span>
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
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Diamond className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron joyas</h3>
            <p className="text-muted-foreground mb-6">
              Intenta ajustar tus filtros de búsqueda o explorar diferentes categorías
            </p>
            <Button onClick={() => {
              setSearchTerm("");
              setSelectedCategory("all");
              setPriceRange("all");
            }}>
              Limpiar Filtros
            </Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === "grid" 
              ? "md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          }`}>
            {filteredItems.map((item) => (
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
      </div>
    </section>
  );

  return (
    <AppLayout>
      <FiltersSection />
      <FeaturedSection />
      <MainContent />
    </AppLayout>
  );
};

export default MigratedMarketplace;