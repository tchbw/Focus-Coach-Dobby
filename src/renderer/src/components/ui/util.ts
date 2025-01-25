import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// This was added by shadcn
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
