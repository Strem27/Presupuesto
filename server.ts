import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Priority list of models for fallback
const MODELS = [
  "gemini-3.5-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite"
];

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

const registerExpenseFn: FunctionDeclaration = {
  name: "registerExpense",
  parameters: {
    type: Type.OBJECT,
    description: "Registra un nuevo gasto en la aplicación.",
    properties: {
      amount: {
        type: Type.NUMBER,
        description: "El monto del gasto (número positivo).",
      },
      date: {
        type: Type.STRING,
        description: "La fecha del gasto en formato YYYY-MM-DD.",
      },
      description: {
        type: Type.STRING,
        description: "Una breve descripción del gasto.",
      },
      category: {
        type: Type.STRING,
        description: "La categoría del gasto (ej: Alimentación, Transporte, Entretenimiento, Salud, Educación, Servicios, Hogar, Otros).",
      },
    },
    required: ["amount", "date", "description", "category"],
  },
};

app.post("/api/chat", async (req, res) => {
  const { messages, context } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages are required" });
  }

  const { userName, currentDate, availableBalance } = context || {};

  const systemInstruction = `Eres un asistente financiero experto, breve y amable llamado "Asistente de Mi Presupuesto". 
Ayudas a los usuarios a registrar sus gastos.
Contexto Actual:
- Fecha: ${currentDate || new Date().toISOString().split('T')[0]}
- Usuario: ${userName || 'Usuario'}
- Saldo Disponible: $${availableBalance?.toLocaleString('es-CO') || '0'}

Reglas:
1. Cuando el usuario mencione un gasto (vía texto, imagen o audio), usa la función registerExpense para guardarlo una vez confirmados los datos.
2. IMAGEN (ticket, recibo, captura): Extrae monto, fecha y descripción. Si los datos son dudosos o la imagen es borrosa, pregunta antes de guardar. NO inventes información.
3. AUDIO (nota de voz): Transcríbelo y extrae monto, fecha y descripción. Si falta información, solicita aclaración. NO inventes información.
4. VALIDACIÓN: Si el archivo o mensaje no tiene que ver con gastos o finanzas de "Mi Presupuesto", indica que no puedes procesarlo.
5. CONFIRMACIÓN: Al finalizar un registro, dirígete al usuario por su nombre (ej: "¡Listo, ${userName || 'amigo'}! He guardado tu gasto").
6. CONSULTAS: Para consultas de compras, compara el gasto solicitado con el saldo disponible proporcionado en el contexto.
`;

  // Map messages to Gemini format
  const contents = messages.map(msg => {
    const parts: any[] = [];
    
    if (msg.content) {
      parts.push({ text: msg.content });
    }

    if (msg.attachments && msg.attachments.length > 0) {
      msg.attachments.forEach((att: any) => {
        parts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }

    // Ensure at least one part exists
    if (parts.length === 0) {
      parts.push({ text: "" });
    }

    return {
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts
    };
  });

  let lastError: any = null;

  for (const modelName of MODELS) {
    try {
      console.log(`Attempting with model: ${modelName}`);
      
      const response = await ai.models.generateContent({
        model: modelName,
        contents,
        config: {
          systemInstruction,
          tools: [{ functionDeclarations: [registerExpenseFn] }],
        }
      });

      return res.json({
        text: response.text || "",
        functionCalls: response.functionCalls || [],
        modelUsed: modelName
      });

    } catch (error: any) {
      lastError = error;
      const statusCode = error.status || error.statusCode || 500;
      console.error(`Error with model ${modelName} (Status ${statusCode}):`, error);

      // If it's a quote limit (429) or high demand (503) or not found (404), try next model
      if ([429, 503, 404].includes(statusCode)) {
        continue;
      }

      // For other errors, break and return
      break;
    }
  }

  // If we reach here, all models failed or a non-recoverable error occurred
  const finalStatus = lastError?.status || lastError?.statusCode || 500;
  res.status(finalStatus).json({ 
    error: lastError?.message || "Internal Server Error",
    details: lastError
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
