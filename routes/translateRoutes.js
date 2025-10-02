import express from "express";
import { translateController } from "../controllers/translateController.js";

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
 *     summary: Translate input text into multiple target languages
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
 *                 example: Chào buổi sáng
 *               targetLangs:
 *                 type: array
 *                 description: Array of language codes to translate into.
 *                 items:
 *                   type: string
 *                 example: [ "en", "zh-tw" ]
 *               model:
 *                 type: string
 *                 description: The model to use for translation (e.g., "qwen3-8b", "gemma3-12b", "qwen3-32b").
 *                 example: qwen3-8b
 *                 enum: [ "qwen3-8b", "gemma3-12b", "qwen3-32b" ]
 *               source:
 *                 type: string
 *                 description: The source of the translation request (e.g., "hrm", "llm").
 *                 example: hrm
 *     responses:
 *       200:
 *         description: Successful translation
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
 *                   example: Translation successful
 *                 data:
 *                   type: object
 *                   properties:
 *                     source_language:
 *                       type: string
 *                       example: en
 *                     translation:
 *                       type: object
 *                       additionalProperties:
 *                         type: string
 *                       example:
 *                         en: "Chào buổi sáng"
 *                         zh-tw: "早安"
 *                     model:
 *                       type: string
 *                       example: qwen3-8b
 *                     source:
 *                       type: string
 *                       example: hrm
 *       400:
 *         description: Bad request (e.g., missing parameters)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Missing 'text'.
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Multi-translation failed
 *                 data:
 *                   type: string
 *                   nullable: true
 *                   example: null
 */
router.post("/api/translate", translateController);

export default router;