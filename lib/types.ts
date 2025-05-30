export interface ComponentNode {
  id: string
  type: string
  properties: Record<string, any>
  children: ComponentNode[]
  style?: Record<string, any>
  position?: { x: number; y: number }
}

export interface Page {
  id: string
  name: string
  componentTree: ComponentNode
}
