import Translation from "../models/Translation.js";
import logger from "./loggerService.js";
import buildFallback from "../helpers/buildFallback.js";
import { translateWithMlx } from "./mlxService.js";

function getClientIdFromIp(ip = "") {
  return ip.replace(/^::ffff:/, "") || "unknown";
}

export default async function translateMultipleLangsOneRequest(
  text,
  targetLangs = [],
  ip = "",
  model = "qwen3-8b" 
) {
  if (!targetLangs || targetLangs.length === 0) {
    targetLangs = ["vi", "en", "zh-tw"];
  }

  const clientId = ip.replace(/^::ffff:/, "") || "unknown";

  try {
    const result = await translateWithMlx(text, targetLangs, model);

    await Translation.create({
      original: text,
      detected: result.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(result.translations),
      ip: clientId,
      model 
    });

    logger.log("Saved translation", {
      original: text,
      detected: result.source_language,
      targetLang: targetLangs.join(","),
      translatedText: JSON.stringify(result.translations),
      ip: clientId,
      model
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
      ip: clientId,
      model
    });

    return fallback;
  }
}

