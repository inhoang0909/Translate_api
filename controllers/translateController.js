import translateMultipleLangsOneRequest from "../services/translateService.js";
import logger from "../services/loggerService.js";

function withTimeout(promise, timeoutMs = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
    ),
  ]);
}

export async function translateController(req, res) {
  const { text, targetLangs, model, source } = req.body;


  const allowedModels = ["qwen3-8b", "gemma3-12b", "qwen3-32b"];

  if (!text) {
    return res.status(400).json({ error: "Missing 'text'." });
  }

  if (!Array.isArray(targetLangs) || targetLangs.length === 0) {
    return res
      .status(400)
      .json({ error: "Missing or invalid 'targetLangs' array." });
  }

  if (model && !allowedModels.includes(model)) {
    return res.status(400).json({
      error: `Invalid model '${model}'. Allowed models are: ${allowedModels.join(", ")}`
    });
  }

  const selectedModel = model || "qwen3-8b";

  try {
    logger.log("Incoming translation request", {
      text,
      targetLangs,
      source,
      model: selectedModel
    });

    const result = await withTimeout(
      translateMultipleLangsOneRequest(text, targetLangs, selectedModel, source),
      60000
    );

    res.json(result);
  } catch (err) {
    logger.error("Translation failed", { error: err.message });

    if (err.message.includes("timed out")) {
      return res.status(504).json({ error: "Translation request timed out" });
    }

    return res.status(502).json({
      error: "Multi-translation failed",
      details: err.message,
    });
  }
}
