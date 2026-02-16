import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface FocusCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: 'primary' | 'accent' | 'secondary';
}

export function FocusCard({ children, className, glowColor = 'primary' }: FocusCardProps) {
  const glowClasses = {
    primary: 'before:from-primed before:to-ready',
    accent: 'before:from-ready before:to-caution',
    secondary: 'before:from-secondary before:to-secondary/70',
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl bg-focus-bg p-6',
        'before:absolute before:inset-0 before:p-[1px] before:rounded-2xl',
        'before:bg-gradient-to-br before:opacity-60',
        'before:-z-10 before:pointer-events-none',
        'shadow-focus',
        glowClasses[glowColor],
        className
      )}
    >
      <div className="relative z-10">{children}</div>
    </div>
  );
}

interface FocusCardHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
  size?: 'sm' | 'lg';
}

export function FocusCardHeader({ title, subtitle, action, size = 'sm' }: FocusCardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h3 className={cn(
          "font-semibold text-white",
          size === 'lg' ? "text-2xl leading-tight" : "text-lg"
        )}>{title}</h3>
        {subtitle && (
          <div className={cn(
            "text-white/80 mt-1",
            size === 'lg' ? "text-base font-medium" : "text-sm"
          )}>{subtitle}</div>
        )}
      </div>
      {action}
    </div>
  );
}

interface FocusCardMetricProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function FocusCardMetric({ value, label, trend }: FocusCardMetricProps) {
  return (
    <div className="text-center">
      <div className="text-metric text-white">{value}</div>
      <div className="text-sm text-white/60 flex items-center justify-center gap-1">
        {trend === 'up' && <span className="text-ready">↑</span>}
        {trend === 'down' && <span className="text-recovering">↓</span>}
        {label}
      </div>
    </div>
  );
}