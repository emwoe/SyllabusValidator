import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a date in a human-friendly format
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return format(date, 'MMM d, yyyy');
}
