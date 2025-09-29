import { translateWithQwen } from "./qwenService.js";
import Translation from "../models/Translation.js";
import logger from "./loggerService.js";
import buildSystemPrompt from "../helpers/buildPrompt.js";
import parseQwenResponse from "../helpers/parseResponse.js";
import buildFallback from "../helpers/buildFallback.js";


export default async function translateMultipleLangsOneRequest(text, targetLangs = [], model, source) {
  if (!targetLangs || targetLangs.length === 0) {
    targetLangs = ["vi", "en", "zh-tw"];
  }

  const systemPrompt = buildSystemPrompt(targetLangs);

  try {
    const raw = await translateWithQwen(text, systemPrompt, model, source);
    const result = parseQwenResponse(raw);

    await Translation.create({
      original: text,
      detected: result.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(result.translation),
      source,
      model
    });

    logger.log("Saved translation", {
      original: text,
      detected: result.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(result.translation),
      source,
      model
    });

    return {
      success: true,
      message: "Translation successful",
      data: {
        ...result,
        model,
        source
      }
    };
  } catch (err) {
    console.error("Translation failed:", err.message);

    const fallback = buildFallback(text, targetLangs);

    await Translation.create({
      original: text,
      detected: fallback.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(fallback.translation),
      source,
      model
    });

    return {
      success: false,
      message: "Translation failed, fallback result returned",
      data: {
        ...fallback,
        model,
        source
      },
    };
  }
}