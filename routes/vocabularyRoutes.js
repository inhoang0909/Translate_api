import express from "express";
import { addVocabulary } from "../controllers/vocabularyController.js";

const router = express.Router();

/**
 * @swagger
 * /api/vocabulary:
 *   post:
 *     summary: Add a new vocabulary
 *     tags: [Vocabulary]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [1, 2]
 *               translations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     language:
 *                       type: string
 *                       example: en
 *                     text:
 *                       type: string
 *                       example: apple
 *                     description:
 *                       type: string
 *                       example: A kind of fruit
 *     responses:
 *       201:
 *         description: Vocabulary created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
router.post("/vocabulary", addVocabulary);

export default router;
