export default function parseQwenResponse(raw) {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in Qwen response");

    const parsed = JSON.parse(match[0]);

    const allowedKeys = ["source_language", "original_text", "translation"];
    const cleaned = Object.fromEntries(
      allowedKeys.map((key) => [key, parsed[key]]).filter(([_, v]) => v !== undefined)
    );

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
