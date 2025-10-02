import express from "express";
import { addVocabulary, getVocabularyList, updateVocabulary, deleteVocabulary, getVocabularyById } from "../controllers/vocabularyController.js";

const router = express.Router();
/**
 * @swagger
 * /api/vocabularies:
 *   get:
 *     summary: Get list of vocabularies with their categories and translations
 *     tags: [Vocabulary]
 *     responses:
 *       200:
 *         description: Vocabulary list fetched successfully
 *       500:
 *         description: Internal server error
 */
router.get("/vocabularies", getVocabularyList);

/**
 * @swagger
 * /api/vocabulary/{id}:
 *   get:
 *     summary: Get a vocabulary by ID
 *     tags: [Vocabulary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vocabulary ID
 *     responses:
 *       200:
 *         description: Vocabulary fetched successfully
 *       404:
 *         description: Vocabulary not found
 *       500:
 *         description: Internal server error
 */
router.get("/vocabulary/:id", getVocabularyById);

/**
 * @swagger
 * /api/add-vocabulary:
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
router.post("/add-vocabulary", addVocabulary);


/**
 * @swagger
 * /api/update-vocabulary/{id}:
 *   put:
 *     summary: Update a vocabulary
 *     tags: [Vocabulary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vocabulary ID
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
 *       200:
 *         description: Vocabulary updated successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: Vocabulary not found
 *       500:
 *         description: Internal server error
 */
router.put("/update-vocabulary/:id", updateVocabulary);

/**
 * @swagger
 * /api/delete-vocabulary/{id}:
 *   delete:
 *     summary: Delete a vocabulary
 *     tags: [Vocabulary]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Vocabulary ID
 *     responses:
 *       200:
 *         description: Vocabulary deleted successfully
 *       404:
 *         description: Vocabulary not found
 *       500:
 *         description: Internal server error
 */
router.delete("/delete-vocabulary/:id", deleteVocabulary);


export default router;
