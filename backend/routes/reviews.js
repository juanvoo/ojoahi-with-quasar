import express from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { validate, reviewSchemas } from "../utils/validation.js"
import { asyncHandler } from "../middleware/errorHandler.js"
import pool from "../config/database.js"
import logger from "../utils/logger.js"

const router = express.Router()

// Get reviews for a volunteer
router.get(
  "/volunteer/:id",
  asyncHandler(async (req, res) => {
    try {
      const volunteerId = req.params.id

      const [reviews] = await pool.execute(
        `
      SELECT 
        r.*,
        u.username as reviewer_name,
        u.name as reviewer_full_name
      FROM reviews r
      JOIN users u ON r.reviewer_id = u.id
      WHERE r.volunteer_id = ? AND r.is_visible = TRUE
      ORDER BY r.created_at DESC
    `,
        [volunteerId],
      )

      res.json({
        success: true,
        reviews,
      })
    } catch (error) {
      logger.error("Error al obtener reseñas:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener reseñas",
      })
    }
  }),
)

// Create a review
router.post(
  "/",
  isAuthenticated,
  validate(reviewSchemas.create),
  asyncHandler(async (req, res) => {
    try {
      const { volunteer_id, rating, comment, reservation_id } = req.body
      const reviewerId = req.session.user.id

      const [result] = await pool.execute(
        `INSERT INTO reviews 
       (reviewer_id, reviewed_id, volunteer_id, rating, comment, reservation_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
        [reviewerId, volunteer_id, volunteer_id, rating, comment, reservation_id],
      )

      logger.info(`Nueva reseña creada: ${result.insertId}`)

      res.status(201).json({
        success: true,
        message: "Reseña creada correctamente",
        reviewId: result.insertId,
      })
    } catch (error) {
      logger.error("Error al crear reseña:", error)
      res.status(500).json({
        success: false,
        message: "Error al crear reseña",
      })
    }
  }),
)

export default router
