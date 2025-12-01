import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

// Memoize to prevent unnecessary re-renders
export const MetricCard = memo(function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  subtitle, 
  className 
}: MetricCardProps) {
  return (
    <Card className={cn(
      "group relative overflow-hidden",
      "shadow-veralix-premium border-border/50",
      "hover:shadow-veralix-gold hover:scale-[1.02]",
      "transition-premium",
      "before:absolute before:inset-0 before:bg-gradient-veralix-gold before:opacity-0 before:transition-opacity hover:before:opacity-5",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center animate-glow-pulse">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="pb-3 px-4">
        <div className="text-2xl font-bold font-heading bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
          {value}
        </div>
        <div className="flex items-center gap-1 mt-1">
          {trend && (
            <div className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
              trend.isPositive 
                ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            )}>
              <span className="text-base">{trend.isPositive ? "↗" : "↘"}</span>
              {Math.abs(trend.value)}%
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
