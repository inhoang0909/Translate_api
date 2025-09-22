import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from "./config/swagger.js";
import translateRoutes from "./routes/translateRoutes.js";
import sequelize from "./config/db.js";
import requestLoggerMiddleware  from "./middleware/requestLoggerMiddleware.js";
dotenv.config();


const app = express();
app.use(express.json());
app.use(cors());
app.use(requestLoggerMiddleware);
app.use("/", translateRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

const PORT = 5600;
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log("Database connected & synced");
    app.listen(PORT, () => console.log(`Server running at http://0.0.0.0:${PORT}`));
  } catch (err) {
    console.error("Database connection failed:", err);
  }
})();

