import express from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/errorHandler.js"
import pool from "../config/database.js"
import logger from "../utils/logger.js"

const router = express.Router()

// Get user notifications
router.get(
  "/",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.session.user.id
      const { limit = 20, offset = 0, unread_only = false } = req.query

      let query = `
        SELECT 
          n.*,
          DATE_FORMAT(n.created_at, '%Y-%m-%d %H:%i:%s') as formatted_date
        FROM notifications n
        WHERE n.user_id = ?
      `
      const params = [userId]

      if (unread_only === "true") {
        query += " AND n.is_read = FALSE"
      }

      query += " ORDER BY n.created_at DESC LIMIT ? OFFSET ?"
      params.push(Number.parseInt(limit), Number.parseInt(offset))

      const [notifications] = await pool.execute(query, params)

      // Get unread count
      const [unreadCount] = await pool.execute(
        "SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = FALSE",
        [userId],
      )

      res.json({
        success: true,
        notifications,
        unread_count: unreadCount[0].count,
      })
    } catch (error) {
      logger.error("Error al obtener notificaciones:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener notificaciones",
      })
    }
  }),
)

// Mark notification as read
router.post(
  "/:id/read",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const notificationId = req.params.id
      const userId = req.session.user.id

      await pool.execute("UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?", [
        notificationId,
        userId,
      ])

      res.json({
        success: true,
        message: "Notificación marcada como leída",
      })
    } catch (error) {
      logger.error("Error al marcar notificación como leída:", error)
      res.status(500).json({
        success: false,
        message: "Error al marcar notificación como leída",
      })
    }
  }),
)

// Mark all notifications as read
router.post(
  "/read-all",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.session.user.id

      await pool.execute("UPDATE notifications SET is_read = TRUE WHERE user_id = ? AND is_read = FALSE", [userId])

      res.json({
        success: true,
        message: "Todas las notificaciones marcadas como leídas",
      })
    } catch (error) {
      logger.error("Error al marcar todas las notificaciones como leídas:", error)
      res.status(500).json({
        success: false,
        message: "Error al marcar todas las notificaciones como leídas",
      })
    }
  }),
)

// Create notification (internal function)
export const createNotification = async (userId, type, title, message, data = null) => {
  try {
    const [result] = await pool.execute(
      "INSERT INTO notifications (user_id, type, title, message, data) VALUES (?, ?, ?, ?, ?)",
      [userId, type, title, message, data ? JSON.stringify(data) : null],
    )

    logger.info(`✅ Notificación creada: ${result.insertId} para usuario ${userId}`)
    return result.insertId
  } catch (error) {
    logger.error("❌ Error al crear notificación:", error)
    throw error
  }
}

export default router
