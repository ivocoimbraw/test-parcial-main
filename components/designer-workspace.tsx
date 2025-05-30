"use client"

import type React from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import ComponentPalette from "@/components/component-palette"
import PhonePreview from "@/components/phone-preview"
import PropertyPanel from "@/components/property-panel"
import ComponentTree from "@/components/component-tree"
import { useDesignerStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Download, Save, Upload, Undo, Redo } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { exportFlutterCode } from "@/lib/code-generator"

export default function DesignerWorkspace() {
  const { toast } = useToast()
  const { componentTree, selectedComponentId, canUndo, canRedo, undo, redo, setComponentTree } = useDesignerStore()

  const handleExportCode = () => {
    const code = exportFlutterCode(componentTree)

    // Create a blob and download it
    const blob = new Blob([code], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "flutter_ui.dart"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Code Exported",
      description: "Flutter code has been exported successfully.",
    })
  }

  const handleSaveDesign = () => {
    const designJson = JSON.stringify(componentTree)
    const blob = new Blob([designJson], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "flutter_design.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Design Saved",
      description: "Your design has been saved successfully.",
    })
  }

  const handleLoadDesign = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        setComponentTree(json)
        toast({
          title: "Design Loaded",
          description: "Your design has been loaded successfully.",
        })
      } catch (error) {
        toast({
          title: "Load Failed",
          description: "Failed to load design file.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex items-center justify-between p-2 border-b bg-gray-50">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={undo} disabled={!canUndo}>
              <Undo className="w-4 h-4 mr-1" />
              Undo
            </Button>
            <Button variant="outline" size="sm" onClick={redo} disabled={!canRedo}>
              <Redo className="w-4 h-4 mr-1" />
              Redo
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleSaveDesign}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={() => document.getElementById("load-design")?.click()}>
              <Upload className="w-4 h-4 mr-1" />
              Load Test
              <input id="load-design" type="file" accept=".json" className="hidden" onChange={handleLoadDesign} />
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCode}>
              <Download className="w-4 h-4 mr-1" />
              Export Code Test
            </Button>
          </div>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <ComponentPalette />
          <div className="flex flex-col flex-1">
            <PhonePreview />
            <ComponentTree />
          </div>
          <PropertyPanel />
        </div>
      </div>
    </DndProvider>
  )
}
