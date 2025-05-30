import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: "AIzaSyBZ6SHRSHg61dRNqx68FgCi4aRZwSWGoe4" });

const INSTRUCTION = (
        "Eres un asistente de diseño para componentes web descritos en JSON. " +
        "Solo puedes modificar valores en 'properties' y 'style'. " +
        "No debes cambiar 'id', 'type', 'children', ni 'position'. " +
        "Si el usuario pide un cambio estructural, responde: " +
        "'Lo siento, no puedo ayudarte con eso. Solo puedo modificar propiedades como el texto o estilos como colores, tamaño de fuente, márgenes, bordes, etc.'"
    )

export async function sendMessageGemini(prompt: string):Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt,
    config: {
      systemInstruction: INSTRUCTION,
    },
  });
  console.log(response.text);
  return response.text;
}