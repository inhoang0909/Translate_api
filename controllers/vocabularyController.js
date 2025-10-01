import Vocabulary from "../models/Vocabulary.js";
import Category from "../models/Category.js";
import VocabularyTranslation from "../models/VocabularyTranslation.js";

export const addVocabulary = async (req, res) => {
  try {
    const { categories, translations } = req.body;

    if (!Array.isArray(categories) || categories.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Categories are required",
        data: null,
      });
    }

    if (!Array.isArray(translations) || translations.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Translations are required",
        data: null,
      });
    }
    // Create vocabulary entry
    const vocab = await Vocabulary.create();

    // Associate categories
    await vocab.setCategories(categories);

    // Create translations and associate with vocabulary
    for (const t of translations) {
      await VocabularyTranslation.create({
        vocabularyId: vocab.id,
        language: t.language,
        text: t.text,
        description: t.description,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Vocabulary created successfully",
      data: { id: vocab.id },
    });
  } catch (error) {
    console.error("Error creating vocabulary:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const getVocabularyList = async (req, res) => {
  try {
    const vocabularies = await Vocabulary.findAll({
      attributes: ["id"], 
      include: [
        {
          model: VocabularyTranslation,
          attributes: ["language", "text", "description"], 
        },
        {
          model: Category,
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    const formatted = vocabularies.map(v => ({
      id: v.id,
      translations: v.VocabularyTranslations.map(t => ({
        lang: t.language,
        text: t.text,
        desc: t.description,
      })),
      categories: v.Categories.map(c => ({
        id: c.id,
        name: c.name,
      })),
    }));

    return res.json({
      success: true,
      message: "Vocabulary list fetched successfully",
      data: formatted,
    });
  } catch (error) {
    console.error("Error fetching vocabulary list:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const updateVocabulary = async (req, res) => {
  try {
    const { id } = req.params;
    const { categories, translations } = req.body;

    const vocab = await Vocabulary.findByPk(id);
    if (!vocab) {
      return res.status(404).json({
        success: false,
        message: "Vocabulary not found",
        data: null,
      });
    }

    // Update categories if provided
    if (Array.isArray(categories)) {
      await vocab.setCategories(categories);
    }

    // Update translations if provided
    if (Array.isArray(translations)) {
      // Remove old translations
      await VocabularyTranslation.destroy({ where: { vocabularyId: id } });
      // Add new translations
      for (const t of translations) {
        await VocabularyTranslation.create({
          vocabularyId: id,
          language: t.language,
          text: t.text,
          description: t.description,
        });
      }
    }

    return res.json({
      success: true,
      message: "Vocabulary updated successfully",
      data: { id: vocab.id },
    });
  } catch (error) {
    console.error("Error updating vocabulary:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};

export const deleteVocabulary = async (req, res) => {
  try {
    const { id } = req.params;

    const vocab = await Vocabulary.findByPk(id);
    if (!vocab) {
      return res.status(404).json({
        success: false,
        message: "Vocabulary not found",
        data: null,
      });
    }

    // Remove translations
    await VocabularyTranslation.destroy({ where: { vocabularyId: id } });
    // Remove associations with categories
    await vocab.setCategories([]);
    // Delete vocabulary
    await vocab.destroy();

    return res.json({
      success: true,
      message: "Vocabulary deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting vocabulary:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      data: null,
    });
  }
};
