import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Joins class names, letting later Tailwind utilities win over earlier ones.
 *
 * Plain string concatenation leaves `px-4 px-6` both in the class list and the
 * winner decided by stylesheet order rather than by call order — which makes a
 * component's `className` prop unable to reliably override its own defaults.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
