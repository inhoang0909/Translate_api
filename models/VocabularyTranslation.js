import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Vocabulary from "./Vocabulary.js";

const VocabularyTranslation = sequelize.define("VocabularyTranslation", {
  language: {
    type: DataTypes.STRING,   
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,   
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,     
    allowNull: true,
  }
}, { timestamps: true });

Vocabulary.hasMany(VocabularyTranslation, { foreignKey: "vocabularyId", onDelete: "CASCADE" });
VocabularyTranslation.belongsTo(Vocabulary, { foreignKey: "vocabularyId" });

export default VocabularyTranslation;
