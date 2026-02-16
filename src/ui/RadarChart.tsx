 import { cn } from '@/lib/utils';
 import { CONFIG, type RadarAxis } from '@/domain/config';
 
 interface RadarChartProps {
   values: Record<RadarAxis, number>; // 0-100 for each axis
   size?: number;
   className?: string;
 }
 
 export function RadarChart({ values, size = 200, className }: RadarChartProps) {
   const axes = CONFIG.radarAxes;
   const centerX = size / 2;
   const centerY = size / 2;
   const maxRadius = (size / 2) * 0.8;
   
   // Calculate point positions
   const angleStep = (2 * Math.PI) / axes.length;
   const startAngle = -Math.PI / 2; // Start from top
   
   const getPoint = (index: number, value: number) => {
     const angle = startAngle + index * angleStep;
     const radius = (value / 100) * maxRadius;
     return {
       x: centerX + radius * Math.cos(angle),
       y: centerY + radius * Math.sin(angle),
     };
   };
   
   const getLabelPoint = (index: number) => {
     const angle = startAngle + index * angleStep;
     const radius = maxRadius + 20;
     return {
       x: centerX + radius * Math.cos(angle),
       y: centerY + radius * Math.sin(angle),
     };
   };
   
   // Generate polygon path
   const dataPoints = axes.map((axis, i) => getPoint(i, values[axis]));
   const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
   
   // Generate grid lines
   const gridLevels = [20, 40, 60, 80, 100];
   
   return (
     <div className={cn('relative', className)}>
       <svg width={size + 40} height={size + 40} viewBox={`-20 -20 ${size + 40} ${size + 40}`}>
         {/* Grid circles */}
         {gridLevels.map((level) => {
           const gridPoints = axes.map((_, i) => getPoint(i, level));
           const gridPath = gridPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
           return (
             <path
               key={level}
               d={gridPath}
               fill="none"
               stroke="hsl(var(--border))"
               strokeWidth="1"
               opacity={0.5}
             />
           );
         })}
         
         {/* Axis lines */}
         {axes.map((_, i) => {
           const endPoint = getPoint(i, 100);
           return (
             <line
               key={i}
               x1={centerX}
               y1={centerY}
               x2={endPoint.x}
               y2={endPoint.y}
               stroke="hsl(var(--border))"
               strokeWidth="1"
               opacity={0.3}
             />
           );
         })}
         
         {/* Data polygon */}
         <path
           d={polygonPath}
           fill="hsl(var(--primary) / 0.2)"
           stroke="hsl(var(--primary))"
           strokeWidth="2"
           className="transition-all duration-500"
         />
         
         {/* Data points */}
         {dataPoints.map((point, i) => (
           <circle
             key={i}
             cx={point.x}
             cy={point.y}
             r="4"
             fill="hsl(var(--primary))"
             className="transition-all duration-500"
           />
         ))}
         
         {/* Labels */}
         {axes.map((axis, i) => {
           const labelPos = getLabelPoint(i);
           return (
             <text
               key={axis}
               x={labelPos.x}
               y={labelPos.y}
               textAnchor="middle"
               dominantBaseline="middle"
               className="fill-muted-foreground text-xs"
             >
               {axis}
             </text>
           );
         })}
       </svg>
     </div>
   );
 }