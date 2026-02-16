import { cn } from '@/lib/utils';
import type { MuscleGroup, ReadinessState } from '@/domain/types';
import { getMuscleById } from '@/domain/taxonomy/muscles';

interface MuscleChipProps {
  muscle: MuscleGroup;
  readiness?: ReadinessState;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showStatusText?: boolean;
}

const readinessColors: Record<ReadinessState, string> = {
  RECOVERING: 'ring-recovering',
  CAUTION: 'ring-caution',
  READY: 'ring-ready',
  PRIMED: 'ring-primed',
};

const readinessDots: Record<ReadinessState, string> = {
  RECOVERING: 'bg-recovering',
  CAUTION: 'bg-caution',
  READY: 'bg-ready',
  PRIMED: 'bg-primed',
};

export function MuscleChip({
  muscle,
  readiness,
  selected = false,
  onClick,
  size = 'md',
  className,
  showStatusText = false,
}: MuscleChipProps) {
  const muscleData = getMuscleById(muscle);

  const sizeClasses = {
    sm: 'px-[10px] py-[4px] text-xs',
    md: 'px-[14px] py-[8px] text-sm',
    lg: 'px-[18px] py-[10px] text-base',
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-[6px] rounded-full font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        sizeClasses[size],
        selected
          ? 'bg-primary text-primary-foreground shadow-soft'
          : 'bg-card text-foreground border border-border hover:bg-muted',
        readiness && !selected && cn('ring-2', readinessColors[readiness]),
        onClick && 'cursor-pointer',
        className
      )}
    >
      {readiness && (
        <span className={cn('w-2 h-2 rounded-full', readinessDots[readiness])} />
      )}
      {muscleData?.name ?? muscle}
      {showStatusText && readiness && (
        <span className="opacity-60 font-normal ml-1 capitalize">
          • {readiness.toLowerCase()}
        </span>
      )}
    </button>
  );
}