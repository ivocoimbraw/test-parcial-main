"use client"

import type React from "react"
import { useDrag, useDrop } from "react-dnd"
import { useState, useRef, useEffect } from "react"
import type { ComponentNode } from "@/lib/types"
import { COMPONENT_TYPES } from "@/lib/constants"
import { cn } from "@/lib/utils"
import {
  Check,
  ChevronDown,
  ChevronRight,
  Star,
  Heart,
  ShoppingCart,
  User,
  Mail,
  Phone,
  Calendar,
  Clock,
  ImageIcon,
  Search,
  Settings,
  Home,
  Menu,
  X,
  Plus,
  Minus,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
  MoreVertical,
} from "lucide-react"

// Map of icon names to Lucide React components
const ICONS: Record<string, React.ReactNode> = {
  star: <Star />,
  heart: <Heart />,
  cart: <ShoppingCart />,
  user: <User />,
  mail: <Mail />,
  phone: <Phone />,
  calendar: <Calendar />,
  clock: <Clock />,
  image: <ImageIcon />,
  search: <Search />,
  settings: <Settings />,
  home: <Home />,
  menu: <Menu />,
  x: <X />,
  plus: <Plus />,
  minus: <Minus />,
  info: <Info />,
  alert: <AlertCircle />,
  check: <CheckCircle />,
  error: <XCircle />,
  chevronDown: <ChevronDown />,
  chevronRight: <ChevronRight />,
}

// Import useDesignerStore for interactive components
import { useDesignerStore } from "@/lib/store"

// Draggable component wrapper with resize handles and drop zone
function DraggableComponent({
  component,
  children,
  isSelected,
  onSelect,
  onMove,
}: {
  component: ComponentNode
  children: React.ReactNode
  isSelected: boolean
  onSelect: (id: string) => void
  onMove?: (id: string, x: number, y: number) => void
}) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "DRAGGABLE_COMPONENT",
    item: { id: component.id, type: "DRAGGABLE_COMPONENT" },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  const [resizing, setResizing] = useState<string | null>(null)
  const [initialSize, setInitialSize] = useState({ width: 0, height: 0 })
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 })
  const [initialMouse, setInitialMouse] = useState({ x: 0, y: 0 })
  const componentRef = useRef<HTMLDivElement>(null)
  const { updateComponentProperty } = useDesignerStore.getState()

  // Handle mouse move for resizing
  useEffect(() => {
    if (!resizing) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!componentRef.current) return

      const deltaX = e.clientX - initialMouse.x
      const deltaY = e.clientY - initialMouse.y

      let newWidth = initialSize.width
      let newHeight = initialSize.height
      let newX = initialPos.x
      let newY = initialPos.y

      // Calculate new size and position based on resize handle
      switch (resizing) {
        case "top-left":
          newWidth = Math.max(20, initialSize.width - deltaX)
          newHeight = Math.max(20, initialSize.height - deltaY)
          newX = initialPos.x + initialSize.width - newWidth
          newY = initialPos.y + initialSize.height - newHeight
          break
        case "top-right":
          newWidth = Math.max(20, initialSize.width + deltaX)
          newHeight = Math.max(20, initialSize.height - deltaY)
          newY = initialPos.y + initialSize.height - newHeight
          break
        case "bottom-left":
          newWidth = Math.max(20, initialSize.width - deltaX)
          newHeight = Math.max(20, initialSize.height + deltaY)
          newX = initialPos.x + initialSize.width - newWidth
          break
        case "bottom-right":
          newWidth = Math.max(20, initialSize.width + deltaX)
          newHeight = Math.max(20, initialSize.height + deltaY)
          break
      }

      // Update component style and position
      updateComponentProperty(component.id, "style.width", newWidth)
      updateComponentProperty(component.id, "style.height", newHeight)
      updateComponentProperty(component.id, "position.x", newX)
      updateComponentProperty(component.id, "position.y", newY)
    }

    const handleMouseUp = () => {
      setResizing(null)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [resizing, initialSize, initialPos, initialMouse, component.id, updateComponentProperty])

  // Start resizing
  const handleResizeStart = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation()
    e.preventDefault()

    if (!componentRef.current) return

    const rect = componentRef.current.getBoundingClientRect()
    setInitialSize({
      width: rect.width,
      height: rect.height,
    })
    setInitialPos({
      x: component.position?.x || 0,
      y: component.position?.y || 0,
    })
    setInitialMouse({
      x: e.clientX,
      y: e.clientY,
    })
    setResizing(handle)
  }

  return (
    <div
      ref={(node) => {
        drag(node)
        componentRef.current = node
      }}
      className={cn(
        "absolute cursor-move",
        isSelected && "outline outline-2 outline-blue-500",
        isDragging && "opacity-50",
      )}
      style={{
        left: component.position?.x || 0,
        top: component.position?.y || 0,
        width: component.style?.width || "auto",
        height: component.style?.height || "auto",
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(component.id)
      }}
    >
      {children}
      {isSelected && (
        <>
          {/* Resize handles */}
          <div
            className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "top-left")}
          ></div>
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "top-right")}
          ></div>
          <div
            className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "bottom-left")}
          ></div>
          <div
            className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize z-10"
            onMouseDown={(e) => handleResizeStart(e, "bottom-right")}
          ></div>
        </>
      )}
    </div>
  )
}

// Droppable Container Component for unlimited nesting
function DroppableContainer({
  component,
  children,
  isSelected,
  onSelect,
  onMove,
}: {
  component: ComponentNode
  children: React.ReactNode
  isSelected: boolean
  onSelect: (id: string) => void
  onMove?: (id: string, x: number, y: number) => void
}) {
  const { addComponent } = useDesignerStore()

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["COMPONENT", "DRAGGABLE_COMPONENT"],
    drop: (item: any, monitor) => {
      // Only handle the drop if it's directly over this container
      if (monitor.didDrop()) return

      if (item.type === "DRAGGABLE_COMPONENT") {
        // Handle moving existing component - for now, we'll just select it
        onSelect(item.id)
      } else {
        // Add new component to this container
        console.log("UNITEM", item)
        addComponent(item.type, item.properties, component.id, item.style)
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }))

  return (
    <div
      ref={drop}
      className={cn(
        "relative min-h-[40px]",
        isOver && "bg-blue-50 border-2 border-dashed border-blue-300",
        isSelected && "outline outline-2 outline-blue-500",
      )}
      style={{
        padding: component.properties.padding || 16,
        backgroundColor: component.properties.color || "#FFFFFF",
        borderRadius: component.style?.borderRadius || 0,
        ...component.style,
      }}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(component.id)
      }}
    >
      {component.children.length === 0 && isOver && (
        <div className="absolute inset-0 flex items-center justify-center text-blue-500 text-sm pointer-events-none">
          Drop component here
        </div>
      )}
      {component.children.map((child, childIndex) =>
        renderComponent(child, childIndex, onSelect, isSelected ? component.id : null, onMove),
      )}
      {children}
    </div>
  )
}

export function renderComponent(
  component: ComponentNode,
  index: number,
  onSelect: (id: string) => void,
  selectedId: string | null,
  onMove?: (id: string, x: number, y: number) => void,
) {
  const isSelected = selectedId === component.id

  // Common props for all components
  const commonProps = {
    key: component.id,
    style: {
      ...component.style,
    },
  }

  // Render different components based on type
  let renderedComponent: React.ReactNode

  switch (component.type) {



    case COMPONENT_TYPES.SLIDER:
      renderedComponent = <SliderComponent component={component} onSelect={onSelect} />
      break

    case COMPONENT_TYPES.DROPDOWN_BUTTON:
      renderedComponent = <DropdownButtonComponent component={component} onSelect={onSelect} />
      break


    case COMPONENT_TYPES.TABLE:
      const rows = component.properties.rows || 3
      const columns = component.properties.columns || 3
      const headers = component.properties.headers || Array.from({ length: columns }, (_, i) => `Column ${i + 1}`)

      renderedComponent = (
        <div
          style={{
            border: "1px solid #CCCCCC",
            borderRadius: 4,
            overflow: "hidden",
            ...component.style,
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              backgroundColor: "#F5F5F5",
            }}
          >
            {headers.map((header: string, index: number) => (
              <div
                key={index}
                style={{
                  padding: "12px 8px",
                  borderRight: index < columns - 1 ? "1px solid #CCCCCC" : "none",
                  fontWeight: "bold",
                  fontSize: 14,
                }}
              >
                {header}
              </div>
            ))}
          </div>
          {/* Table Body */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                borderTop: "1px solid #CCCCCC",
              }}
            >
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  style={{
                    padding: "12px 8px",
                    borderRight: colIndex < columns - 1 ? "1px solid #CCCCCC" : "none",
                    fontSize: 14,
                  }}
                >
                  Row {rowIndex + 1}
                </div>
              ))}
            </div>
          ))}
        </div>
      )
      break

    case COMPONENT_TYPES.TEXT:
      renderedComponent = (
        <p
          style={{
            margin: 0,
            fontSize: component.style?.fontSize || 16,
            color: component.style?.color || "#000000",
          }}
        >
          {component.properties.text || "Text"}
        </p>
      )
      break

    case COMPONENT_TYPES.BUTTON:
      const buttonVariant = component.properties.variant || "primary"
      let buttonStyle: React.CSSProperties = {
        padding: "8px 16px",
        borderRadius: component.style?.borderRadius || 4,
        fontSize: component.style?.fontSize || 16,
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "none",
      }

      // Apply styles based on variant
      switch (buttonVariant) {
        case "primary":
          buttonStyle = {
            ...buttonStyle,
            backgroundColor: "#2196F3",
            color: "#FFFFFF",
          }
          break
        case "secondary":
          buttonStyle = {
            ...buttonStyle,
            backgroundColor: "#9E9E9E",
            color: "#FFFFFF",
          }
          break
        case "outline":
          buttonStyle = {
            ...buttonStyle,
            backgroundColor: "transparent",
            color: "#2196F3",
            border: "1px solid #2196F3",
          }
          break
        case "text":
          buttonStyle = {
            ...buttonStyle,
            backgroundColor: "transparent",
            color: "#2196F3",
            padding: "8px 0",
          }
          break
      }

      renderedComponent = (
        <button
          style={{
            ...buttonStyle,
            ...component.style,
          }}
          type="button"
          onClick={(e) => e.stopPropagation()}
        >
          {component.properties.text || "Button"}
        </button>
      )
      break

    case COMPONENT_TYPES.CONTAINER:
      renderedComponent = (
        <DroppableContainer component={component} isSelected={isSelected} onSelect={onSelect} onMove={onMove} />
      )
      break

    case COMPONENT_TYPES.STACK:
      renderedComponent = (
        <DroppableContainer component={component} isSelected={isSelected} onSelect={onSelect} onMove={onMove}>
          <div
            style={{
              position: "relative",
              ...component.style,
              padding: 0, // Remove padding since DroppableContainer handles it
            }}
          />
        </DroppableContainer>
      )
      break

    case COMPONENT_TYPES.CARD:
      renderedComponent = (
        <DroppableContainer component={component} isSelected={isSelected} onSelect={onSelect} onMove={onMove}>
          <div
            style={{
              borderRadius: component.style?.borderRadius || 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              backgroundColor: "#FFFFFF",
              ...component.style,
              padding: 0, // Remove padding since DroppableContainer handles it
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 8 }}>{component.properties.title || "Card Title"}</div>
            <div>{component.properties.content || "Card content goes here"}</div>
          </div>
        </DroppableContainer>
      )
      break

    case COMPONENT_TYPES.TEXT_FIELD:
      renderedComponent = (
        <div>
          <input
            type="text"
            placeholder={component.properties.hint || ""}
            style={{
              width: "100%",
              padding: "8px 12px",
              borderRadius: component.style?.borderRadius || 4,
              border: "1px solid #CCCCCC",
              fontSize: component.style?.fontSize || 16,
              ...component.style,
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )
      break

    case COMPONENT_TYPES.CHECKBOX:
      renderedComponent = <CheckboxComponent component={component} onSelect={onSelect} />
      break

    case COMPONENT_TYPES.SWITCH:
      renderedComponent = <SwitchComponent component={component} onSelect={onSelect} />
      break

    case COMPONENT_TYPES.RADIO:
      renderedComponent = <RadioComponent component={component} onSelect={onSelect} />
      break

    case COMPONENT_TYPES.ICON:
      const iconName = component.properties.icon || "star"
      const iconSize = component.properties.size || 24

      renderedComponent = (
        <div
          style={{
            width: iconSize,
            height: iconSize,
            color: component.style?.color || "#000000",
            ...component.style,
          }}
        >
          {ICONS[iconName] || ICONS.star}
        </div>
      )
      break

    case COMPONENT_TYPES.LIST_VIEW:
      const itemCount = component.properties.itemCount || 3
      const scrollDirection = component.properties.scrollDirection || "vertical"

      renderedComponent = (
        <DroppableContainer component={component} isSelected={isSelected} onSelect={onSelect} onMove={onMove}>
          <div
            style={{
              display: "flex",
              flexDirection: scrollDirection === "vertical" ? "column" : "row",
              gap: 8,
              overflow: "auto",
              ...component.style,
              padding: 0, // Remove padding since DroppableContainer handles it
            }}
          >
            {Array.from({ length: itemCount }).map((_, i) => (
              <div
                key={i}
                style={{
                  padding: 16,
                  backgroundColor: "#F5F5F5",
                  borderRadius: 4,
                  minWidth: scrollDirection === "horizontal" ? 150 : "auto",
                  minHeight: scrollDirection === "vertical" ? 50 : "auto",
                }}
              >
                List Item {i + 1}
              </div>
            ))}
          </div>
        </DroppableContainer>
      )
      break

    default:
      renderedComponent = <div>Unknown Component: {component.type}</div>
      break
  }

  // Wrap in draggable container if it's a top-level component
  if (component.position && onMove) {
    return (
      <DraggableComponent
        key={component.id}
        component={component}
        isSelected={isSelected}
        onSelect={onSelect}
        onMove={onMove}
      >
        {renderedComponent}
      </DraggableComponent>
    )
  }

  // Otherwise return the component with click handler
  return (
    <div
      {...commonProps}
      onClick={(e) => {
        e.stopPropagation()
        onSelect(component.id)
      }}
      className={cn("relative", isSelected && "outline outline-2 outline-blue-500")}
    >
      {renderedComponent}
    </div>
  )
}

// Slider Component with hooks
function SliderComponent({ component, onSelect }: { component: ComponentNode; onSelect: (id: string) => void }) {
  const { updateComponentProperty } = useDesignerStore()
  const sliderValue = component.properties.value || 50
  const sliderMin = component.properties.min || 0
  const sliderMax = component.properties.max || 100
  const sliderPercent = ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100

  return (
    <div
      style={{
        padding: "16px",
        ...component.style,
      }}
    >
      <div
        style={{
          position: "relative",
          height: 4,
          backgroundColor: "#E0E0E0",
          borderRadius: 2,
          width: "100%",
        }}
        onClick={(e) => {
          e.stopPropagation()
          const rect = e.currentTarget.getBoundingClientRect()
          const clickX = e.clientX - rect.left
          const percent = (clickX / rect.width) * 100
          const newValue = Math.round(((sliderMax - sliderMin) * percent) / 100 + sliderMin)
          updateComponentProperty(component.id, "properties.value", newValue)
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            height: "100%",
            backgroundColor: "#2196F3",
            borderRadius: 2,
            width: `${sliderPercent}%`,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: -6,
            left: `${sliderPercent}%`,
            transform: "translateX(-50%)",
            width: 16,
            height: 16,
            backgroundColor: "#2196F3",
            borderRadius: "50%",
            cursor: "pointer",
          }}
        />
      </div>
      <div style={{ marginTop: 8, fontSize: 14, color: "#666" }}>Value: {sliderValue}</div>
    </div>
  )
}

// Dropdown Button Component with hooks
function DropdownButtonComponent({
  component,
  onSelect,
}: { component: ComponentNode; onSelect: (id: string) => void }) {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const { updateComponentProperty } = useDesignerStore()

  return (
    <div style={{ position: "relative", ...component.style }}>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "8px 16px",
          backgroundColor: "#F5F5F5",
          border: "1px solid #CCCCCC",
          borderRadius: 4,
          cursor: "pointer",
        }}
        onClick={(e) => {
          e.stopPropagation()
          setDropdownOpen(!dropdownOpen)
        }}
      >
        <span style={{ marginRight: 8 }}>{component.properties.text || "Select Option"}</span>
        <ChevronDown className="h-4 w-4" />
      </div>
      {dropdownOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #CCCCCC",
            borderRadius: 4,
            marginTop: 4,
            zIndex: 10,
            boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          }}
        >
          {(component.properties.options || ["Option 1", "Option 2", "Option 3"]).map((option: string, i: number) => (
            <div
              key={i}
              style={{
                padding: "8px 16px",
                cursor: "pointer",
                borderBottom: i < (component.properties.options || []).length - 1 ? "1px solid #EEEEEE" : "none",
              }}
              onClick={(e) => {
                e.stopPropagation()
                updateComponentProperty(component.id, "properties.text", option)
                setDropdownOpen(false)
              }}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Select Component with hooks
function SelectComponent({ component, onSelect }: { component: ComponentNode; onSelect: (id: string) => void }) {
  const [selectOpen, setSelectOpen] = useState(false)
  const { updateComponentProperty } = useDesignerStore()

  return (
    <div style={{ ...component.style }}>
      <div style={{ marginBottom: 4, fontSize: 14 }}>{component.properties.label || "Select"}</div>
      <div style={{ position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            border: "1px solid #CCCCCC",
            borderRadius: 4,
            backgroundColor: "#FFFFFF",
            cursor: "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation()
            setSelectOpen(!selectOpen)
          }}
        >
          <span>{component.properties.value || "Select an option"}</span>
          <ChevronDown className="h-4 w-4" />
        </div>
        {selectOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              width: "100%",
              backgroundColor: "#FFFFFF",
              border: "1px solid #CCCCCC",
              borderRadius: 4,
              marginTop: 4,
              zIndex: 10,
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            {(component.properties.options || ["Option 1", "Option 2", "Option 3"]).map((option: string, i: number) => (
              <div
                key={i}
                style={{
                  padding: "8px 16px",
                  cursor: "pointer",
                  borderBottom: i < (component.properties.options || []).length - 1 ? "1px solid #EEEEEE" : "none",
                  backgroundColor: component.properties.value === option ? "#F5F5F5" : "transparent",
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  updateComponentProperty(component.id, "properties.value", option)
                  setSelectOpen(false)
                }}
              >
                {option}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Checkbox Component with hooks
function CheckboxComponent({ component, onSelect }: { component: ComponentNode; onSelect: (id: string) => void }) {
  const { updateComponentProperty } = useDesignerStore()

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        ...component.style,
      }}
      onClick={(e) => {
        e.stopPropagation()
        updateComponentProperty(component.id, "properties.value", !component.properties.value)
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          border: "1px solid #CCCCCC",
          borderRadius: 2,
          marginRight: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: component.properties.value ? "#2196F3" : "transparent",
          cursor: "pointer",
        }}
      >
        {component.properties.value && <Check style={{ color: "#FFFFFF", width: 14, height: 14 }} />}
      </div>
      <span>{component.properties.label || "Checkbox"}</span>
    </div>
  )
}

// Switch Component with hooks
function SwitchComponent({ component, onSelect }: { component: ComponentNode; onSelect: (id: string) => void }) {
  const { updateComponentProperty } = useDesignerStore()

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        ...component.style,
      }}
      onClick={(e) => {
        e.stopPropagation()
        updateComponentProperty(component.id, "properties.value", !component.properties.value)
      }}
    >
      <div
        style={{
          width: 36,
          height: 20,
          borderRadius: 10,
          backgroundColor: component.properties.value ? "#2196F3" : "#CCCCCC",
          position: "relative",
          transition: "background-color 0.2s",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#FFFFFF",
            position: "absolute",
            top: 2,
            left: component.properties.value ? 18 : 2,
            transition: "left 0.2s",
          }}
        />
      </div>
    </div>
  )
}

// Radio Component with hooks
function RadioComponent({ component, onSelect }: { component: ComponentNode; onSelect: (id: string) => void }) {
  const { updateComponentProperty } = useDesignerStore()

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        ...component.style,
      }}
      onClick={(e) => {
        e.stopPropagation()
        updateComponentProperty(component.id, "properties.groupValue", component.properties.value)
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 9,
          border: "1px solid #CCCCCC",
          marginRight: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        {component.properties.value === component.properties.groupValue && (
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: "#2196F3",
            }}
          />
        )}
      </div>
      <span>{component.properties.label || "Radio Button"}</span>
    </div>
  )
}

// Helper function to convert Flutter alignment values to CSS
function getFlexAlignment(alignment: string | undefined): string {
  switch (alignment) {
    case "start":
      return "flex-start"
    case "center":
      return "center"
    case "end":
      return "flex-end"
    case "spaceBetween":
      return "space-between"
    case "spaceAround":
      return "space-around"
    case "spaceEvenly":
      return "space-evenly"
    case "stretch":
      return "stretch"
    case "baseline":
      return "baseline"
    default:
      return "flex-start"
  }
}
