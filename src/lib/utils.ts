import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple time formatter function - adjusted to handle string dates from API
// This is a basic parser; consider a robust library like date-fns for production
export function formatTimeAgo(dateStringOrTimestamp: string | number | Date): string {
  try {
    let date: Date;
    if (typeof dateStringOrTimestamp === 'string') {
      date = parseISO(dateStringOrTimestamp);
    } else if (typeof dateStringOrTimestamp === 'number') {
      date = new Date(dateStringOrTimestamp);
    } else {
      date = dateStringOrTimestamp;
    }
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error("Error formatting time ago:", error);
    return "Invalid date";
  }
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  if (isNaN(bytes) || !isFinite(bytes)) return 'N/A';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
