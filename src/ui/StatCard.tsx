 import { cn } from '@/lib/utils';
 import type { ReactNode } from 'react';
 
 interface StatCardProps {
   icon?: ReactNode;
   label: string;
   value: string | number;
   subValue?: string;
   className?: string;
 }
 
 export function StatCard({ icon, label, value, subValue, className }: StatCardProps) {
   return (
     <div
       className={cn(
         'bg-card rounded-2xl p-4 shadow-soft border border-border',
         'transition-all duration-200 hover:shadow-card',
         className
       )}
     >
       <div className="flex items-start justify-between mb-2">
         <span className="text-sm text-muted-foreground">{label}</span>
         {icon && <span className="text-xl">{icon}</span>}
       </div>
       <div className="text-metric-sm text-foreground">{value}</div>
       {subValue && (
         <div className="text-xs text-muted-foreground mt-1">{subValue}</div>
       )}
     </div>
   );
 }