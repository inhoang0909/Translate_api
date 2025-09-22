export default function parseQwenResponse(raw) {
  try {
    const startIndex = raw.indexOf("{");
    const endIndex = raw.lastIndexOf("}");
    if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
      throw new Error("No valid JSON object found in response");
    }

    const jsonStr = raw.slice(startIndex, endIndex + 1);
    const parsed = JSON.parse(jsonStr);

    const allowedKeys = ["source_language", "original_text", "translation"];
    const cleaned = Object.fromEntries(
      allowedKeys.map((key) => [key, parsed[key]]).filter(([_, v]) => v !== undefined)
    );

    if (typeof cleaned.translation === "object" && cleaned.translation !== null) {
      const sanitized = {};
      for (const [lang, text] of Object.entries(cleaned.translation)) {
        if (typeof text === "string") {
          const trimmed = text.trim();
          if (trimmed) sanitized[lang] = trimmed;
        }
      }
      cleaned.translation = sanitized;
    }

    if (
      typeof cleaned.source_language !== "string" ||
      typeof cleaned.original_text !== "string" ||
      typeof cleaned.translation !== "object"
    ) {
      throw new Error("Invalid structure after cleanup");
    }

    return cleaned;
  } catch (e) {
    console.error("❌ Failed to parse Qwen response:", raw);
    throw e;
  }
}
