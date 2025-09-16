import axios from "axios";

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || "http://10.13.34.181:11434/api/generate"; ;
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";

export async function translateWithQwen(prompt, systemPrompt) {
  try {
    const payload = {
      model: OLLAMA_MODEL,
      prompt: prompt,
      stream: false,
      system: systemPrompt,
      repeat_penalty: 1.5,
      presence_penalty: 2.0,
      top_p: 0.7,
      repeat_last_n: 128,
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
