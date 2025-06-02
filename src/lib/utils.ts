import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ComponentNode, Page } from "./types";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid"

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

export function parseJsonToComponentNode(jsonString: string): ComponentNode {
  if (!jsonString.trim().startsWith("```json")) {
    toast.error("Ocurrió un error inesperado al procesar la respuesta.");
    throw new Error("Formato de entrada incorrecto: no comienza con ```json");
  }

  const jsonText = extractJsonBlock(jsonString);
  if (!jsonText) {
    toast.warning("No se encontró un bloque JSON válido en la respuesta.");
    throw new Error("Bloque JSON no encontrado");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch (err) {
    toast.error("El bloque JSON no es válido.");
    throw new Error("JSON inválido");
  }

  if (!isValidComponentNode(parsed)) {
    toast.error("La estructura del JSON no coincide con un componente válido.");
    throw new Error("Estructura de componente inválida");
  }

  return parsed as ComponentNode;
}

export function parseJsonToPage(componentNodeJson: string): Page {
  const childrens = parseJsonToComponentNodes(componentNodeJson);
  const initialComponentTree: ComponentNode = {
    id: "root",
    type: "root",
    properties: {},
    children: childrens,
    position: { x: 0, y: 0 },
  }

  const initialPage: Page = {
    id: uuidv4(),
    name: "Home",
    componentTree: { ...initialComponentTree },
  }

  return initialPage;
}


export function parseJsonToComponentNodes(jsonString: string): ComponentNode[] {
  if (!jsonString.trim().startsWith("```json")) {
    throw new Error("Formato incorrecto");
  }

  const jsonText = extractJsonBlock(jsonString);
  if (!jsonText) {
    throw new Error("JSON no encontrado");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Error al parsear JSON");
  }

  if (!Array.isArray(parsed)) {
    throw new Error("El JSON no es un arreglo");
  }

  // Validar cada componente
  for (const item of parsed) {
    if (!isValidComponentNode(item)) {
      throw new Error("Componente inválido en la lista");
    }
  }

  return parsed as ComponentNode[];
}
