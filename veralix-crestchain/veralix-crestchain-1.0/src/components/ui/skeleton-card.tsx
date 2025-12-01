import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  showFooter?: boolean;
}

export const SkeletonCard = ({ 
  className, 
  showHeader = true,
  showFooter = true 
}: SkeletonCardProps) => {
  return (
    <Card className={cn("animate-pulse", className)}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </CardHeader>
      )}
      
      <CardContent className="space-y-3">
        <Skeleton className="h-32 w-full rounded-md" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        
        {showFooter && (
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const SkeletonList = ({ count = 3 }: { count?: number }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};
