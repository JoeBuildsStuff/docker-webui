import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple time formatter function - adjusted to handle string dates from API
// This is a basic parser; consider a robust library like date-fns for production
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    // Fallback or error handling if date parsing fails
    console.warn(`formatTimeAgo: Failed to parse date string: "${dateString}"`);
    return dateString; // Return original string or a placeholder
  }

  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)

  // Handle future dates gracefully
  if (seconds < 0) {
    return "in the future"; // Or return the formatted date: date.toLocaleDateString();
  }

  let interval = seconds / 31536000 // 60 * 60 * 24 * 365
  if (interval >= 1) return Math.floor(interval) + " years ago"

  interval = seconds / 2592000 // 60 * 60 * 24 * 30
  if (interval >= 1) return Math.floor(interval) + " months ago"

  interval = seconds / 86400 // 60 * 60 * 24
  if (interval >= 1) return Math.floor(interval) + " days ago"

  interval = seconds / 3600 // 60 * 60
  if (interval >= 1) return Math.floor(interval) + " hours ago"

  interval = seconds / 60
  if (interval >= 1) return Math.floor(interval) + " minutes ago"

  return Math.floor(seconds) + " seconds ago"
}
