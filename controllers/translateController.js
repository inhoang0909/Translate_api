import translateMultipleLangsOneRequest from "../services/translateService.js";

export async function translateController(req, res) {
  try {
    const { text, targetLangs } = req.body;
    const rawIp = req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ip = rawIp.replace(/^::ffff:/, "");
    if (!text) return res.status(400).json({ error: "Missing 'text'." });
    if (!Array.isArray(targetLangs) || targetLangs.length === 0) {
      return res.status(400).json({ error: "Missing or invalid 'targetLangs' array." });
    }

    const result = await translateMultipleLangsOneRequest(text, targetLangs, ip);
    res.json(result);
  } catch (err) {
    // logger.error("Translation failed", err);
    res.status(500).json({ error: "Multi-translation failed", details: err.message });
  }
}
