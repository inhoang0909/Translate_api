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
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in Qwen response");
    return JSON.parse(match[0]);
  } catch (e) {
    console.error(" Failed to parse Qwen response:", raw);
    throw e;
  }
}

function getClientIdFromIp(ip = "") {
  return ip.replace(/^::ffff:/, "") || "unknown";
}

export default async function translateMultipleLangsOneRequest(text, targetLangs = [], ip = "") {
  if (!targetLangs || targetLangs.length === 0) {
    targetLangs = ["vi", "en", "zh-tw"];
  }

  const clientId = getClientIdFromIp(ip);
  const targetLangsFull = targetLangs.map((lang) => LANGUAGE_MAP[lang] || lang);

  const systemPrompt = `
Translate the input.
- Detect source language.
- Translate into: ${targetLangsFull.join(", ")}.
- Use "zh-tw" for Traditional Chinese.
- Output only JSON: {source_language, original_text, translation:{<lang_code>: <text>}}
- Translations must be accurate, natural, fluent.
`;

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

    const fallback = {
      source_language: "",
      original_text: text,
      translation: targetLangs.reduce((acc, lang) => {
        acc[lang] = null;
        return acc;
      }, {})
    };

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
