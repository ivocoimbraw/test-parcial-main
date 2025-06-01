export interface ComponentNode {
  id: string;
  type: string;
  properties: Record<string, any>;
  children: ComponentNode[];
  style?: Style;
  position?: { x: number; y: number };
}

export interface Style {
  fontSize: number;
  borderRadius: number;
  color: string;
  backgroundColor: string;
  width: number;
  height: number;
  display?: "none" | "block" | "inline" | "inline-block" | string;
}

export interface Page {
  id: string;
  name: string;
  componentTree: ComponentNode;
}
