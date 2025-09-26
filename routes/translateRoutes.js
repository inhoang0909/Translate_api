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
 * /translate:
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
 *                 example: Hello, how are you?
 *               targetLangs:
 *                 type: array
 *                 description: Array of language codes to translate into.
 *                 items:
 *                   type: string
 *                 example: [ "vi", "zh-tw" ]
 *               model:
 *                 type: string
 *                 description: The model to use for translation (e.g., "qwen3-8b", "gemma3-12b", "qwen3-32b").
 *                 example: qwen3-8b
 *                 enum: [ "qwen3-8b", "gemma3-12b", "qwen3-32b" ]
 *     responses:
 *       200:
 *         description: Successful translation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 source_language:
 *                   type: string
 *                   example: en
 *                 original_text:
 *                   type: string
 *                   example: Hello, how are you?
 *                 translation:
 *                   type: object
 *                   additionalProperties:
 *                     type: string
 *                   example:
 *                     vi: "Xin chào, bạn khỏe không?"
 *                     zh-tw: "你好，你好嗎？"
 *                 model:
 *                   type: string
 *                   example: qwen3-8b
 *       400:
 *         description: Bad request (e.g., missing parameters)
 *       500:
 *         description: Internal server error
 */
router.post("/translate", translateController);

export default router;