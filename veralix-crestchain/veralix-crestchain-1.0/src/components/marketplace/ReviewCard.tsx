import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, MessageCircle } from "lucide-react";
import { RatingStars } from "./RatingStars";
import { Review } from "@/hooks/useReviews";
import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { AsyncResult } from "@/types";

interface ReviewCardProps {
  review: Review;
  canRespond?: boolean;
  onRespond?: (reviewId: string, response: string) => Promise<AsyncResult>;
}

export const ReviewCard = ({ review, canRespond = false, onRespond }: ReviewCardProps) => {
  const { toast } = useToast();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [response, setResponse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitResponse = async () => {
    if (!response.trim() || !onRespond) return;
    
    setIsSubmitting(true);
    const result = await onRespond(review.id, response);
    
    if (result.success) {
      setShowResponseForm(false);
      setResponse("");
    }
    
    setIsSubmitting(false);
  };

  const reviewerInitial = review.reviewer?.full_name?.charAt(0).toUpperCase() || "U";
  const reviewDate = format(new Date(review.created_at), "d 'de' MMMM, yyyy", { locale: es });

  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.reviewer?.avatar_url || ""} />
              <AvatarFallback>{reviewerInitial}</AvatarFallback>
            </Avatar>
            
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold">{review.reviewer?.full_name || "Usuario"}</span>
                {review.verified_purchase && (
                  <Badge variant="secondary" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Compra verificada
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RatingStars rating={review.rating} size="sm" />
                <span>•</span>
                <time>{reviewDate}</time>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        {review.title && (
          <h4 className="font-semibold">{review.title}</h4>
        )}

        {/* Comment */}
        <p className="text-sm leading-relaxed">{review.comment}</p>

        {/* Seller Response */}
        {review.seller_response && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2 border-l-2 border-primary">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <MessageCircle className="h-4 w-4" />
              <span>Respuesta del vendedor</span>
            </div>
            <p className="text-sm">{review.seller_response}</p>
            {review.seller_response_date && (
              <p className="text-xs text-muted-foreground">
                {format(new Date(review.seller_response_date), "d 'de' MMMM, yyyy", { locale: es })}
              </p>
            )}
          </div>
        )}

        {/* Response Form */}
        {canRespond && !review.seller_response && (
          <div className="pt-2">
            {!showResponseForm ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResponseForm(true)}
                className="gap-2"
              >
                <MessageCircle className="h-4 w-4" />
                Responder
              </Button>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="Escribe tu respuesta..."
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="min-h-[100px]"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSubmitResponse}
                    disabled={!response.trim() || isSubmitting}
                  >
                    {isSubmitting ? "Publicando..." : "Publicar respuesta"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowResponseForm(false);
                      setResponse("");
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
