const COHERE_API_KEY = process.env.COHERE_API_KEY!;
const OLLAMA_API_URL = "http://localhost:11434/api/chat";

interface GenerateOptions {
  provider: "cohere" | "ollama-mistral";
  system: string;
  prompt: string;
  temperature?: number;
}

export async function generateSessionJSON({
  provider,
  system,
  prompt,
  temperature = 0.3,
}: GenerateOptions): Promise<string> {
  if (provider === "cohere") {
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus",
        temperature,
        message: prompt,
        chat_history: [],
        prompt_truncation: "auto",
        connectors: [],
        preamble: system,
      }),
    });

    const json = await response.json();
    if (!response.ok || !json.text) {
      console.error("❌ Error en Cohere:", json);
      throw new Error("Error en la respuesta de Cohere.");
    }

    return json.text.trim();
  }

  if (provider === "ollama-mistral") {
    const response = await fetch(OLLAMA_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        temperature,
        stream: false,
      }),
    });

    const json = await response.json();
    if (!response.ok || !json.message?.content) {
      console.error("❌ Error en Ollama:", json);
      throw new Error("Error en la respuesta de Ollama.");
    }

    return json.message.content.trim();
  }

  throw new Error("Proveedor no soportado");
}
