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

// Get my reviews (for blind users)
router.get(
  "/my-reviews",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.session.user.id

      const [reviews] = await pool.execute(
        `
        SELECT 
          r.*,
          u.username as volunteer_name,
          u.name as volunteer_full_name,
          u.profile_image as volunteer_avatar
        FROM reviews r
        JOIN users u ON r.volunteer_id = u.id
        WHERE r.reviewer_id = ?
        ORDER BY r.created_at DESC
      `,
        [userId],
      )

      res.json({
        success: true,
        reviews,
      })
    } catch (error) {
      logger.error("Error al obtener mis reseñas:", error)
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
      const { volunteer_id, rating, comment, reservation_id, service_type } = req.body
      const reviewerId = req.session.user.id

      const [result] = await pool.execute(
        `INSERT INTO reviews 
       (reviewer_id, reviewed_id, volunteer_id, rating, comment, reservation_id, service_type) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [reviewerId, volunteer_id, volunteer_id, rating, comment, reservation_id, service_type],
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

// Update a review
router.put(
  "/:id",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const reviewId = req.params.id
      const userId = req.session.user.id
      const { rating, comment, service_type } = req.body

      // Verificar que la reseña pertenece al usuario
      const [existing] = await pool.execute("SELECT * FROM reviews WHERE id = ? AND reviewer_id = ?", [
        reviewId,
        userId,
      ])

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Reseña no encontrada",
        })
      }

      const [result] = await pool.execute(
        "UPDATE reviews SET rating = ?, comment = ?, service_type = ?, updated_at = NOW() WHERE id = ?",
        [rating, comment, service_type, reviewId],
      )

      res.json({
        success: true,
        message: "Reseña actualizada correctamente",
      })
    } catch (error) {
      logger.error("Error al actualizar reseña:", error)
      res.status(500).json({
        success: false,
        message: "Error al actualizar reseña",
      })
    }
  }),
)

// Delete a review
router.delete(
  "/:id",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const reviewId = req.params.id
      const userId = req.session.user.id

      // Verificar que la reseña pertenece al usuario
      const [existing] = await pool.execute("SELECT * FROM reviews WHERE id = ? AND reviewer_id = ?", [
        reviewId,
        userId,
      ])

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Reseña no encontrada",
        })
      }

      const [result] = await pool.execute("DELETE FROM reviews WHERE id = ?", [reviewId])

      res.json({
        success: true,
        message: "Reseña eliminada correctamente",
      })
    } catch (error) {
      logger.error("Error al eliminar reseña:", error)
      res.status(500).json({
        success: false,
        message: "Error al eliminar reseña",
      })
    }
  }),
)

export default router
