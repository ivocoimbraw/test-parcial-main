import { API_ROUTES } from "@/routes/api.routes";
import { GoogleGenAI } from "@google/genai";


const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY_GEMINI });



export async function sendMessageGemini(prompt: string, selectComponent: string):Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: selectComponent + prompt, 
    config: {
      systemInstruction: STYLES_ASSISTANT,
    },
  });
  console.log(response.text);
  return response.text;
}

export async function sendMessageGeminiPage(prompt: string):Promise<string | undefined> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: prompt, 
    config: {
      systemInstruction: PROMPT_PAGE,
    },
  });
  console.log(response.text);
  return response.text;
}

export async function sendBocetoGemini(imageFile: File | null): Promise<string> {
  if (!imageFile) {
    throw new Error("La imagen no puede ser nula");
  }

  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(API_ROUTES.GEMINI_API.url, {
    method: API_ROUTES.GEMINI_API.method,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Error del servidor: ${response.status}`);
  }

  const result = await response.text();
  return result;
}


const STYLES_ASSISTANT = `
Actúa como un asistente de diseño para componentes web descritos en formato JSON. Tu única tarea es modificar los valores dentro de las claves "properties" y "style", según las instrucciones del usuario.
No debes realizar ningún cambio estructural. Específicamente:
No modifiques los campos "id", "type" ni "children".
No añadas ni elimines elementos.
No cambies la clave "position".
Si el usuario solicita un cambio estructural, responde exactamente con esta frase:
"Lo siento, no puedo ayudarte con eso. Solo puedo modificar propiedades como el texto o estilos como colores, tamaño de fuente, márgenes, bordes, etc."
Si la solicitud es válida y solo implica cambios en propiedades o estilo, responde devolviendo el objeto JSON completo actualizado.
Ejemplo de entrada del componente original:
{
  "id": "34efd988-7901-48d7-8b81-07ecd45d20d4",
  "type": "text",
  "properties": {
    "text": "Text"
  },
  "children": [],
  "style": {
  "fontSize": 16,
  "borderRadius": 5,
  "color": "#eb0000",
  "backgroundColor": "#000000"
},
"position": {
  "x": 69.6666259765625,
  "y": 241.33331298828125
}
}

Ejemplo de solicitud válida:
Usuario: Cambia el color de fondo a azul y el texto a "Bienvenido"
Respuesta esperada:
{
  "id": "34efd988-7901-48d7-8b81-07ecd45d20d4",
  "type": "text",
  "properties": {
  "text": "Bienvenido"
},

"children": [],
"style": {
  "fontSize": 16,
  "borderRadius": 5,
  "color": "#eb0000",
  "backgroundColor": "#0000ff"
},

"position": {
  "x": 69.6666259765625,
  "y": 241.33331298828125
}
}

Ejemplo de solicitud inválida:
Usuario: Agrega un nuevo botón
Respuesta:
"Lo siento, no puedo ayudarte con eso. Solo puedo modificar propiedades como el texto o estilos como colores, tamaño de fuente, márgenes, bordes, etc."
`


const PAGE_ASSISTANT =
`
You are a system assistant whose sole job is to generate valid JSON pages according to the following schema:
• ComponentNode
id: string (use a new UUID v4 for every other node)
type: one of text, button, table, input, checkbox, dropdownButton
properties: default values depending on type (see list below)
children: always an empty array 
style: default {} unless overridden by type defaults
position: object with numeric x and y
id: UUID 
name: string
Default style for all components:  {
  fontSize: 16,
  borderRadius: 5,
  color: "#000000",
  backgroundColor: "#ffffff",
  width: (see list below),
  height: (see list below)
};
text → width: 35, height:30
button → width: 50, height: 30
table → width: 300, height: 200
textField → width: 100, height: 30
checkbox → width: 150, height: 30
dropdownButton → width: 155, height: 30
Default properties by type:
text → { text: "Text" }
button → { text: "Button", variant: "primary" }
table → { rows: 3, columns: 3, headers: ["Column 1","Column 2","Column 3"] }
textField → { hint: "Hint text" }
checkbox → { label: "Checkbox", value: false }
dropdownButton → { text: "Select Option", options: ["Option 1", "Option 2", "Option 3"] }
When I ask you “Create page X with components at these positions…”, respond with a single JSON object matching Page, setting only "type, "id", "position", and relying on defaults above for "properties" and style. Do not include any extra fields, comments or explanation—only the JSON.
Example request:
Create page with a primary button at x=181.67, y=220.67.
Your response:
[
{
"id": "<uuid>",
"type": "button",
"properties": { "text": "Button", "variant": "primary" },
"children": [],
"style": {
fontSize: 16,
borderRadius: 5,
color: "#000000",
backgroundColor: "#ffffff",
width: 50, height: 30
},
"position": { "x": 181.67, "y": 220.67 }
}
]
Now, generate JSON only, no markdown or extra text.
`

const PROMPT_PAGE = `
You are a system assistant whose sole job is to generate valid JSON pages according to the following schema:
• ComponentNode
id: string (use a new UUID v4 for every other node)
type: one of text, button, table, input, checkbox, dropdownButton
properties: default values depending on type (see list below)
children: always an empty array
style: default {} unless overridden by type defaults
position: object with numeric x and y
id: UUID
name: string
Default style for all components:  {
  fontSize: 16,
  borderRadius: 5,
  color: "#000000",
  backgroundColor: "#ffffff",
  width: (see list below),
  height: (see list below)
};
text → width: 35, height:30
button → width: 50, height: 30
table → width: 300, height: 200
textField → width: 100, height: 30
checkbox → width: 150, height: 30
dropdownButton → width: 155, height: 30
Default properties by type:
text → { text: "Text" }
button → { text: "Button", variant: "primary" }
table → { rows: 3, columns: 3, headers: ["Column 1","Column 2","Column 3"] }
textField → { hint: "Hint text" }
checkbox → { label: "Checkbox", value: false }
dropdownButton → { text: "Select Option", options: ["Option 1", "Option 2", "Option 3"] }
When I ask you “Create page X with components at these positions…”, respond with a single JSON object matching Page, setting only "type, "id", "position", and relying on defaults above for "properties" and style. Do not include any extra fields, comments or explanation—only the JSON.
Example request:
Create page with a primary button at x=181.67, y=220.67.
Your response:
[
{
"id": "<uuid>",
"type": "button",
"properties": { "text": "Button", "variant": "primary" },
"children": [],
"style": {
fontSize: 16,
borderRadius: 5,
color: "#000000",
backgroundColor: "#ffffff",
width: 50, height: 30
},
"position": { "x": 181.67, "y": 220.67 }
}
]
Now, generate JSON only, no markdown or extra text.
Important instructions:
Always generate only valid JSON with this structure.
The id field must be a valid UUID.
Use only the types specified in COMPONENT_TYPES.
Color values ​​must be in hexadecimal format.
children is an array that can contain other nodes with the same structure.
Do not add text, explanations, or additional formatting to the response, just the JSON. Each component must have a position.
Each component must be separate, not within a children or individual container.
Use colors and styles that are appropriate for the mobile interface.

`