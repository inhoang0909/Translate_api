import axios from "axios";
import {
  QwenTimeoutError,
  QwenResponseError,
} from "../error/qwenError.js";

import {
  handleSpamRequest,
  cleanupRequest,
} from "./spamHandler.js";

import {
  getAvailableApiIndex,
  markApiBusy,
  markApiFree,
  getApiUrl,
} from "./apiManager.js";

const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen3:8b";
const TIMEOUT_MS = 5000;
const SPAM_THRESHOLD_MS = 4000;

export async function translateWithQwen(prompt, systemPrompt, clientId = "default") {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  handleSpamRequest(clientId, controller, SPAM_THRESHOLD_MS);

  const payload = {
    model: OLLAMA_MODEL,
    prompt,
    system: systemPrompt,
    stream: false,
    format: "json",
    num_predict: 512,
    repeat_penalty: 1.5,
    presence_penalty: 2.0,
    top_p: 0.7,
    repeat_last_n: 128,
  };

  const apiIndex = getAvailableApiIndex();
  if (apiIndex === -1) {
    clearTimeout(timeout);
    cleanupRequest(clientId, controller);
    throw new Error("All Ollama APIs are busy, please try again later.");
  }

  markApiBusy(apiIndex, clientId, OLLAMA_MODEL);

  try {
    const response = await axios.post(getApiUrl(apiIndex), payload, {
      signal: controller.signal,
    });

    clearTimeout(timeout);
    cleanupRequest(clientId, controller);

    const result = response.data?.response?.trim();
    if (!result) {
      throw new QwenResponseError("Empty or invalid model response", 500);
    }

    let parsed;
    try {
      parsed = JSON.parse(result);
    } catch (err) {
      throw new QwenResponseError("Malformed JSON from model", 500);
    }

    if (!parsed.translation) {
      throw new QwenResponseError("Missing translation field", 500);
    }

    return result;
  } catch (err) {
    clearTimeout(timeout);
    cleanupRequest(clientId, controller);

    if (err.name === "AbortError") {
      console.warn(`[QwenService] Request from ${clientId} was aborted or timed out.`);
      throw new QwenTimeoutError("Request aborted or timed out", 408);
    }

    console.error(`[QwenService] Request failed for ${clientId}:`, err.message);
    throw err;
  } finally {
    markApiFree(apiIndex);
  }
}
