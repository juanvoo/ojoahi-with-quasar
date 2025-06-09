import express from "express"
import { isAuthenticated, isBlind, isVolunteer } from "../middleware/auth.js"
import { validate, helpRequestSchemas } from "../utils/validation.js"
import { asyncHandler } from "../middleware/errorHandler.js"
import pool from "../config/database.js"
import logger from "../utils/logger.js"
import { createNotification } from "./notifications.js"

const router = express.Router()

// Get user's help requests (for blind users)
router.get(
  "/my",
  isAuthenticated,
  isBlind,
  asyncHandler(async (req, res) => {
    try {
      const userId = req.session.user.id

      const [requests] = await pool.execute(
        `
      SELECT 
        hr.*,
        u.username as volunteer_name,
        u.name as volunteer_full_name
      FROM help_requests hr
      LEFT JOIN users u ON hr.volunteer_id = u.id
      WHERE hr.blind_user_id = ?
      ORDER BY hr.created_at DESC
    `,
        [userId],
      )

      res.json({
        success: true,
        requests,
      })
    } catch (error) {
      logger.error("Error al obtener solicitudes:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener solicitudes",
      })
    }
  }),
)

// Get available help requests (for volunteers)
router.get(
  "/available",
  isAuthenticated,
  isVolunteer,
  asyncHandler(async (req, res) => {
    try {
      const [requests] = await pool.execute(`
      SELECT 
        hr.*,
        u.username as blind_user_name,
        u.name as blind_user_full_name
      FROM help_requests hr
      JOIN users u ON hr.blind_user_id = u.id
      WHERE hr.status = 'pending' AND hr.volunteer_id IS NULL
      ORDER BY hr.priority DESC, hr.created_at ASC
    `)

      res.json({
        success: true,
        requests,
      })
    } catch (error) {
      logger.error("Error al obtener solicitudes disponibles:", error)
      res.status(500).json({
        success: false,
        message: "Error al obtener solicitudes disponibles",
      })
    }
  }),
)

// Create new help request
router.post(
  "/",
  isAuthenticated,
  isBlind,
  validate(helpRequestSchemas.create),
  asyncHandler(async (req, res) => {
    try {
      const { title, description, date, time, location, priority, estimated_duration, notes } = req.body
      const blindUserId = req.session.user.id

      logger.info(`📝 Creating help request for user ${blindUserId}:`, {
        title,
        description,
        date,
        time,
        location,
        priority,
        estimated_duration,
        notes,
      })

      const [result] = await pool.execute(
        `INSERT INTO help_requests 
       (blind_user_id, title, description, date, time, location, priority, estimated_duration, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          blindUserId,
          title,
          description,
          date,
          time,
          location,
          priority || "medium",
          estimated_duration,
          notes || null,
        ],
      )

      // Get the created request
      const [newRequest] = await pool.execute("SELECT * FROM help_requests WHERE id = ?", [result.insertId])

      // Notify all volunteers about new help request
      const [volunteers] = await pool.execute("SELECT id FROM users WHERE role = 'volunteer'")
      const [requesterInfo] = await pool.execute("SELECT username FROM users WHERE id = ?", [blindUserId])

      for (const volunteer of volunteers) {
        await createNotification(
          volunteer.id,
          "help_request",
          "Nueva solicitud de ayuda",
          `${requesterInfo[0].username} ha creado una nueva solicitud: ${title}`,
          { help_request_id: result.insertId },
        )
      }

      logger.info(`✅ Help request created successfully: ${result.insertId}`)

      res.status(201).json({
        success: true,
        message: "Solicitud creada correctamente",
        request: newRequest[0],
      })
    } catch (error) {
      logger.error("❌ Error creating help request:", error)
      res.status(500).json({
        success: false,
        message: "Error al crear solicitud",
      })
    }
  }),
)

// Accept help request (for volunteers)
router.post(
  "/:id/accept",
  isAuthenticated,
  isVolunteer,
  asyncHandler(async (req, res) => {
    try {
      const requestId = req.params.id
      const volunteerId = req.session.user.id

      // Check if request exists and is available
      const [request] = await pool.execute(
        "SELECT * FROM help_requests WHERE id = ? AND status = 'pending' AND volunteer_id IS NULL",
        [requestId],
      )

      if (request.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Solicitud no encontrada o ya fue tomada",
        })
      }

      // Update request
      await pool.execute(
        "UPDATE help_requests SET volunteer_id = ?, status = 'accepted', updated_at = NOW() WHERE id = ?",
        [volunteerId, requestId],
      )

      // Get updated request
      const [updatedRequest] = await pool.execute(
        `
      SELECT 
        hr.*,
        u.username as blind_user_name,
        u.name as blind_user_full_name
      FROM help_requests hr
      JOIN users u ON hr.blind_user_id = u.id
      WHERE hr.id = ?
    `,
        [requestId],
      )

      // Notify the blind user
      const [volunteerInfo] = await pool.execute("SELECT username FROM users WHERE id = ?", [volunteerId])
      await createNotification(
        request[0].blind_user_id,
        "help_request",
        "Solicitud aceptada",
        `${volunteerInfo[0].username} ha aceptado tu solicitud: ${request[0].title}`,
        { help_request_id: requestId },
      )

      logger.info(`✅ Help request ${requestId} accepted by volunteer ${volunteerId}`)

      res.json({
        success: true,
        message: "Solicitud aceptada correctamente",
        request: updatedRequest[0],
      })
    } catch (error) {
      logger.error("❌ Error accepting help request:", error)
      res.status(500).json({
        success: false,
        message: "Error al aceptar solicitud",
      })
    }
  }),
)

// Complete help request
router.post(
  "/:id/complete",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const requestId = req.params.id
      const userId = req.session.user.id

      // Check if user has permission to complete this request
      const [request] = await pool.execute(
        "SELECT * FROM help_requests WHERE id = ? AND (blind_user_id = ? OR volunteer_id = ?)",
        [requestId, userId, userId],
      )

      if (request.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Solicitud no encontrada o no tienes permisos",
        })
      }

      // Update request status
      await pool.execute("UPDATE help_requests SET status = 'completed', updated_at = NOW() WHERE id = ?", [requestId])

      // Get updated request
      const [updatedRequest] = await pool.execute("SELECT * FROM help_requests WHERE id = ?", [requestId])

      // Notify both users
      const otherUserId = userId === request[0].blind_user_id ? request[0].volunteer_id : request[0].blind_user_id
      if (otherUserId) {
        await createNotification(
          otherUserId,
          "help_request",
          "Solicitud completada",
          `La solicitud "${request[0].title}" ha sido marcada como completada`,
          { help_request_id: requestId },
        )
      }

      logger.info(`✅ Help request ${requestId} completed by user ${userId}`)

      res.json({
        success: true,
        message: "Solicitud completada correctamente",
        request: updatedRequest[0],
      })
    } catch (error) {
      logger.error("❌ Error completing help request:", error)
      res.status(500).json({
        success: false,
        message: "Error al completar solicitud",
      })
    }
  }),
)

// Cancel help request
router.post(
  "/:id/cancel",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      const requestId = req.params.id
      const userId = req.session.user.id

      // Check if user has permission to cancel this request
      const [request] = await pool.execute(
        "SELECT * FROM help_requests WHERE id = ? AND (blind_user_id = ? OR volunteer_id = ?)",
        [requestId, userId, userId],
      )

      if (request.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Solicitud no encontrada o no tienes permisos",
        })
      }

      // Update request status
      await pool.execute(
        "UPDATE help_requests SET status = 'cancelled', volunteer_id = NULL, updated_at = NOW() WHERE id = ?",
        [requestId],
      )

      // Get updated request
      const [updatedRequest] = await pool.execute("SELECT * FROM help_requests WHERE id = ?", [requestId])

      // Notify the other user if there was a volunteer assigned
      if (request[0].volunteer_id && userId !== request[0].volunteer_id) {
        await createNotification(
          request[0].volunteer_id,
          "help_request",
          "Solicitud cancelada",
          `La solicitud "${request[0].title}" ha sido cancelada`,
          { help_request_id: requestId },
        )
      } else if (request[0].blind_user_id && userId !== request[0].blind_user_id) {
        await createNotification(
          request[0].blind_user_id,
          "help_request",
          "Solicitud cancelada",
          `La solicitud "${request[0].title}" ha sido cancelada`,
          { help_request_id: requestId },
        )
      }

      logger.info(`✅ Help request ${requestId} cancelled by user ${userId}`)

      res.json({
        success: true,
        message: "Solicitud cancelada correctamente",
        request: updatedRequest[0],
      })
    } catch (error) {
      logger.error("❌ Error cancelling help request:", error)
      res.status(500).json({
        success: false,
        message: "Error al cancelar solicitud",
      })
    }
  }),
)

export default router
