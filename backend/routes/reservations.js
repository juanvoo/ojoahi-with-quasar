import express from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/errorHandler.js"
import pool from "../config/database.js"
import logger from "../utils/logger.js"

const router = express.Router()

// Get user reservations
router.get(
  "/",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.session.user.id
      const userRole = req.session.user.role

      let query
      let params

      if (userRole === "volunteer") {
        query = `
        SELECT 
          r.*,
          hr.title,
          hr.description,
          hr.date,
          hr.time,
          hr.location,
          u.username as blind_user_name,
          u.name as blind_user_full_name
        FROM reservations r
        JOIN help_requests hr ON r.help_request_id = hr.id
        JOIN users u ON r.blind_user_id = u.id
        WHERE r.volunteer_id = ?
        ORDER BY r.created_at DESC
      `
        params = [userId]
      } else {
        query = `
        SELECT 
          r.*,
          hr.title,
          hr.description,
          hr.date,
          hr.time,
          hr.location,
          u.username as volunteer_name,
          u.name as volunteer_full_name
        FROM reservations r
        JOIN help_requests hr ON r.help_request_id = hr.id
        JOIN users u ON r.volunteer_id = u.id
        WHERE r.blind_user_id = ?
        ORDER BY r.created_at DESC
      `
        params = [userId]
      }

      const [reservations] = await pool.execute(query, params)

      res.json({
        success: true,
        reservations,
      })
    } catch (error) {
      logger.error("Error al obtener reservas:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener reservas",
      })
    }
  }),
)

export default router
