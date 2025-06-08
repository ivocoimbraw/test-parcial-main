"use client";
import { Button } from "@/components/ui/sh-button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/sh-tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import ImageToUIComponent from "./image-to-ui";
import { useState } from "react";
import PromtToUI from "./promt-to-ui";

export function TabsGenerator() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {/* <Button
          variant="outline"
          className="text-cyan-500 border-cyan-500 hover:bg-cyan-500 hover:text-white transition-all"
        >
          Generator
        </Button> */}
        <button className="relative group px-4 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl text-cyan-300 hover:text-white transition-all duration-300 backdrop-blur-sm">
          <span className="relative z-10 flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
              />
            </svg>
            <span>Generator</span>
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 to-blue-500/0 group-hover:from-cyan-500/20 group-hover:to-blue-500/20 rounded-xl transition-all duration-300"></div>
        </button>
      </DialogTrigger>
      <DialogContent className="bg-black/20 backdrop-blur-md border-b border-white/10 text-cyan-100 rounded-xl shadow-2xl px-8 py-6 !top-1/2 !left-1/2 !-translate-x-1/2 !-translate-y-1/2">
        <DialogHeader>
          <DialogTitle>Generator UI</DialogTitle>
          <DialogDescription>Upload an image or promt to get started</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="imageAI" className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-4 bg-black/20 border backdrop-blur-md  border-cyan-700 rounded-lg overflow-hidden">
            <TabsTrigger value="imageAI" className="data-[state=active]:bg-cyan-700 ">
              Image to UI
            </TabsTrigger>
            <TabsTrigger value="promtAI" className="data-[state=active]:bg-cyan-700">
              Promt to UI
            </TabsTrigger>
          </TabsList>

          {/* Imagen a UI */}
          <ImageToUIComponent onSuccess={() => setOpen(false)} />

          <PromtToUI onSuccess={() => setOpen(false)} />
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
