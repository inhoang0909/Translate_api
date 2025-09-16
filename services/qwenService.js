import axios from "axios";

const OLLAMA_API_URL = process.env.OLLAMA_API_URL;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL;

export async function translateWithQwen(prompt, systemPrompt) {
  try {
    const payload = {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      system: systemPrompt,
      format: "json"
    };
    console.log("[QwenService] Payload to Ollama:", JSON.stringify(payload, null, 2));

    const response = await axios.post(OLLAMA_API_URL, payload);

    if (!response.data || !response.data.response) {
      throw new Error("No response from Ollama");
    }

    return response.data.response.trim();
  } catch (error) {
    console.error("Qwen translation error:", error.message);
    if (error.response) {
      console.error("Ollama API response:", error.response.data);
    }
    throw new Error("Failed to translate with Qwen");
  }
}
