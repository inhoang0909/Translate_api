import { translateNormal, translateWithRAG } from "../services/translateService.js";
import logger from "../services/loggerService.js";
import { convertModelFormat } from "../helpers/modelMapper.js";

function withTimeout(promise, timeoutMs = 30000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timed out")), timeoutMs)
    ),
  ]);
}

// Normal translation controller
export async function translateController(req, res) {
  const { text, targetLangs, model, source } = req.body;

  const allowedModels = ["qwen3-8b", "qwen3-14b", "qwen3-32b"];

  if (!text) {
    return res.status(400).json({
      success: false,
      message: "Missing 'text'.",
      data: null
    });
  }

  if (!Array.isArray(targetLangs) || targetLangs.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'targetLangs' array.",
      data: null
    });
  }

  if (model && !allowedModels.includes(model)) {
    return res.status(400).json({
      success: false,
      message: `Invalid model '${model}'. Allowed models are: ${allowedModels.join(", ")}`,
      data: null
    });
  }

  const selectedModel = model || "qwen3-8b";
  const ollamaModel = convertModelFormat(selectedModel);

  try {
    logger.log("Normal translation request", {
      text,
      targetLangs,
      source,
      model: selectedModel,
      ollamaModel
    });

    const result = await withTimeout(
      translateNormal(text, targetLangs, ollamaModel, source),
      60000
    );

    return res.json(result);
  } catch (err) {
    logger.error("Normal translation failed", { error: err.message });

    if (err.message.includes("timed out")) {
      return res.status(504).json({
        success: false,
        message: "Translation request timed out",
        data: null
      });
    }

    return res.status(502).json({
      success: false,
      message: "Translation failed",
      data: null,
      details: err.message,
    });
  }
}

// RAG translation controller
export async function translateRAGController(req, res) {
  const { text, targetLangs, model, source, categories } = req.body;

  const allowedModels = ["qwen3-8b", "qwen3-14b", "qwen3-32b"];

  if (!text) {
    return res.status(400).json({
      success: false,
      message: "Missing 'text'.",
      data: null
    });
  }

  if (!Array.isArray(targetLangs) || targetLangs.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'targetLangs' array.",
      data: null
    });
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Missing or invalid 'categories' array. Categories are required for RAG translation.",
      data: null
    });
  }

  if (model && !allowedModels.includes(model)) {
    return res.status(400).json({
      success: false,
      message: `Invalid model '${model}'. Allowed models are: ${allowedModels.join(", ")}`,
      data: null
    });
  }

  const selectedModel = model || "qwen3-8b";
  const ollamaModel = convertModelFormat(selectedModel); // Convert to qwen3:8b

  try {
    logger.log("RAG translation request", {
      text,
      targetLangs,
      source,
      model: selectedModel,
      ollamaModel,
      categories
    });

    const result = await withTimeout(
      translateWithRAG(text, targetLangs, ollamaModel, source, categories),
      60000
    );

    return res.json(result);
  } catch (err) {
    logger.error("RAG translation failed", { error: err.message });

    if (err.message.includes("timed out")) {
      return res.status(504).json({
        success: false,
        message: "RAG translation request timed out",
        data: null
      });
    }

    return res.status(502).json({
      success: false,
      message: "RAG translation failed",
      data: null,
      details: err.message,
    });
  }
}
