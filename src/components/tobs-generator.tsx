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
        <Button
          variant="outline"
          className="text-cyan-500 border-cyan-500 hover:bg-cyan-500 hover:text-white transition-all"
        >
          Generator
        </Button>
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
