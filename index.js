import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import sequelize from "./config/db.js";
import requestLoggerMiddleware from "./middleware/requestLoggerMiddleware.js";
import routes from "./routes/index.js";
import "./models/VocabularyCategory.js"; 

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(requestLoggerMiddleware);

app.use("/", routes )

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = process.env.PORT || 5600;

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected");

    await sequelize.sync({ alter: true }); 
    console.log("Models synced (tables created/updated)");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at http://0.0.0.0:${PORT}`);
      console.log(`Swagger docs at http://0.0.0.0:${PORT}/api-docs`);
    });
  } catch (err) {
    console.error(" Database connection failed:", err);
    process.exit(1); 
  }
})();
