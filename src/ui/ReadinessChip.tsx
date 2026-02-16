 import { cn } from '@/lib/utils';
 import type { ReadinessState } from '@/domain/types';
 
 interface ReadinessChipProps {
   state: ReadinessState;
   label?: string;
   size?: 'sm' | 'md' | 'lg';
   className?: string;
 }
 
 const stateConfig: Record<ReadinessState, { bg: string; dot: string; text: string }> = {
   RECOVERING: { bg: 'bg-recovering/10', dot: 'bg-recovering', text: 'text-recovering' },
   CAUTION: { bg: 'bg-caution/10', dot: 'bg-caution', text: 'text-caution' },
   READY: { bg: 'bg-ready/10', dot: 'bg-ready', text: 'text-ready' },
   PRIMED: { bg: 'bg-primed/10', dot: 'bg-primed', text: 'text-primed' },
 };
 
 export function ReadinessChip({ state, label, size = 'md', className }: ReadinessChipProps) {
   const config = stateConfig[state];
   
   const sizeClasses = {
     sm: 'px-2 py-0.5 text-xs gap-1',
     md: 'px-3 py-1 text-sm gap-1.5',
     lg: 'px-4 py-1.5 text-base gap-2',
   };
   
   const dotSizes = {
     sm: 'w-1.5 h-1.5',
     md: 'w-2 h-2',
     lg: 'w-2.5 h-2.5',
   };
   
   return (
     <span
       className={cn(
         'inline-flex items-center rounded-full font-medium',
         config.bg,
         config.text,
         sizeClasses[size],
         className
       )}
     >
       <span className={cn('rounded-full', config.dot, dotSizes[size])} />
       {label ?? state}
     </span>
   );
 }