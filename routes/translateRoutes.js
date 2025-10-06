import express from "express";
import { translateController, translateRAGController } from "../controllers/translateController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Translation
 *   description: Translation API
 */

/**
 * @swagger
 * /api/translate:
 *   post:
 *     summary: Normal translation without RAG
 *     tags: [Translation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - targetLangs
 *             properties:
 *               text:
 *                 type: string
 *                 description: The input text to be translated.
 *                 example: Hello, how are you?
 *               targetLangs:
 *                 type: array
 *                 description: Array of language codes to translate into.
 *                 items:
 *                   type: string
 *                 example: [ "vi", "zh-tw" ]
 *               model:
 *                 type: string
 *                 description: The model to use for translation.
 *                 example: qwen3-8b
 *                 enum: [ "qwen3-8b", "qwen3-14b", "qwen3-32b" ]
 *               source:
 *                 type: string
 *                 description: The source of the translation request.
 *                 example: web
 *     responses:
 *       200:
 *         description: Successful translation
 *       400:
 *         description: Bad request
 *       502:
 *         description: Translation service error
 */
router.post("/api/translate", translateController);

/**
 * @swagger
 * /api/translate-rag:
 *   post:
 *     summary: RAG-enhanced translation with category selection
 *     tags: [Translation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - targetLangs
 *               - categories
 *             properties:
 *               text:
 *                 type: string
 *                 description: The input text to be translated.
 *                 example: Công đoàn là tổ chức của người lao động
 *               targetLangs:
 *                 type: array
 *                 description: Array of language codes to translate into.
 *                 items:
 *                   type: string
 *                 example: [ "en" ]
 *               categories:
 *                 type: array
 *                 description: Category names for RAG-enhanced translation (REQUIRED).
 *                 items:
 *                   type: string
 *                 example: ["HR", "PCC"]
 *               model:
 *                 type: string
 *                 description: The model to use for translation.
 *                 example: qwen3-8b
 *                 enum: [ "qwen3-8b", "qwen3-14b", "qwen3-32b" ]
 *               source:
 *                 type: string
 *                 description: The source of the translation request.
 *                 example: hrm
 *     responses:
 *       200:
 *         description: Successful RAG translation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: RAG translation successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     source_language:
 *                       type: string
 *                       example: vi
 *                     translation:
 *                       type: object
 *                       example:
 *                         en: "Trade union is an organization of workers"
 *                     model:
 *                       type: string
 *                       example: qwen3:8b
 *                     source:
 *                       type: string
 *                       example: hrm
 *                     ragUsed:
 *                       type: boolean
 *                       example: true
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["HR", "PCC"]
 *       400:
 *         description: Bad request (missing categories)
 *       502:
 *         description: Translation service error
 */
router.post("/api/translate-rag", translateRAGController);

export default router;