import express from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { validate, userSchemas } from "../utils/validation.js"
import { asyncHandler } from "../middleware/errorHandler.js"
import User from "../models/User.js"
import logger from "../utils/logger.js"
import pool from "../config/database.js"

const router = express.Router()

// Get current user profile
router.get(
  "/profile",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const user = await User.findById(req.session.user.id)

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Usuario no encontrado",
        })
      }

      res.json({
        success: true,
        user,
      })
    } catch (error) {
      logger.error("Error al obtener perfil:", error)
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      })
    }
  }),
)

// Update user profile
router.put(
  "/profile",
  isAuthenticated,
  validate(userSchemas.updateProfile),
  asyncHandler(async (req, res) => {
    try {
      const updatedUser = await User.updateProfile(req.session.user.id, req.body)

      // Update session data
      req.session.user = {
        ...req.session.user,
        username: updatedUser.username,
        email: updatedUser.email,
        name: updatedUser.name,
        profile_image: updatedUser.profile_image,
      }

      res.json({
        success: true,
        message: "Perfil actualizado correctamente",
        user: updatedUser,
      })
    } catch (error) {
      logger.error("Error al actualizar perfil:", error)
      res.status(400).json({
        success: false,
        message: error.message || "Error al actualizar perfil",
      })
    }
  }),
)

// Change password
router.post(
  "/change-password",
  isAuthenticated,
  validate(userSchemas.changePassword),
  asyncHandler(async (req, res) => {
    try {
      const { current_password, new_password } = req.body

      await User.changePassword(req.session.user.id, current_password, new_password)

      res.json({
        success: true,
        message: "Contraseña cambiada correctamente",
      })
    } catch (error) {
      logger.error("Error al cambiar contraseña:", error)
      res.status(400).json({
        success: false,
        message: error.message || "Error al cambiar contraseña",
      })
    }
  }),
)

// Get user statistics
router.get(
  "/stats",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.session.user.id
      const userRole = req.session.user.role

      let stats = {}

      if (userRole === "blind") {
        // Estadísticas para usuarios ciegos
        const [requests] = await pool.execute("SELECT COUNT(*) as total FROM help_requests WHERE blind_user_id = ?", [
          userId,
        ])

        const [reviewsGiven] = await pool.execute("SELECT COUNT(*) as total FROM reviews WHERE reviewer_id = ?", [
          userId,
        ])

        const [messages] = await pool.execute(
          "SELECT COUNT(*) as total FROM messages WHERE sender_id = ? OR receiver_id = ?",
          [userId, userId],
        )

        stats = {
          requests: requests[0].total || 0,
          reviews_given: reviewsGiven[0].total || 0,
          messages: messages[0].total || 0,
        }
      } else if (userRole === "volunteer") {
        // Estadísticas para voluntarios
        const [completed] = await pool.execute(
          'SELECT COUNT(*) as total FROM help_requests WHERE volunteer_id = ? AND status = "completed"',
          [userId],
        )

        const [reviews] = await pool.execute(
          "SELECT COUNT(*) as total, AVG(rating) as average FROM reviews WHERE volunteer_id = ?",
          [userId],
        )

        const [messages] = await pool.execute(
          "SELECT COUNT(*) as total FROM messages WHERE sender_id = ? OR receiver_id = ?",
          [userId, userId],
        )

        stats = {
          completed: completed[0].total || 0,
          rating: reviews[0].average ? Number.parseFloat(reviews[0].average).toFixed(1) : "0.0",
          total_reviews: reviews[0].total || 0,
          messages: messages[0].total || 0,
        }
      }

      res.json({
        success: true,
        stats,
      })
    } catch (error) {
      logger.error("Error al obtener estadísticas:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener estadísticas",
      })
    }
  }),
)

// Get recent activity
router.get(
  "/recent-activity",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.session.user.id
      const userRole = req.session.user.role

      let activities = []

      if (userRole === "blind") {
        // Actividad reciente para usuarios ciegos
        const [recentRequests] = await pool.execute(
          `SELECT 'help_request' as type, title, created_at 
           FROM help_requests 
           WHERE blind_user_id = ? 
           ORDER BY created_at DESC 
           LIMIT 5`,
          [userId],
        )

        activities = recentRequests.map((item) => ({
          id: Math.random(),
          icon: "help",
          color: "primary",
          title: "Solicitud creada",
          description: item.title,
          time: formatTimeAgo(item.created_at),
        }))
      } else if (userRole === "volunteer") {
        // Actividad reciente para voluntarios
        const [recentHelps] = await pool.execute(
          `SELECT hr.title, hr.updated_at, hr.status
           FROM help_requests hr
           WHERE hr.volunteer_id = ? 
           ORDER BY hr.updated_at DESC 
           LIMIT 5`,
          [userId],
        )

        activities = recentHelps.map((item) => ({
          id: Math.random(),
          icon: item.status === "completed" ? "check_circle" : "volunteer_activism",
          color: item.status === "completed" ? "green" : "primary",
          title: item.status === "completed" ? "Ayuda completada" : "Ayuda en progreso",
          description: item.title,
          time: formatTimeAgo(item.updated_at),
        }))
      }

      res.json({
        success: true,
        activities,
      })
    } catch (error) {
      logger.error("Error al obtener actividad reciente:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener actividad reciente",
      })
    }
  }),
)

// Helper function to format time ago
function formatTimeAgo(date) {
  const now = new Date()
  const past = new Date(date)
  const diffInMinutes = Math.floor((now - past) / (1000 * 60))

  if (diffInMinutes < 60) {
    return `Hace ${diffInMinutes} minutos`
  } else if (diffInMinutes < 1440) {
    const hours = Math.floor(diffInMinutes / 60)
    return `Hace ${hours} hora${hours > 1 ? "s" : ""}`
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return `Hace ${days} día${days > 1 ? "s" : ""}`
  }
}

// Get all volunteers (for blind users)
router.get(
  "/volunteers",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const volunteers = await User.getVolunteers()

      res.json({
        success: true,
        volunteers,
      })
    } catch (error) {
      logger.error("Error al obtener voluntarios:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener voluntarios",
      })
    }
  }),
)

export default router
