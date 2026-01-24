import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const statCardVariants = cva(
  "rounded-xl p-6 border transition-all duration-300 hover:shadow-md animate-fade-in",
  {
    variants: {
      variant: {
        default: "bg-card border-border/50 hover:border-accent/30",
        primary: "bg-primary text-primary-foreground border-primary",
        accent: "bg-accent/10 border-accent/30 hover:border-accent/50",
        success: "bg-success/10 border-success/30 hover:border-success/50",
        warning: "bg-warning/10 border-warning/30 hover:border-warning/50",
        danger: "bg-destructive/10 border-destructive/30 hover:border-destructive/50",
      }
    },
    defaultVariants: {
      variant: "default",
    }
  }
);

interface StatCardProps extends VariantProps<typeof statCardVariants> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  variant,
  className 
}: StatCardProps) {
  return (
    <div className={cn(statCardVariants({ variant }), className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={cn(
            "text-sm font-medium",
            variant === 'primary' ? "text-primary-foreground/80" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-3xl font-display font-bold tracking-tight",
            variant === 'primary' ? "text-primary-foreground" : "text-foreground"
          )}>
            {value}
          </p>
          {subtitle && (
            <p className={cn(
              "text-xs",
              variant === 'primary' ? "text-primary-foreground/70" : "text-muted-foreground"
            )}>
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className={cn(
            "p-3 rounded-lg",
            variant === 'primary' ? "bg-primary-foreground/20" : 
            variant === 'accent' ? "bg-accent/20" :
            variant === 'success' ? "bg-success/20" :
            variant === 'warning' ? "bg-warning/20" :
            variant === 'danger' ? "bg-destructive/20" :
            "bg-muted"
          )}>
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            trend.positive ? "text-success" : "text-destructive"
          )}>
            {trend.positive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
          <span className={cn(
            "text-xs",
            variant === 'primary' ? "text-primary-foreground/60" : "text-muted-foreground"
          )}>
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}