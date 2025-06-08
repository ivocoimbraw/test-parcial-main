"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/button";
import { Send, User, Bot } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sendMessageGemini } from "@/lib/gemini";
import { extractJsonBlock, isValidComponentNode } from "@/lib/utils";
import { toast } from "sonner";
import { ComponentNode } from "@/lib/types";
import { useDesignerStore } from "@/lib/store";

type Message = {
  id: string;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
};

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your Flutter UI design assistant. How can I help you today?",
      sender: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { updateComponent, getSelectedComponent } = useDesignerStore();

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    await updateComponentAssistant(input);
  };

  const updateComponentAssistant = async (userPrompt: string) => {
    try {
      const selectedComponentString = JSON.stringify(getSelectedComponent());
      const assistantMessage = await sendMessageGemini(userPrompt, selectedComponentString);
      if (!assistantMessage) {
        toast.warning("No se recibió respuesta del asistente.");
        return;
      }

      if (!assistantMessage.trim().startsWith("```json")) {
        const message: Message = {
          id: Date.now().toString(),
          text: assistantMessage,
          sender: "assistant",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, message]);
      }

      const jsonText = extractJsonBlock(assistantMessage);

      if (!jsonText) {
        toast.warning("No se encontró un bloque JSON válido en la respuesta.");
        return;
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonText);
      } catch (err) {
        toast.error("El bloque JSON no es válido.");
        return;
      }

      if (!isValidComponentNode(parsed)) {
        toast.error("La estructura del JSON no coincide con un componente válido.");
        return;
      }

      toast.success("Componente actualizado exitosamente.");
      updateComponent(parsed as ComponentNode);
    } catch (error) {
      toast.error("Ocurrió un error inesperado al procesar la respuesta.");
      console.error("Error:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col max-h-[390px] m-2 bg-black/20 backdrop-blur-md border border-white/10 rounded-md">
      <div className="p-3 border-b border-white/10">
        <h3 className="font-medium text-cyan-100">Flutter Design Assistant</h3>
      </div>
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`flex max-w-[80%] ${
                  message.sender === "user"
                    ? "bg-cyan-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg"
                    : "bg-white/10 text-cyan-100 rounded-tl-lg rounded-tr-lg rounded-br-lg"
                } p-3`}
              >
                <div className="mr-2 mt-1">
                  {message.sender === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-cyan-100" />
                  )}
                </div>
                <div>
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-white/10 flex">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribe tu mensaje..."
          className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-cyan-100 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        <Button
          className="ml-2 bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 transition"
          onClick={handleSendMessage}
          disabled={!input.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
