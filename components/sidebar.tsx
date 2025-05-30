"use client"

import { useState } from "react"
import ComponentPalette from "@/components/component-palette"
import ComponentTree from "@/components/component-tree"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, Layers } from "lucide-react"

export default function Sidebar() {
  const [activeTab, setActiveTab] = useState("palette")

  return (
    <div className="w-64 border-r bg-white flex flex-col h-full">
      <Tabs defaultValue="palette" className="flex flex-col h-full">
        <TabsList className="w-full justify-start px-3 pt-2 border-b">
          <TabsTrigger value="palette" onClick={() => setActiveTab("palette")}>
            <Palette className="h-4 w-4 mr-1" />
            Components
          </TabsTrigger>
          <TabsTrigger value="tree" onClick={() => setActiveTab("tree")}>
            <Layers className="h-4 w-4 mr-1" />
            Tree
          </TabsTrigger>
        </TabsList>
        <TabsContent value="palette" className="flex-1 p-0 overflow-hidden">
          <ComponentPalette />
        </TabsContent>
        <TabsContent value="tree" className="flex-1 p-0 overflow-hidden">
          <ComponentTree />
        </TabsContent>
      </Tabs>
    </div>
  )
}
