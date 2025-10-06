import express from "express";
import categoryRoutes from "./categoryRoutes.js";
import vocabularyRoutes from "./vocabularyRoutes.js";
import translateRoutes from "./translateRoutes.js";

const router = express.Router();

router.use("/api", categoryRoutes);
router.use("/api", vocabularyRoutes);
router.use("/", translateRoutes);

export default router;
