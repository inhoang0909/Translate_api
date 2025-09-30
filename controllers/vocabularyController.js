import Vocabulary from "../models/Vocabulary.js";
import Category from "../models/Category.js";
import VocabularyTranslation from "../models/VocabularyTranslation.js";

export const addVocabulary = async (req, res) => {
  try {
    const { categories, translations } = req.body;

    // 1. Tạo Vocabulary rỗng (nếu bạn muốn thêm field khác có thể bổ sung ở schema)
    const vocabulary = await Vocabulary.create({});

    // 2. Gắn categories (một hoặc nhiều)
    if (categories && categories.length > 0) {
      const foundCategories = await Category.findAll({
        where: { id: categories },
      });
      await vocabulary.addCategories(foundCategories);
    }

    // 3. Nếu có translations thì thêm vào
    if (translations && translations.length > 0) {
      for (const t of translations) {
        await VocabularyTranslation.create({
          vocabularyId: vocabulary.id,
          language: t.language,
          text: t.text,
          description: t.description || null,
        });
      }
    }

    return res.status(201).json({
      message: "Vocabulary created successfully",
      vocabularyId: vocabulary.id,
    });
  } catch (error) {
    console.error("Error creating vocabulary:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
