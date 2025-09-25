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
 *                 description: Optional model name (default is 'qwen3-8b').
 *                 enum: [qwen3-8b, qwen2.5-14b, qwen3-30b]
 *                 example: qwen3-8b
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
 *                     vi: "Xin chào, bạn đang khỏe không?"
 *                     zh-tw: "你好，你怎麼樣？"
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
