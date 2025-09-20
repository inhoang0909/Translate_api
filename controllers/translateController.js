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
  const { text, targetLangs } = req.body;
  const rawIp =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const ip = rawIp.replace(/^::ffff:/, "");

  if (!text) {
    return res.status(400).json({ error: "Missing 'text'." });
  }

  if (!Array.isArray(targetLangs) || targetLangs.length === 0) {
    return res
      .status(400)
      .json({ error: "Missing or invalid 'targetLangs' array." });
  }

  try {
    logger.log("Incoming translation request", { text, targetLangs, ip });

    const result = await withTimeout(
      translateMultipleLangsOneRequest(text, targetLangs, ip),
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
