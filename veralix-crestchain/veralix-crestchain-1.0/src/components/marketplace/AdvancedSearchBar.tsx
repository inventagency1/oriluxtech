import { useState, useRef, useEffect } from 'react';
import { Search, Clock, TrendingUp, Tag, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SearchSuggestion } from '@/hooks/useAdvancedSearch';

interface AdvancedSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions: SearchSuggestion[];
  onSuggestionSelect: (text: string) => void;
  onClearRecent?: () => void;
}

export const AdvancedSearchBar = ({
  value,
  onChange,
  onSearch,
  suggestions,
  onSuggestionSelect,
  onClearRecent
}: AdvancedSearchBarProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(value);
      setShowSuggestions(false);
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-muted-foreground" />;
      case 'trending':
        return <TrendingUp className="w-4 h-4 text-primary" />;
      case 'category':
      case 'material':
        return <Tag className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Search className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const recentSuggestions = suggestions.filter(s => s.type === 'recent');
  const otherSuggestions = suggestions.filter(s => s.type !== 'recent');

  return (
    <div className="relative w-full animate-fade-in" ref={containerRef}>
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder="Buscar joyas por nombre, material, estilo..."
          className="pl-12 pr-12 h-14 text-base border-2 focus:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 bg-background/50 backdrop-blur-sm"
        />
        {value && (
          <button
            onClick={() => {
              onChange('');
              setShowSuggestions(false);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted/50 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <Card className="absolute top-full mt-2 w-full z-50 shadow-xl border-2 max-h-[400px] overflow-y-auto animate-fade-scale backdrop-blur-md bg-background/95">
          <CardContent className="p-3">
            {recentSuggestions.length > 0 && (
              <div className="mb-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium text-muted-foreground">
                    Búsquedas recientes
                  </span>
                  {onClearRecent && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onClearRecent}
                      className="h-auto p-1 text-xs"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
                {recentSuggestions.map((suggestion, i) => (
                  <button
                    key={`recent-${i}`}
                    onClick={() => {
                      onSuggestionSelect(suggestion.text);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded flex items-center gap-3 transition-colors"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <span className="flex-1">{suggestion.text}</span>
                    {suggestion.count && (
                      <Badge variant="secondary" className="ml-auto">
                        {suggestion.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {otherSuggestions.length > 0 && (
              <div>
                {recentSuggestions.length > 0 && (
                  <div className="border-t my-2" />
                )}
                {otherSuggestions.map((suggestion, i) => (
                  <button
                    key={`other-${i}`}
                    onClick={() => {
                      onSuggestionSelect(suggestion.text);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-muted rounded flex items-center gap-3 transition-colors"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <span className="flex-1">{suggestion.text}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {suggestion.type === 'category' ? 'Categoría' : 'Material'}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
