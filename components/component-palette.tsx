"use client"

import type React from "react"
import { useDrag } from "react-dnd"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/button"
import {
  Square,
  Type,
  AlignJustify,
  Layout,
  Layers,
  ToggleLeft,
  Star,
  Menu,
  Sliders,
  ChevronDown,
  Table,
  FormInput,
  FileText,
} from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { COMPONENT_TYPES } from "@/lib/constants"

interface ComponentItemProps {
  type: string
  name: string
  icon: React.ReactNode
  properties?: Record<string, any>
  style?: Record<string, any>
}

const defaultStyle = {
  fontSize: 16,
  borderRadius: 5,
  color: "#000000",
  backgroundColor: "#ffffff",
}

function ComponentItem({ type, name, icon, properties, style = {} }: ComponentItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: { type, properties, style },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }))

  return (
    <div
      ref={drag}
      className={`flex items-center gap-2 p-2 border rounded-md cursor-move hover:bg-gray-50 ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="p-1 text-gray-500">{icon}</div>
      <span className="text-sm">{name}</span>
    </div>
  )
}

export default function ComponentPalette() {
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b">
        <h3 className="font-medium">Component Palette</h3>
      </div>
      <Tabs defaultValue="basic" className="flex flex-col flex-1">
        <TabsList className="w-full justify-start px-3 pt-2">
          <TabsTrigger value="basic">Basic</TabsTrigger>
          <TabsTrigger value="layout">Layout</TabsTrigger>
          <TabsTrigger value="input">Input</TabsTrigger>
        </TabsList>
        <ScrollArea className="flex-1">
          <TabsContent value="basic" className="p-3 space-y-2">
            <ComponentItem
              type={COMPONENT_TYPES.TEXT}
              name="Text"
              icon={<Type size={16} />}
              properties={{ text: "Text" }}
              style={{ ...defaultStyle, width: 35, height: 30 }}
            />
            <ComponentItem
              type={COMPONENT_TYPES.BUTTON}
              name="Primary Button"
              icon={<Square size={16} />}
              properties={{ text: "Button", variant: "primary" }}
              style={{ ...defaultStyle, width: 50, height: 30, backgroundColor: "#4184f0", color:"#ffff" }}
            />
            <ComponentItem
              type={COMPONENT_TYPES.CARD}
              name="Card"
              icon={<Layout size={16} />}
              properties={{ title: "Card Title", content: "Card content goes here" }}
              style={{ ...defaultStyle, width: 50, height: 30 }}
            />
            <ComponentItem
              type={COMPONENT_TYPES.ICON}
              name="Icon"
              icon={<Star size={16} />}
              properties={{ icon: "star", size: 24 }}
              style={{ ...defaultStyle, width: 25, height: 25}}
            />
            <ComponentItem
              type={COMPONENT_TYPES.SLIDER}
              name="Slider"
              icon={<Sliders size={16} />}
              properties={{ value: 50, min: 0, max: 100 }}
            />
          </TabsContent>
          <TabsContent value="layout" className="p-3 space-y-2">
            <ComponentItem
              type={COMPONENT_TYPES.CONTAINER}
              name="Container"
              icon={<Square size={16} />}
              properties={{ padding: 16, color: "#FFFFFF" }}
              style={{ ...defaultStyle, width: 150, height: 150}}
            />
            <ComponentItem
              type={COMPONENT_TYPES.STACK}
              name="Stack"
              icon={<Layers size={16} />}
              properties={{ alignment: "center" }}
              style={{ ...defaultStyle, width: 150, height: 150}}
            />
            <ComponentItem
              type={COMPONENT_TYPES.LIST_VIEW}
              name="List View"
              icon={<AlignJustify size={16} />}
              properties={{ itemCount: 3, scrollDirection: "vertical" }}
              style={{ ...defaultStyle, width: 150, height: 200 }}
            />
            <ComponentItem
              type={COMPONENT_TYPES.TABLE}
              name="Table"
              icon={<Table size={16} />}
              properties={{ rows: 3, columns: 3, headers: ["Column 1", "Column 2", "Column 3"] }}
              style={{ ...defaultStyle, width: 300, height: 200 }}
            />
          </TabsContent>
          <TabsContent value="input" className="p-3 space-y-2">
            <ComponentItem
              type={COMPONENT_TYPES.TEXT_FIELD}
              name="Text Field"
              icon={<Type size={16} />}
              properties={{ hint: "Hint text" }}
              style={{ ...defaultStyle, width: 100, height: 30, backgroundColor: "#dedede" }}
            />
            <ComponentItem
              type={COMPONENT_TYPES.CHECKBOX}
              name="Checkbox"
              icon={<Square size={16} />}
              properties={{ label: "Checkbox", value: false }}
              style={{ ...defaultStyle, width: 150, height: 30, backgroundColor: "#dedede" }}
            />
            <ComponentItem
              type={COMPONENT_TYPES.SWITCH}
              name="Switch"
              icon={<ToggleLeft size={16} />}
              properties={{ value: false }}
              style={{ ...defaultStyle, width: 40, height: 30 }}
            />
            <ComponentItem
              type={COMPONENT_TYPES.RADIO}
              name="Radio Button"
              icon={<Square size={16} />}
              properties={{ label: "Option", value: "option", groupValue: "option" }}
              style={{ ...defaultStyle, width: 70, height: 30 }}
            />
            <ComponentItem
              type={COMPONENT_TYPES.DROPDOWN_BUTTON}
              name="Dropdown Button"
              icon={<ChevronDown size={16} />}
              properties={{ text: "Select Option", options: ["Option 1", "Option 2", "Option 3"] }}
            />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  )
}
