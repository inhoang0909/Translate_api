import { queueOrExecuteRequest } from "./apiManager.js";
import {
  QwenTimeoutError,
  QwenResponseError,
} from "../error/qwenError.js";

import {
  handleSpamRequest,
  cleanupRequest,
} from "./spamHandler.js";

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";
const TIMEOUT_MS = 30000;
const SPAM_THRESHOLD_MS = 28000;

export async function translateWithQwen(
  prompt,
  systemPrompt,
  model = OLLAMA_MODEL,
  clientId = "default"
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  handleSpamRequest(clientId, controller, SPAM_THRESHOLD_MS);

  const body = {
    model: model, // Use the parameter, not OLLAMA_MODEL
    prompt,
    system: systemPrompt,
    stream: false,
    format: "json",
    num_predict: 512,
    repeat_penalty: 1.5,
    presence_penalty: 2.0,
    top_p: 0.7,
    repeat_last_n: 128,
    temperature: 0,
  };

  const payload = {
    body,
    model: model, // Use the parameter, not OLLAMA_MODEL
    clientId,
    signal: controller.signal,
  };
  
  console.log("[QwenService] Full payload:", JSON.stringify(payload, null, 2));

  try {
    const result = await queueOrExecuteRequest(payload);
    
    console.log("[QwenService] Raw result:", result);

    clearTimeout(timeout);
    cleanupRequest(clientId, controller);

    if (!result) {
      throw new QwenResponseError("Empty or invalid model response", 500);
    }

    let parsed;
    try {
      parsed = JSON.parse(result);
      console.log("[QwenService] Parsed result:", parsed);
    } catch (err) {
      console.error("[QwenService] JSON parse error:", err.message);
      throw new QwenResponseError("Malformed JSON from model", 500);
    }

    if (!parsed.translation) {
      console.error("[QwenService] Missing translation field in:", parsed);
      throw new QwenResponseError("Missing translation field", 500);
    }

    console.log("[QwenService] ===== TRANSLATION REQUEST SUCCESS =====");
    return result;

  } catch (err) {
    clearTimeout(timeout);
    cleanupRequest(clientId, controller);

    console.error("[QwenService] ===== TRANSLATION REQUEST FAILED =====");
    console.error("[QwenService] Error details:", {
      name: err.name,
      message: err.message,
      stack: err.stack
    });

    if (err.name === "AbortError") {
      console.warn(`[QwenService] Request from ${clientId} was aborted or timed out.`);
      throw new QwenTimeoutError("Request aborted or timed out", 408);
    }

    console.error(`[QwenService] Request failed for ${clientId}:`, err.message);
    throw err;
  }
}
