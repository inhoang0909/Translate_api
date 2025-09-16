import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Translation = sequelize.define("Translation", {
  original: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  detected: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  targetLang: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  translatedText: {
    type: DataTypes.TEXT, 
    allowNull: false,
  },
  ip: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

export default Translation;
