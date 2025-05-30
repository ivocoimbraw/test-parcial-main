"use client"

import { useState, useRef } from "react"
import { useDrop } from "react-dnd"
import { useDesignerStore } from "@/lib/store"
import { renderComponent } from "@/lib/component-renderer"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Smartphone, Maximize, Minimize, Grid3X3 } from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Slider } from "@/components/ui/slider"

const DEVICES = [
  { id: "iphone13", name: "iPhone 13", width: 390, height: 844 },
  { id: "iphone13mini", name: "iPhone 13 Mini", width: 375, height: 812 },
  { id: "pixel6", name: "Pixel 6", width: 412, height: 915 },
  { id: "samsungs21", name: "Samsung S21", width: 360, height: 800 },
]

export default function PhonePreview() {
  const [device, setDevice] = useState(DEVICES[0])
  const [showFrame, setShowFrame] = useState(true)
  const [showGrid, setShowGrid] = useState(false)
  const [zoom, setZoom] = useState(100)
  const previewRef = useRef<HTMLDivElement>(null)

  const { componentTree, addComponent, selectedComponentId, selectComponent, moveComponent } = useDesignerStore()


  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["COMPONENT", "DRAGGABLE_COMPONENT"],
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset()
      const containerRect = previewRef.current?.getBoundingClientRect()

      if (offset && containerRect) {
        // Calculate position relative to the container
        const x = offset.x - containerRect.left
        const y = offset.y - containerRect.top

        if (item.type === "DRAGGABLE_COMPONENT") {
          // Move existing component
          moveComponent(item.id, x, y)
        } else {
          // Add new component from palette - always add to root level for positioning
          addComponent(item.type, { ...item.properties }, null)
        }
      }
      return undefined
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }))

  const handleDeviceChange = (value: string) => {
    const newDevice = DEVICES.find((d) => d.id === value) || DEVICES[0]
    setDevice(newDevice)
  }

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0])
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Select value={device.id} onValueChange={handleDeviceChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent>
              {DEVICES.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Toggle pressed={showFrame} onPressedChange={setShowFrame} size="sm" aria-label="Toggle device frame">
            <Smartphone className="h-4 w-4" />
          </Toggle>
          <Toggle pressed={showGrid} onPressedChange={setShowGrid} size="sm" aria-label="Toggle grid">
            <Grid3X3 className="h-4 w-4" />
          </Toggle>
        </div>
        <div className="flex items-center gap-2">
          <Minimize className="h-4 w-4 text-gray-500" />
          <Slider value={[zoom]} min={50} max={150} step={10} className="w-32" onValueChange={handleZoomChange} />
          <Maximize className="h-4 w-4 text-gray-500" />
          <span className="text-xs text-gray-500">{zoom}%</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100 p-4">
        <div
          ref={drop}
          className={`relative ${showFrame ? "border-8 border-gray-800 rounded-3xl" : ""}`}
          style={{
            width: (device.width * zoom) / 100,
            height: (device.height * zoom) / 100,
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center",
            overflow: "hidden",
            transition: "all 0.3s ease",
            backgroundColor: "white",
          }}
        >
          <div ref={previewRef} className="w-full h-full overflow-auto relative" onClick={() => selectComponent(null)}>
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-12 grid-rows-[repeat(auto-fill,minmax(8px,1fr))] pointer-events-none">
                {Array.from({ length: 12 * 50 }).map((_, i) => (
                  <div key={i} className="border border-blue-100/30"></div>
                ))}
              </div>
            )}
            {componentTree.children.length > 0 ? (
              componentTree.children.map((child, index) =>
                renderComponent(child, index, selectComponent, selectedComponentId, moveComponent),
              )
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                {isOver ? "Drop component here" : "Drag components from the palette"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
