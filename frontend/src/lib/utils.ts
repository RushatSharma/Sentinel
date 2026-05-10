import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const API_BASE_URL = import.meta.env.DEV
  ? "http://127.0.0.1:5000"
  : "https://sentinel-z8bl.onrender.com";
