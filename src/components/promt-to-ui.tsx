import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/sh-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/sh-card";
import { TabsContent } from "@/components/ui/sh-tabs";
import { sendMessageGeminiPage, sendAudioGeminiPage } from "@/lib/gemini";
import { toast } from "sonner";
import { parseJsonToPage } from "@/lib/utils";
import { useDesignerStore } from "@/lib/store";
import { Mic, MicOff, Send, Trash2 } from "lucide-react";

interface Message {
  id: number;
  sender: "user" | "bot";
  text: string;
  type?: "text" | "audio";
  audioUrl?: string;
}

function PromtToUI({ onSuccess }: { onSuccess?: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { addPageInterface } = useDesignerStore();

  // Auto-scroll to bottom when a new message arrives
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Cleanup audio URLs when component unmounts
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      toast.success("Grabación iniciada");
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Error al acceder al micrófono");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
        recordingIntervalRef.current = null;
      }

      toast.success("Grabación completada");
    }
  };

  const deleteAudio = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendText = async () => {
    if (!inputValue.trim()) return;

    const userPrompt = inputValue.trim();

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: userPrompt,
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsSending(true);

    try {
      const assistantMessage = await sendMessageGeminiPage(userPrompt);
      if (!assistantMessage) {
        toast.warning("No se recibió respuesta del asistente.");
        return;
      }

      if (!assistantMessage.trim().startsWith("```json")) {
        const message: Message = {
          id: Date.now() + 2,
          text: assistantMessage,
          sender: "bot",
          type: "text",
        };

        setMessages((prev) => [...prev, message]);
      }

      const page = parseJsonToPage(assistantMessage);
      addPageInterface(page);

      setIsSending(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error procesando prompt:", error);
      toast.error("Error al procesar el prompt");
      setIsSending(false);
    }
  };

  const handleSendAudio = async () => {
    if (!audioBlob) return;

    // Convert blob to File
    const audioFile = new File([audioBlob], "audio.webm", { type: "audio/webm" });

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: "Audio message",
      type: "audio",
      audioUrl: audioUrl || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const assistantMessage = await sendAudioGeminiPage(audioFile);
      if (!assistantMessage) {
        toast.warning("No se recibió respuesta del asistente.");
        return;
      }

      if (!assistantMessage.trim().startsWith("```json")) {
        const message: Message = {
          id: Date.now() + 2,
          text: assistantMessage,
          sender: "bot",
          type: "text",
        };

        setMessages((prev) => [...prev, message]);
      }

      const page = parseJsonToPage(assistantMessage);
      addPageInterface(page);

      deleteAudio();
      setIsSending(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error procesando audio:", error);
      toast.error("Error al procesar el audio");
      setIsSending(false);
    }
  };

  return (
    <TabsContent value="promtAI">
      <Card className="bg-black/20 backdrop-blur-md border border-cyan-700 text-cyan-100">
        <CardHeader>
          <CardTitle>Promt to UI</CardTitle>
          <CardDescription className="text-cyan-300">Write a message or record audio to generate UI.</CardDescription>
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
                  {msg.type === "audio" && msg.audioUrl ? (
                    <div className="flex items-center space-x-2">
                      <Mic className="w-4 h-4" />
                      <audio controls className="max-w-full">
                        <source src={msg.audioUrl} type="audio/webm" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  ) : (
                    msg.text
                  )}
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-cyan-400">
                There are no messages yet. Please write something or record audio to get started.
              </div>
            )}
          </div>

          {/* Audio Recording Section */}
          {audioUrl && (
            <div className="mt-3 p-3 bg-[#0f172a] rounded-lg border border-cyan-700">
              <div className="flex items-center justify-between mb-2">
                <span className="text-cyan-300 text-sm">Audio recorded ({formatTime(recordingTime)})</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={deleteAudio}
                  className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <audio controls className="w-full">
                <source src={audioUrl} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>
            </div>
          )}

          {isRecording && (
            <div className="mt-3 p-3 bg-red-900/20 border border-red-500 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-red-300">Recording... {formatTime(recordingTime)}</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-2">
          {/* Text Input Row */}
          <div className="flex items-center space-x-2 w-full">
            <input
              type="text"
              placeholder="Escribe tu prompt..."
              className="flex-1 bg-[#0f172a] border border-white/10 rounded-lg px-3 py-2 text-cyan-100 placeholder:text-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!isSending) handleSendText();
                }
              }}
              disabled={isSending}
            />
            <Button
              className="bg-cyan-600 hover:bg-cyan-700 text-white disabled:opacity-50 transition"
              disabled={!inputValue.trim() || isSending}
              onClick={handleSendText}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Audio Controls Row */}
          <div className="flex items-center justify-center space-x-2 w-full">
            {!isRecording ? (
              <Button
                onClick={startRecording}
                className="bg-green-600 hover:bg-green-700 text-white transition"
                disabled={isSending}
              >
                <Mic className="w-4 h-4 mr-2" />
                Record Audio
              </Button>
            ) : (
              <Button onClick={stopRecording} className="bg-red-600 hover:bg-red-700 text-white transition">
                <MicOff className="w-4 h-4 mr-2" />
                Stop Recording
              </Button>
            )}

            {audioUrl && (
              <Button
                onClick={handleSendAudio}
                className="bg-purple-600 hover:bg-purple-700 text-white transition"
                disabled={isSending}
              >
                {isSending ? "Enviando..." : "Send Audio"}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </TabsContent>
  );
}

export default PromtToUI;
