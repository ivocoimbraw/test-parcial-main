"use client"

import type React from "react"

import { useState } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import Sidebar from "@/components/sidebar"
import PhonePreview from "@/components/phone-preview"
import PropertyPanel from "@/components/property-panel"
import { useDesignerStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Download, Save, Upload, Undo, Redo, Code, MessageSquare } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import CodeViewer from "@/components/code-viewer"
import PageSelector from "@/components/page-selector"
import ChatPanel from "@/components/chat-panel"
import { Page } from "@/lib/types"

export default function AppLayout() {
  const { toast } = useToast()
  const [codeViewOpen, setCodeViewOpen] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const { canUndo, canRedo, undo, redo, pages, addPageInterface } =
    useDesignerStore()

  const handleSaveDesign = () => {
    const designJson = JSON.stringify(useDesignerStore.getState())
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
        const json = JSON.parse(event.target?.result as string) as Page;
        addPageInterface(json);
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

  const toggleCodeView = () => {
    setCodeViewOpen(!codeViewOpen)
    if (chatOpen) setChatOpen(false)
  }

  const toggleChatView = () => {
    setChatOpen(!chatOpen)
    if (codeViewOpen) setCodeViewOpen(false)
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between p-2 border-b bg-background">
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
            <PageSelector />
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleSaveDesign}>
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={() => document.getElementById("load-design")?.click()}>
                <Upload className="w-4 h-4 mr-1" />
                Load Page
                <input id="load-design" type="file" accept=".json" className="hidden" onChange={handleLoadDesign} />
              </Button>
              <Button variant="outline" size="sm" onClick={toggleCodeView}>
                <Code className="w-4 h-4 mr-1" />
                {codeViewOpen ? "Hide Code" : "View Code"}
              </Button>
              <Button variant="outline" size="sm" onClick={toggleChatView}>
                <MessageSquare className="w-4 h-4 mr-1" />
                {chatOpen ? "Hide Chat" : "Chat"}
              </Button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden bg-[#0a0f14]">
            <div className="flex flex-col flex-1">
              {codeViewOpen ? <CodeViewer /> : chatOpen ? <ChatPanel /> : <PhonePreview />}
            </div>
            <PropertyPanel />
          </div>
        </div>
      </div>
    </DndProvider>
  )
}
