import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Star, MessageSquare } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { ReviewCard } from "./ReviewCard";
import { Review, ReviewStats } from "@/hooks/useReviews";
import type { AsyncResult } from "@/types";

interface ReviewListProps {
  reviews: Review[];
  stats: ReviewStats;
  loading: boolean;
  canRespond?: boolean;
  onRespond?: (reviewId: string, response: string) => Promise<AsyncResult>;
  onWriteReview?: () => void;
  showWriteButton?: boolean;
}

type SortOption = "recent" | "highest" | "lowest";

export const ReviewList = ({
  reviews,
  stats,
  loading,
  canRespond = false,
  onRespond,
  onWriteReview,
  showWriteButton = false,
}: ReviewListProps) => {
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 10;

  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      case "recent":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const paginatedReviews = sortedReviews.slice(startIndex, startIndex + reviewsPerPage);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6 space-y-4">
              <div className="flex gap-3">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center space-y-4">
          <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="font-semibold">No hay reseñas todavía</h3>
            <p className="text-sm text-muted-foreground">
              Sé el primero en compartir tu opinión sobre este producto
            </p>
          </div>
          {showWriteButton && onWriteReview && (
            <Button onClick={onWriteReview}>Escribir una reseña</Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Opiniones de clientes</span>
            {showWriteButton && onWriteReview && (
              <Button onClick={onWriteReview} size="sm">
                Escribir reseña
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Rating */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold">{stats.averageRating.toFixed(1)}</div>
              <RatingStars rating={stats.averageRating} size="md" className="mt-2" />
              <div className="text-sm text-muted-foreground mt-1">
                {stats.totalReviews} {stats.totalReviews === 1 ? "reseña" : "reseñas"}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = stats.ratingDistribution[rating] || 0;
                const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 min-w-[80px]">
                      <span className="text-sm font-medium">{rating}</span>
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-muted-foreground min-w-[40px] text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort Controls */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          {sortedReviews.length} {sortedReviews.length === 1 ? "reseña" : "reseñas"}
        </h3>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Más recientes</SelectItem>
            <SelectItem value="highest">Mejor valoradas</SelectItem>
            <SelectItem value="lowest">Peor valoradas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reviews */}
      <div className="space-y-4">
        {paginatedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            canRespond={canRespond}
            onRespond={onRespond}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
      )}
    </div>
  );
};
