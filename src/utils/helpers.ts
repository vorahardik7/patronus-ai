
// src/utils/helpers.ts
import { format, formatDistance } from 'date-fns';

/**
 * Format a date for display
 */
export function formatDate(dateString: string): string {
  return format(new Date(dateString), 'MMM d, yyyy');
}

/**
 * Format a date as relative time
 */
export function formatRelativeDate(dateString: string): string {
  return formatDistance(new Date(dateString), new Date(), { addSuffix: true });
}

/**
 * Format seconds to a time display (MM:SS)
 */
export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Format a number with commas
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Generate a unique ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}