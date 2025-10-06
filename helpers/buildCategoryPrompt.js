import Vocabulary from "../models/Vocabulary.js";
import VocabularyTranslation from "../models/VocabularyTranslation.js";
import Category from "../models/Category.js";

/**
 * Normalize multilingual text
 */
function normalize(t = "") {
  const cleaned = t.replace(/[^\p{L}\p{N}\s]/gu, "").trim();
  return /[\u4e00-\u9fa5]/.test(cleaned) ? cleaned : cleaned.toLowerCase();
}

/**
 * Detect source language
 */
function detectSourceLanguage(text) {
  if (/[\u4e00-\u9fa5]/.test(text)) return "zh-tw";
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) return "vi";
  return "en";
}

/**
 * Calculate relevance score for term matching
 */
function calcScore(inputText, vocabText) {
  const input = normalize(inputText);
  const vocab = normalize(vocabText);
  if (!input || !vocab) return 0;
  if (input === vocab) return 100;

  if (/[\u4e00-\u9fa5]/.test(vocab)) {
    const inputChars = Array.from(input);
    const vocabChars = Array.from(vocab);
    
    // Exact substring match
    if (input.includes(vocab)) return 90;
    if (vocab.includes(input)) return 85;
    
    // Character overlap
    const overlap = vocabChars.filter(c => inputChars.includes(c)).length;
    return Math.min(100, (overlap / vocabChars.length) * 80);
  }

  // English/Vietnamese matching
  if (vocab.includes(input) || input.includes(vocab)) return 70;
  
  // Word-level matching
  const inputWords = input.split(/\s+/);
  const vocabWords = vocab.split(/\s+/);
  const matchingWords = inputWords.filter(iw => vocabWords.some(vw => vw.includes(iw) || iw.includes(vw)));
  
  if (matchingWords.length > 0) {
    return (matchingWords.length / Math.max(inputWords.length, vocabWords.length)) * 60;
  }
  
  return 0;
}

/**
 * Retrieve top 5 most relevant vocab items
 */
async function getRelevantVocab(text, categoryNames = [], targetLangs = ["en"], maxResults = 5) {
  const includeCategory = {
    model: Category,
    as: "Categories",
    where: categoryNames.length > 0 ? { name: categoryNames } : undefined,
    through: { attributes: [] },
  };

  const vocabularies = await Vocabulary.findAll({
    include: [
      {
        model: VocabularyTranslation,
        attributes: ["language", "text"],
        where: { language: ["en", "vi", "zh-tw"] },
      },
      includeCategory,
    ],
    limit: 100, // Fetch more to score better
  });

  const scored = vocabularies.map((v) => {
    let maxScore = 0;
    let bestMatch = null;
    
    for (const t of v.VocabularyTranslations) {
      const s = calcScore(text, t.text);
      if (s > maxScore) {
        maxScore = s;
        bestMatch = { lang: t.language, text: t.text };
      }
    }
    return { vocab: v, score: maxScore, bestMatch };
  });

  // Filter out low scores and get top 5
  const filtered = scored
    .filter(s => s.score > 20) // Only keep relevance > 20%
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  console.log(`[buildCategoryPrompt] TOP ${filtered.length} terms (scores):`, 
    filtered.map(s => ({ 
      score: s.score.toFixed(1), 
      match: s.bestMatch?.text?.substring(0, 30) 
    }))
  );

  return filtered.map((s) => s.vocab);
}

/**
 * Build dynamic examples based on target language
 */
function buildExamples(vocabs, targetLangs) {
  const examples = [];
  
  // Get first vocab with all translations
  const firstVocab = vocabs.find(v => {
    const map = {};
    v.VocabularyTranslations.forEach(t => map[t.language] = t.text);
    return map.en && map.vi && map["zh-tw"];
  });

  if (!firstVocab) {
    return [
      "Input: 鞋眼織帶的沖子直徑必須為4毫米。",
      'Output: {"source_language":"zh-tw","translation":{"en":"The punch hole diameter of the eyestay webbing must be 4 millimeters."}}'
    ];
  }

  const map = {};
  firstVocab.VocabularyTranslations.forEach(t => map[t.language] = t.text);

  // Build examples for each target language
  targetLangs.forEach(targetLang => {
    if (targetLang === "en") {
      examples.push(`ZH→EN: "${map["zh-tw"]}" → {"source_language":"zh-tw","translation":{"en":"${map.en}"}}`);
      examples.push(`VI→EN: "${map.vi}" → {"source_language":"vi","translation":{"en":"${map.en}"}}`);
    } else if (targetLang === "vi") {
      examples.push(`EN→VI: "${map.en}" → {"source_language":"en","translation":{"vi":"${map.vi}"}}`);
      examples.push(`ZH→VI: "${map["zh-tw"]}" → {"source_language":"zh-tw","translation":{"vi":"${map.vi}"}}`);
    } else if (targetLang === "zh-tw") {
      examples.push(`EN→ZH: "${map.en}" → {"source_language":"en","translation":{"zh-tw":"${map["zh-tw"]}"}}`);
      examples.push(`VI→ZH: "${map.vi}" → {"source_language":"vi","translation":{"zh-tw":"${map["zh-tw"]}"}}`);
    }
  });

  return examples;
}

/**
 * Build RAG system prompt with TOP 5 most similar terms
 */
export default async function buildCategoryPrompt(
  text,
  targetLangs = ["en"],
  categoryNames = [],
  maxVocabItems = 5
) {
  const vocabs = await getRelevantVocab(text, categoryNames, targetLangs, maxVocabItems);
  const detectedLang = detectSourceLanguage(text);

  // Build TERMS section (bidirectional for all languages)
  let termLines = [];
  let termIndex = 1;
  vocabs.forEach((v) => {
    const map = {};
    v.VocabularyTranslations.forEach((t) => (map[t.language] = t.text));
    
    // Show all available mappings
    if (map.en || map.vi || map["zh-tw"]) {
      const parts = [];
      if (map["zh-tw"]) parts.push(`ZH:"${map["zh-tw"]}"`);
      if (map.vi) parts.push(`VI:"${map.vi}"`);
      if (map.en) parts.push(`EN:"${map.en}"`);
      
      if (parts.length >= 2) {
        termLines.push(`${termIndex}. ${parts.join(" ⟷ ")}`);
        termIndex++;
      }
    }
  });

  const toLangs = targetLangs.map(l => l.toUpperCase()).join(", ");
  const examples = buildExamples(vocabs, targetLangs);

  // Build enhanced system prompt
  const systemPrompt = [
    "### ROLE",
    "You are a multilingual *technical translator*.",
    "",
    "### TASK",
    "1. **Detect source language**: Identify if input is VI, EN, or ZH-TW",
    `2. **Translate to**: ${toLangs}`,
    "3. **Use EXACT terms**: When you find a word/phrase in TERMS below, use the EXACT translation provided",
    "",
    "### TERMS (TOP 5 most similar - bidirectional)",
    termLines.length ? termLines.join("\n") : "None",
    "",
    "### CRITICAL RULES",
    "- If input is ZH-TW (Chinese characters detected) → set source_language to \"zh-tw\"",
    "- If input is VI (Vietnamese diacritics detected) → set source_language to \"vi\"",
    "- If input is EN (Latin alphabet, no diacritics) → set source_language to \"en\"",
    "- Use EXACT term from TERMS list (e.g., ZH:\"沖子\" MUST become EN:\"punch hole diameter\", NOT \"punch\" or \"hole\")",
    "",
    "### FORMAT",
    `Return JSON only:\n{"source_language":"vi|en|zh-tw","translation":{${targetLangs.map((l) => `"${l}":"exact_translation"`).join(",")}}}`,
    "",
    "### EXAMPLES",
    ...examples,
    "",
    "**Remember**: COPY terms from TERMS list exactly, detect source language correctly!"
  ].join("\n");

  console.log(`[buildCategoryPrompt] Detected source: ${detectedLang}, Target: ${toLangs}`);
  console.log(`[buildCategoryPrompt] Selected TOP ${vocabs.length} most relevant terms`);

  return systemPrompt;
}
