import express from "express";
import { createCategory, getCategoryList } from "../controllers/categoryController.js";

const router = express.Router();

/**
 * @swagger
 * /api/category:
 *   post:
 *     summary: Create a new category
 *     tags: [Category]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: HR
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/add-category", createCategory);
/**
 * @swagger
 * /api/category:
 *   get:
 *     summary: Get list of categories
 *     tags: [Category]
 *     responses:
 *       200:
 *         description: Category list fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/category", getCategoryList);
export default router;
