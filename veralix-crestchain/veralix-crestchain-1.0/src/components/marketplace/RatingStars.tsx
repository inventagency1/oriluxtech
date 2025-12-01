import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

export const RatingStars = ({
  rating,
  size = "md",
  interactive = false,
  onChange,
  className,
}: RatingStarsProps) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-6 h-6",
  };

  const handleClick = (starRating: number) => {
    if (interactive && onChange) {
      onChange(starRating);
    }
  };

  return (
    <div className={cn("flex items-center gap-0.5", className)}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.floor(rating);
        const partial = star === Math.ceil(rating) && rating % 1 !== 0;

        return (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            disabled={!interactive}
            className={cn(
              "relative transition-all",
              interactive && "hover:scale-110 cursor-pointer",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                filled || partial ? "fill-yellow-400 text-yellow-400" : "fill-none text-muted-foreground"
              )}
            />
            {partial && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${(rating % 1) * 100}%` }}
              >
                <Star
                  className={cn(
                    sizeClasses[size],
                    "fill-yellow-400 text-yellow-400"
                  )}
                />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
