import { translateWithQwen } from "./qwenService.js";
import Translation from "../models/Translation.js";
import logger from "./loggerService.js";
import buildSystemPrompt from "../helpers/buildPrompt.js";
import buildCategoryPrompt from "../helpers/buildCategoryPrompt.js";
import parseQwenResponse from "../helpers/parseResponse.js";
import buildFallback from "../helpers/buildFallback.js";

export async function translateNormal(text, targetLangs = [], model, source) {
  console.log("[TranslateService] ===== NORMAL TRANSLATION START =====");
  console.log("[TranslateService] Input:", { text, targetLangs, model, source });

  if (!targetLangs || targetLangs.length === 0) {
    targetLangs = ["vi", "en", "zh-tw"];
  }

  const systemPrompt = buildSystemPrompt(targetLangs);
  console.log("[TranslateService] System prompt:", systemPrompt);

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

    logger.log("Saved translation (normal)", {
      original: text,
      detected: result.source_language,
      targetLang: targetLangs.join(","),
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
    console.error("[TranslateService] Normal translation failed:", err.message);

    const fallback = buildFallback(text, targetLangs);

    await Translation.create({
      original: text,
      detected: fallback.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(fallback.translation),
      source,
      model: "fallback"
    });

    return {
      success: false,
      message: "Translation failed, fallback result returned",
      data: {
        ...fallback,
        model,
        source
      }
    };
  }
}

// RAG-enhanced translation with categories
export async function translateWithRAG(text, targetLangs = [], model, source, categoryNames = []) {
  console.log("[TranslateService] ===== RAG TRANSLATION START =====");
  console.log("[TranslateService] Input:", { text, targetLangs, model, source, categoryNames });

  if (!targetLangs || targetLangs.length === 0) {
    targetLangs = ["vi", "en", "zh-tw"];
  }

  if (!categoryNames || categoryNames.length === 0) {
    return {
      success: false,
      message: "Categories are required for RAG translation",
      data: null
    };
  }

  const systemPrompt = await buildCategoryPrompt(text, targetLangs, categoryNames);
  console.log("[TranslateService] RAG system prompt:", systemPrompt);

  try {
    const raw = await translateWithQwen(text, systemPrompt, model, source);
    const result = parseQwenResponse(raw);

    await Translation.create({
      original: text,
      detected: result.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(result.translation),
      source,
      model,
      categories: categoryNames.join(",")
    });

    logger.log("Saved translation (RAG)", {
      original: text,
      detected: result.source_language,
      targetLang: targetLangs.join(","),
      source,
      model,
      categories: categoryNames,
      ragUsed: true
    });

    return {
      success: true,
      message: "RAG translation successful",
      data: {
        ...result,
        model,
        source,
        ragUsed: true,
        categories: categoryNames
      }
    };
  } catch (err) {
    console.error("[TranslateService] RAG translation failed:", err.message);

    const fallback = buildFallback(text, targetLangs);

    await Translation.create({
      original: text,
      detected: fallback.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(fallback.translation),
      source,
      model: "fallback",
      categories: categoryNames.join(",")
    });

    return {
      success: false,
      message: "RAG translation failed, fallback result returned",
      data: {
        ...fallback,
        model,
        source,
        ragUsed: false,
        categories: categoryNames
      }
    };
  }
}
