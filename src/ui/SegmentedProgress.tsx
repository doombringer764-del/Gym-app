 import { cn } from '@/lib/utils';
 
 interface SegmentedProgressProps {
   value: number; // 0-100
   segments?: number;
   showLabel?: boolean;
   size?: 'sm' | 'md' | 'lg';
   variant?: 'default' | 'zone';
   className?: string;
 }
 
 export function SegmentedProgress({
   value,
   segments = 10,
   showLabel = false,
   size = 'md',
   variant = 'default',
   className,
 }: SegmentedProgressProps) {
   const filledSegments = Math.round((value / 100) * segments);
   
   const sizeClasses = {
     sm: 'h-2 gap-0.5',
     md: 'h-3 gap-1',
     lg: 'h-4 gap-1',
   };
   
   const segmentSizes = {
     sm: 'rounded-sm',
     md: 'rounded',
     lg: 'rounded-md',
   };
   
   // Zone-based coloring: blue -> green -> amber -> red
   const getZoneColor = (index: number) => {
     const percentage = ((index + 1) / segments) * 100;
     if (percentage <= 30) return 'bg-zone-low';
     if (percentage <= 60) return 'bg-zone-optimal';
     if (percentage <= 80) return 'bg-zone-high';
     return 'bg-zone-overtrained';
   };
   
   return (
     <div className={cn('flex flex-col gap-1', className)}>
       <div className={cn('flex w-full', sizeClasses[size])}>
         {Array.from({ length: segments }).map((_, i) => {
           const isFilled = i < filledSegments;
           const baseColor = variant === 'zone' ? getZoneColor(i) : 'bg-primary';
           
           return (
             <div
               key={i}
               className={cn(
                 'flex-1 transition-all duration-300',
                 segmentSizes[size],
                 isFilled
                   ? cn(baseColor, 'shadow-inner')
                   : 'bg-muted/50'
               )}
               style={{
                 animationDelay: `${i * 50}ms`,
               }}
             />
           );
         })}
       </div>
       {showLabel && (
         <span className="text-xs text-muted-foreground">{Math.round(value)}%</span>
       )}
     </div>
   );
 }