import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RatingStars } from "./RatingStars";
import type { AsyncResult } from "@/types";

const reviewSchema = z.object({
  rating: z.number().min(1, "Debes seleccionar una calificación").max(5),
  title: z.string().optional(),
  comment: z
    .string()
    .min(10, "El comentario debe tener al menos 10 caracteres")
    .max(1000, "El comentario no puede exceder 1000 caracteres"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

interface ReviewFormProps {
  listingId: string;
  orderId: string;
  onSubmit: (data: ReviewFormData & { listing_id: string; order_id: string }) => Promise<AsyncResult>;
  onCancel?: () => void;
}

export const ReviewForm = ({ listingId, orderId, onSubmit, onCancel }: ReviewFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      title: "",
      comment: "",
    },
  });

  const handleSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...data,
        listing_id: listingId,
        order_id: orderId,
      });
      form.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const watchRating = form.watch("rating");
  const watchComment = form.watch("comment");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Escribe tu reseña</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Rating */}
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calificación *</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <RatingStars
                        rating={field.value}
                        size="lg"
                        interactive
                        onChange={field.onChange}
                      />
                      {field.value > 0 && (
                        <span className="text-sm text-muted-foreground">
                          ({field.value} {field.value === 1 ? "estrella" : "estrellas"})
                        </span>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Excelente calidad y acabado"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Comment */}
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tu opinión *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Comparte tu experiencia con este producto..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center">
                    <FormMessage />
                    <span className="text-xs text-muted-foreground">
                      {watchComment?.length || 0} / 1000
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !form.formState.isValid}
              >
                {isSubmitting ? "Publicando..." : "Publicar reseña"}
              </Button>
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
