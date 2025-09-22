import { translateWithQwen } from "./qwenService.js";
import Translation from "../models/Translation.js";
import logger from "./loggerService.js";
import buildSystemPrompt from "../helpers/buildPrompt.js";
import parseQwenResponse from "../helpers/parseResponse.js";
import buildFallback from "../helpers/buildFallback.js";

function getClientIdFromIp(ip = "") {
  return ip.replace(/^::ffff:/, "") || "unknown";
}

export default async function translateMultipleLangsOneRequest(text, targetLangs = [], ip = "") {
  if (!targetLangs || targetLangs.length === 0) {
    targetLangs = ["vi", "en", "zh-tw"];
  }

  const clientId = getClientIdFromIp(ip);
  const systemPrompt = buildSystemPrompt(targetLangs);

  try {
    const raw = await translateWithQwen(text, systemPrompt, clientId);
    const result = parseQwenResponse(raw);

    await Translation.create({
      original: text,
      detected: result.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(result.translation),
      ip
    });

    logger.log("Saved translation", {
      original: text,
      detected: result.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(result.translation),
      ip
    });

    return result;
  } catch (err) {
    console.error("Translation failed:", err.message);

    const fallback = buildFallback(text, targetLangs);

    await Translation.create({
      original: text,
      detected: fallback.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(fallback.translation),
      ip
    });

    return fallback;
  }
}
