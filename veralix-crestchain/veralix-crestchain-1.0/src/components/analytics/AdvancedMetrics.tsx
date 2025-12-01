import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrendIndicatorProps {
  value: number;
  isPositive?: boolean;
  className?: string;
}

export function TrendIndicator({ value, isPositive, className }: TrendIndicatorProps) {
  const positive = isPositive ?? value > 0;
  
  return (
    <div className={cn(
      "flex items-center gap-1 text-sm font-medium",
      positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      className
    )}>
      {positive ? (
        <TrendingUp className="w-4 h-4" />
      ) : (
        <TrendingDown className="w-4 h-4" />
      )}
      <span>{Math.abs(value).toFixed(1)}%</span>
    </div>
  );
}

interface ComparisonCardProps {
  title: string;
  currentValue: number;
  previousValue: number;
  format?: (value: number) => string;
  icon?: React.ReactNode;
}

export function ComparisonCard({ 
  title, 
  currentValue, 
  previousValue, 
  format = (v) => v.toString(),
  icon 
}: ComparisonCardProps) {
  const change = previousValue > 0 
    ? ((currentValue - previousValue) / previousValue) * 100 
    : 0;
  
  return (
    <Card className="shadow-veralix-premium border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {icon && (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        <div className="space-y-1">
          <div className="text-2xl font-bold font-heading">
            {format(currentValue)}
          </div>
          <div className="flex items-center gap-2">
            <TrendIndicator value={change} />
            <span className="text-xs text-muted-foreground">vs mes anterior</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProgressRingProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

export function ProgressRing({ 
  value, 
  max, 
  size = 120, 
  strokeWidth = 8,
  label 
}: ProgressRingProps) {
  const percentage = (value / max) * 100;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-heading">{percentage.toFixed(0)}%</span>
        {label && <span className="text-xs text-muted-foreground mt-1">{label}</span>}
      </div>
    </div>
  );
}

export function MiniChart({ 
  data, 
  color = "hsl(var(--primary))" 
}: { 
  data: number[]; 
  color?: string;
}) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg 
      viewBox="0 0 100 30" 
      className="w-full h-8"
      preserveAspectRatio="none"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
