"use client"

import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu"

import type React from "react"

import { useState } from "react"
import { useDesignerStore } from "@/lib/store"
import {
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Trash2,
  Copy,
  Scissors,
  Clipboard,
  Save,
  Eye,
  EyeOff,
} from "lucide-react"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { ComponentNode } from "@/lib/types"
import { COMPONENT_TYPES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface TreeNodeProps {
  node: ComponentNode
  level: number
  onSelect: (id: string) => void
  selectedId: string | null
  expanded: Record<string, boolean>
  onToggleExpand: (id: string) => void
  parentPath?: string
}

function TreeNode({ node, level, onSelect, selectedId, expanded, onToggleExpand, parentPath = "" }: TreeNodeProps) {
  const {
    deleteComponent,
    copyComponent,
    cutComponent,
    pasteComponent,
    saveAsCustomComponent,
    updateComponentProperty,
  } = useDesignerStore()
  const { toast } = useToast()

  const hasChildren = node.children && node.children.length > 0
  const isExpanded = expanded[node.id] !== false // Default to expanded
  const isSelected = selectedId === node.id
  const currentPath = parentPath ? `${parentPath} > ${getComponentLabel()}` : getComponentLabel()

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleExpand(node.id)
  }

  const handleSelect = () => {
    onSelect(node.id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    deleteComponent(node.id)
  }

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation()
    copyComponent(node.id)
    toast({
      title: "Component Copied",
      description: "Component has been copied to clipboard",
    })
  }

  const handleCut = (e: React.MouseEvent) => {
    e.stopPropagation()
    cutComponent(node.id)
    toast({
      title: "Component Cut",
      description: "Component has been cut to clipboard",
    })
  }

  const handlePaste = (e: React.MouseEvent) => {
    e.stopPropagation()
    const success = pasteComponent(node.id)
    if (success) {
      toast({
        title: "Component Pasted",
        description: "Component has been pasted from clipboard",
      })
    } else {
      toast({
        title: "Paste Failed",
        description: "No component in clipboard or invalid operation",
        variant: "destructive",
      })
    }
  }

  const handleSaveAsCustom = (e: React.MouseEvent) => {
    e.stopPropagation()
    saveAsCustomComponent(node.id)
    toast({
      title: "Component Saved",
      description: "Component has been saved to your custom components",
    })
  }

  const handleToggleVisibility = (e: React.MouseEvent) => {
    e.stopPropagation()
    const currentVisibility = node.style?.display !== "none"
    updateComponentProperty(node.id, "style.display", currentVisibility ? "none" : "block")
    toast({
      title: currentVisibility ? "Component Hidden" : "Component Shown",
      description: `Component is now ${currentVisibility ? "hidden" : "visible"}`,
    })
  }

  function getComponentLabel() {
    const getTypeLabel = (type: string) => {
      switch (type) {
        case COMPONENT_TYPES.TEXT:
          return "Text"
        case COMPONENT_TYPES.BUTTON:
          return "Button"
        case COMPONENT_TYPES.CONTAINER:
          return "Container"
        case COMPONENT_TYPES.ROW:
          return "Row"
        case COMPONENT_TYPES.COLUMN:
          return "Column"
        case COMPONENT_TYPES.STACK:
          return "Stack"
        case COMPONENT_TYPES.CARD:
          return "Card"
        case COMPONENT_TYPES.TEXT_FIELD:
          return "TextField"
        case COMPONENT_TYPES.CHECKBOX:
          return "Checkbox"
        case COMPONENT_TYPES.SWITCH:
          return "Switch"
        case COMPONENT_TYPES.RADIO:
          return "Radio"
        case COMPONENT_TYPES.ICON:
          return "Icon"
        case COMPONENT_TYPES.LIST_VIEW:
          return "ListView"
        case COMPONENT_TYPES.APP_BAR:
          return "AppBar"
        case COMPONENT_TYPES.SLIDER:
          return "Slider"
        case COMPONENT_TYPES.DROPDOWN_BUTTON:
          return "DropdownButton"
        case COMPONENT_TYPES.SELECT:
          return "Select"
        case COMPONENT_TYPES.TABLE:
          return "Table"
        case COMPONENT_TYPES.FORM:
          return "Form"
        case COMPONENT_TYPES.INPUT:
          return "Input"
        default:
          return type
      }
    }

    const typeLabel = getTypeLabel(node.type)

    // Add descriptive text for certain components
    switch (node.type) {
      case COMPONENT_TYPES.TEXT:
        const text = (node.properties.text || "").substring(0, 20)
        return text ? `${typeLabel}: "${text}${text.length >= 20 ? "..." : ""}"` : typeLabel
      case COMPONENT_TYPES.BUTTON:
        const buttonText = (node.properties.text || "").substring(0, 15)
        return buttonText ? `${typeLabel}: "${buttonText}${buttonText.length >= 15 ? "..." : ""}"` : typeLabel
      case COMPONENT_TYPES.CARD:
        const cardTitle = (node.properties.title || "").substring(0, 15)
        return cardTitle ? `${typeLabel}: "${cardTitle}${cardTitle.length >= 15 ? "..." : ""}"` : typeLabel
      case COMPONENT_TYPES.INPUT:
        const inputLabel = (node.properties.label || "").substring(0, 15)
        return inputLabel ? `${typeLabel}: "${inputLabel}${inputLabel.length >= 15 ? "..." : ""}"` : typeLabel
      case COMPONENT_TYPES.FORM:
        const formTitle = (node.properties.title || "").substring(0, 15)
        return formTitle ? `${typeLabel}: "${formTitle}${formTitle.length >= 15 ? "..." : ""}"` : typeLabel
      case COMPONENT_TYPES.CONTAINER:
        return `${typeLabel} (${node.children.length} items)`
      case COMPONENT_TYPES.ROW:
        return `${typeLabel} (${node.children.length} items)`
      case COMPONENT_TYPES.COLUMN:
        return `${typeLabel} (${node.children.length} items)`
      default:
        return typeLabel
    }
  }

  const isHidden = node.style?.display === "none"

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={cn(
            "flex items-center py-1 px-2 cursor-pointer text-sm hover:bg-gray-100 rounded group",
            isSelected && "bg-blue-100 hover:bg-blue-100",
            isHidden && "opacity-50",
          )}
          style={{ paddingLeft: `${level * 12 + 4}px` }}
          onClick={handleSelect}
          title={currentPath}
        >
          {hasChildren && (
            <button onClick={handleToggleExpand} className="mr-1 text-gray-500 hover:text-gray-700">
              {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            </button>
          )}
          {!hasChildren && <div className="w-3.5 h-3.5 mr-1" />}

          <span className="flex-1 truncate">{getComponentLabel()}</span>

          {/* Component indicators */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isHidden && <EyeOff className="h-3 w-3 text-gray-400" />}
            {hasChildren && (
              <span className="text-xs text-gray-400 bg-gray-200 px-1 rounded">{node.children.length}</span>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleCopy}>
                <Copy className="h-3.5 w-3.5 mr-2" />
                Copy
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCut}>
                <Scissors className="h-3.5 w-3.5 mr-2" />
                Cut
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePaste}>
                <Clipboard className="h-3.5 w-3.5 mr-2" />
                Paste Inside
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleVisibility}>
                {isHidden ? <Eye className="h-3.5 w-3.5 mr-2" /> : <EyeOff className="h-3.5 w-3.5 mr-2" />}
                {isHidden ? "Show" : "Hide"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSaveAsCustom}>
                <Save className="h-3.5 w-3.5 mr-2" />
                Save as Custom
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </ContextMenuItem>
        <ContextMenuItem onClick={handleCut}>
          <Scissors className="h-4 w-4 mr-2" />
          Cut
        </ContextMenuItem>
        <ContextMenuItem onClick={handlePaste}>
          <Clipboard className="h-4 w-4 mr-2" />
          Paste Inside
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleToggleVisibility}>
          {isHidden ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
          {isHidden ? "Show Component" : "Hide Component"}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleSaveAsCustom}>
          <Save className="h-4 w-4 mr-2" />
          Save as Custom Component
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={handleDelete} className="text-red-600 focus:text-red-600">
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedId={selectedId}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              parentPath={currentPath}
            />
          ))}
        </div>
      )}
    </ContextMenu>
  )
}

export default function ComponentTree() {
  const { componentTree, selectedComponentId, selectComponent } = useDesignerStore()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const handleToggleExpand = (id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  const getTotalComponents = (node: ComponentNode): number => {
    return 1 + node.children.reduce((sum, child) => sum + getTotalComponents(child), 0)
  }

  const totalComponents = componentTree.children.reduce((sum, child) => sum + getTotalComponents(child), 0)

  return (
    <div className="h-full border-t bg-white flex flex-col">
      <div className="p-2 border-b flex items-center justify-between">
        <h3 className="text-sm font-medium">Component Tree</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{totalComponents} components</span>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {componentTree.children.length > 0 ? (
            componentTree.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={0}
                onSelect={selectComponent}
                selectedId={selectedComponentId}
                expanded={expanded}
                onToggleExpand={handleToggleExpand}
              />
            ))
          ) : (
            <div className="text-sm text-gray-500 italic text-center py-8">
              <div className="mb-2">No components added yet</div>
              <div className="text-xs">Drag components from the palette to get started</div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
