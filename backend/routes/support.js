import express from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/errorHandler.js"
import logger from "../utils/logger.js"

const router = express.Router()

// Submit support ticket
router.post(
  "/ticket",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const { subject, message, priority } = req.body
      const userId = req.session.user.id

      // Here you would typically save to a support tickets table
      // For now, we'll just log it
      logger.info(`Support ticket from user ${userId}: ${subject}`)

      res.json({
        success: true,
        message: "Ticket de soporte enviado correctamente",
      })
    } catch (error) {
      logger.error("Error al enviar ticket de soporte:", error)
      res.status(500).json({
        success: false,
        message: "Error al enviar ticket de soporte",
      })
    }
  }),
)

export default router
