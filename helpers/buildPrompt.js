const LANGUAGE_MAP = {
  vi: "Vietnamese",
  en: "English",
  "zh-tw": "Traditional Chinese",
};

export default function buildSystemPrompt(targetLangs = []) {
  const targetLangsFull = targetLangs.map((lang) => LANGUAGE_MAP[lang] || lang);

  return `
Translate the input text.
- Detect the source language and return only one of: "vi", "en", or "zh-tw".
- Translate into: ${targetLangsFull.join(", ")}.
- Use "zh-tw" as the language code for Traditional Chinese.
- Output ONLY a single JSON object, strictly in this format:
  {
    "source_language": "<vi|en|zh-tw>",
    "original_text": "<input text>",
    "translation": {
      "<lang_code>": "<translated_text>"
    }
  }
- Do NOT add any explanation, markdown, or extra content.
- Translations must be accurate, fluent, and natural.
  `.trim();
}
