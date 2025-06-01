import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/sh-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/sh-card";
import { TabsContent } from "@/components/ui/sh-tabs";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
}

function PromtToUI({ onSuccess }: { onSuccess?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when a new message arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: inputValue.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      // Aquí podrías llamar a tu función para generar UI a partir del prompt
      // por ejemplo: const uiResult = await GenerateUIFromPrompt(inputValue);
      // Luego agregar la respuesta del "bot" a los mensajes, p. ej.:
      const fakeBotResponse: Message = {
        id: Date.now() + 1,
        sender: "bot",
        text: "Procesando tu prompt...",
      };
      setMessages((prev) => [...prev, fakeBotResponse]);

      // Simular retraso para demostración; reemplaza con tu lógica real
      setTimeout(() => {
        const uiGeneratedResponse: Message = {
          id: Date.now() + 2,
          sender: "bot",
          text: "Aquí estaría la interfaz generada a partir de tu prompt.",
        };
        setMessages((prev) => [...prev, uiGeneratedResponse]);
        setIsSending(false);
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (error) {
      console.error("Error procesando prompt:", error);
      setIsSending(false);
    }
  };

  return (
    <TabsContent value="promtAI">
      <Card className="bg-black/20 backdrop-blur-md border border-cyan-700 text-cyan-100">
        <CardHeader>
          <CardTitle>Promt to UI</CardTitle>
          <CardDescription className="text-cyan-300">Write your message as a message to generate UI.</CardDescription>
        </CardHeader>
        <CardContent className="px-4">
          <div ref={scrollRef} className="h-64 overflow-y-auto space-y-2 p-2 bg-[#0f172a] rounded-lg">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[70%] px-3 py-2 rounded-lg break-words ${
                    msg.sender === "user" ? "bg-cyan-600 text-white" : "bg-white/10 text-cyan-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-cyan-400">
                There are no messages yet. Please write something to get started.
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Escribe tu prompt..."
            className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-cyan-100 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isSending) handleSend();
              }
            }}
          />
          <Button
            className="bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 transition"
            disabled={!inputValue.trim() || isSending}
            onClick={handleSend}
          >
            {isSending ? "Enviando..." : "Enviar"}
          </Button>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}

export default PromtToUI;
