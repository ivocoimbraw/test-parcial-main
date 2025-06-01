import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ComponentNode } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function extractJsonBlock(text: string): string | null {
  const match = text.match(/```json\s*([\s\S]*?)```/i);
  if (match) {
    return match[1].trim();
  }
  return null;
}

export function isValidComponentNode(obj: any): obj is ComponentNode {
  return (
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.type === "string" &&
    typeof obj.properties === "object" &&
    Array.isArray(obj.children)
  );
}
