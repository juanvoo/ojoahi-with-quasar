import express from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { validate, userSchemas } from "../utils/validation.js"
import { asyncHandler } from "../middleware/errorHandler.js"
import User from "../models/User.js"
import logger from "../utils/logger.js"

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
      const stats = await User.getStats(req.session.user.id)

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
