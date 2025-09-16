import { translateWithQwen } from "./qwenService.js";
import Translation from "../models/Translation.js";
import logger from "./loggerService.js";

const LANGUAGE_MAP = {
  vi: "Vietnamese",
  en: "English",
  "zh-tw": "Traditional Chinese"
};

function parseQwenResponse(raw) {
  try {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in Qwen response");
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("Failed to parse response:", raw);
    throw e;
  }
}

async function translateMultipleLangsOneRequest(text, targetLangs = [], ip = "") {
  if (!targetLangs || targetLangs.length === 0) {
    targetLangs = ["vi", "en", "zh-tw"];
  }

  const targetLangsFull = targetLangs.map((lang) => LANGUAGE_MAP[lang] || lang);
  const systemPrompt = `
You are a translation assistant at Cansports Vietnam.
Your tasks:
1. Detect the source language.
2. Translate the given text into the following languages: ${targetLangsFull.join(", ")}.
3. Output MUST be valid JSON with exactly these keys: "source_language", "original_text", and "translation".
Return ONLY valid JSON. Do NOT include any explanation, formatting, markdown, or extra fields.
Format:
{
  "source_language": "<source language code>",
  "original_text": "<input text>",
  "translation": {
    "<lang_code>": "<translation>"
  }
}
`;

  const prompt = `${text}`;

  try {
    const raw = await translateWithQwen(prompt, systemPrompt);
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
      targetLangs: targetLangs,
      translation: result.translation,
      ip
    });

    return result;
  } catch (err) {
    console.error("Multi-translation failed:", err.message);
    logger.error("Multi-translation failed", err);

    const errorResult = {
      source_language: "",
      original_text: text,
      translation: targetLangs.reduce((acc, lang) => {
        acc[lang] = null;
        return acc;
      }, {}),
    };

    await Translation.create({
      original: text,
      detected: errorResult.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(errorResult.translation),
      ip
    });

    return errorResult;
  }
}

export default translateMultipleLangsOneRequest;
