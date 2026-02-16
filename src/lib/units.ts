 import { CONFIG } from '@/domain/config';
 import type { WeightUnit } from '@/domain/types';
 
 // Conversion constants
 const LB_TO_KG = 0.453592;
 const KG_TO_LB = 2.20462;
 
 // Rounding steps
 export const ROUNDING = {
   kg: 0.5,
   lb: 2.5,
 } as const;
 
 /**
  * Convert weight from display unit to kg (for storage)
  */
 export function toKg(value: number, unit: WeightUnit): number {
   if (unit === 'kg') return value;
   return value * LB_TO_KG;
 }
 
 /**
  * Convert weight from kg to display unit
  */
 export function fromKg(valueKg: number, unit: WeightUnit): number {
   if (unit === 'kg') return valueKg;
   return valueKg * KG_TO_LB;
 }
 
 /**
  * Round weight to the nearest step for the given unit
  */
 export function roundWeight(value: number, unit: WeightUnit): number {
   const step = ROUNDING[unit];
   return Math.round(value / step) * step;
 }
 
 /**
  * Format weight for display with unit label
  */
 export function formatWeight(valueKg: number, unit: WeightUnit): string {
   const displayValue = roundWeight(fromKg(valueKg, unit), unit);
   return `${displayValue}${unit}`;
 }
 
 /**
  * Parse user input and convert to kg
  */
 export function parseWeightInput(input: string, unit: WeightUnit): number {
   const value = parseFloat(input);
   if (isNaN(value)) return 0;
   return toKg(value, unit);
 }