import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatAUDate(dateInput: Date | string | number): string {
  const date = new Date(dateInput);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
export function formatOrdinalDay(day: number): string {
  const d = Math.floor(day);
  const mod100 = d % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${d}th`;
  const mod10 = d % 10;
  if (mod10 === 1) return `${d}st`;
  if (mod10 === 2) return `${d}nd`;
  if (mod10 === 3) return `${d}rd`;
  return `${d}th`;
}
