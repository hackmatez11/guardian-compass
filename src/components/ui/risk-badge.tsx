import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const riskBadgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
  {
    variants: {
      level: {
        low: "bg-risk-low/15 text-risk-low border border-risk-low/30",
        medium: "bg-risk-medium/15 text-risk-medium border border-risk-medium/30",
        high: "bg-risk-high/15 text-risk-high border border-risk-high/30",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        default: "px-3 py-1 text-xs",
        lg: "px-4 py-1.5 text-sm",
      }
    },
    defaultVariants: {
      level: "low",
      size: "default",
    }
  }
);

interface RiskBadgeProps extends VariantProps<typeof riskBadgeVariants> {
  score?: number;
  showScore?: boolean;
  className?: string;
}

export function RiskBadge({ level, size, score, showScore = false, className }: RiskBadgeProps) {
  const labels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };

  return (
    <span className={cn(riskBadgeVariants({ level, size }), className)}>
      <span className={cn(
        "h-1.5 w-1.5 rounded-full",
        level === 'low' && "bg-risk-low",
        level === 'medium' && "bg-risk-medium",
        level === 'high' && "bg-risk-high"
      )} />
      {labels[level || 'low']}
      {showScore && score !== undefined && (
        <span className="ml-1 opacity-70">({score}%)</span>
      )}
    </span>
  );
}