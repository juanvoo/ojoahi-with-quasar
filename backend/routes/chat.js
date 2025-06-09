import express from "express"
import { isAuthenticated } from "../middleware/auth.js"
import { asyncHandler } from "../middleware/errorHandler.js"
import pool from "../config/database.js"
import logger from "../utils/logger.js"
import { debugChat, fixChatIssues, createTestConversation } from "../utils/debugChat.js"
import { validate, messageSchemas } from "../utils/validation.js"

const router = express.Router()

// Get user conversations
router.get(
  "/",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const userId = req.session.user.id

    logger.info(`🔍 Obteniendo conversaciones para usuario ${userId}`)

    const [conversations] = await pool.execute(
      `
    SELECT 
      c.id,
      c.created_at,
      c.updated_at,
      CASE 
        WHEN c.user1_id = ? THEN u2.username 
        ELSE u1.username 
      END as other_user_name,
      CASE 
        WHEN c.user1_id = ? THEN u2.name 
        ELSE u1.name 
      END as other_user_full_name,
      CASE 
        WHEN c.user1_id = ? THEN u2.id 
        ELSE u1.id 
      END as other_user_id,
      CASE 
        WHEN c.user1_id = ? THEN u2.profile_image 
        ELSE u1.profile_image 
      END as profile_image,
      m.content as last_message,
      m.created_at as last_message_date,
      (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND receiver_id = ? AND is_read = FALSE) as unread_count
    FROM conversations c
    JOIN users u1 ON c.user1_id = u1.id
    JOIN users u2 ON c.user2_id = u2.id
    LEFT JOIN messages m ON c.last_message_id = m.id
    WHERE c.user1_id = ? OR c.user2_id = ?
    ORDER BY c.updated_at DESC
  `,
      [userId, userId, userId, userId, userId, userId, userId],
    )

    logger.info(`✅ Encontradas ${conversations.length} conversaciones`)

    res.json({
      success: true,
      conversations,
    })
  }),
)

// Get messages from a conversation
router.get(
  "/:id",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const conversationId = req.params.id
    const userId = req.session.user.id

    logger.info(`🔍 Obteniendo mensajes de conversación ${conversationId} para usuario ${userId}`)

    // Verificar que el usuario pertenece a la conversación
    const [conversation] = await pool.execute(
      "SELECT * FROM conversations WHERE id = ? AND (user1_id = ? OR user2_id = ?)",
      [conversationId, userId, userId],
    )

    if (conversation.length === 0) {
      return res.status(403).json({
        success: false,
        message: "No tienes acceso a esta conversación",
      })
    }

    // Obtener mensajes
    const [messages] = await pool.execute(
      `
    SELECT 
      m.*,
      u.username as sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.conversation_id = ?
    ORDER BY m.created_at ASC
  `,
      [conversationId],
    )

    logger.info(`✅ Encontrados ${messages.length} mensajes`)

    res.json({
      success: true,
      conversation: conversation[0],
      messages,
    })
  }),
)

// Send a message
router.post(
  "/send",
  isAuthenticated,
  validate(messageSchemas.send),
  asyncHandler(async (req, res) => {
    const { receiver_id, content, conversation_id } = req.body
    const senderId = req.session.user.id

    if (!receiver_id || !content) {
      return res.status(400).json({
        success: false,
        message: "receiver_id y content son requeridos",
      })
    }

    logger.info(`📤 Enviando mensaje de ${senderId} a ${receiver_id}`)

    // Buscar conversación existente
    const [conversation] = await pool.execute(
      `
    SELECT id FROM conversations 
    WHERE (user1_id = ? AND user2_id = ?) OR (user1_id = ? AND user2_id = ?)
  `,
      [senderId, receiver_id, receiver_id, senderId],
    )

    let conversationId = conversation_id

    if (!conversationId) {
      if (conversation.length === 0) {
        // Crear nueva conversación
        const [result] = await pool.execute("INSERT INTO conversations (user1_id, user2_id) VALUES (?, ?)", [
          Math.min(senderId, receiver_id),
          Math.max(senderId, receiver_id),
        ])
        conversationId = result.insertId
        logger.info(`🆕 Nueva conversación creada: ${conversationId}`)
      } else {
        conversationId = conversation[0].id
        logger.info(`📋 Usando conversación existente: ${conversationId}`)
      }
    }

    // Insertar mensaje
    const [messageResult] = await pool.execute(
      "INSERT INTO messages (conversation_id, sender_id, receiver_id, content) VALUES (?, ?, ?, ?)",
      [conversationId, senderId, receiver_id, content],
    )

    // Actualizar timestamp de conversación
    await pool.execute("UPDATE conversations SET updated_at = NOW() WHERE id = ?", [conversationId])

    // Obtener el mensaje creado
    const [newMessage] = await pool.execute(
      `
    SELECT 
      m.*,
      u.username as sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.id = ?
  `,
      [messageResult.insertId],
    )

    logger.info(`✅ Mensaje enviado: ${messageResult.insertId}`)

    res.json({
      success: true,
      message: newMessage[0],
      conversation_id: conversationId,
    })
  }),
)

// Mark messages as read
router.post(
  "/:id/read",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    const conversationId = req.params.id
    const userId = req.session.user.id

    await pool.execute(
      "UPDATE messages SET is_read = TRUE, read_at = NOW() WHERE conversation_id = ? AND receiver_id = ?",
      [conversationId, userId],
    )

    logger.info(`👁️ Mensajes marcados como leídos en conversación ${conversationId}`)

    res.json({
      success: true,
      message: "Mensajes marcados como leídos",
    })
  }),
)

// Debug chat system (admin only)
router.get(
  "/debug",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      if (req.session.user.role !== "admin" && !req.session.user.is_admin) {
        return res.status(403).json({
          success: false,
          message: "Acceso denegado. Solo administradores pueden usar esta función.",
        })
      }

      const result = await debugChat()
      res.json(result)
    } catch (error) {
      logger.error("❌ Error en debug de chat:", error)
      res.status(500).json({
        success: false,
        message: "Error en debug de chat",
        error: error.message,
      })
    }
  }),
)

// Fix chat issues (admin only)
router.post(
  "/fix",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      if (req.session.user.role !== "admin" && !req.session.user.is_admin) {
        return res.status(403).json({
          success: false,
          message: "Acceso denegado. Solo administradores pueden usar esta función.",
        })
      }

      const result = await fixChatIssues()
      res.json(result)
    } catch (error) {
      logger.error("❌ Error al corregir problemas de chat:", error)
      res.status(500).json({
        success: false,
        message: "Error al corregir problemas de chat",
        error: error.message,
      })
    }
  }),
)

// Create test conversation (admin only)
router.post(
  "/test-conversation",
  isAuthenticated,
  asyncHandler(async (req, res) => {
    try {
      if (req.session.user.role !== "admin" && !req.session.user.is_admin) {
        return res.status(403).json({
          success: false,
          message: "Acceso denegado. Solo administradores pueden usar esta función.",
        })
      }

      const { user1_id, user2_id, message } = req.body

      if (!user1_id || !user2_id) {
        return res.status(400).json({
          success: false,
          message: "Se requieren user1_id y user2_id",
        })
      }

      const result = await createTestConversation(
        Number.parseInt(user1_id),
        Number.parseInt(user2_id),
        message || "Mensaje de prueba",
      )

      res.json(result)
    } catch (error) {
      logger.error("❌ Error al crear conversación de prueba:", error)
      res.status(500).json({
        success: false,
        message: "Error al crear conversación de prueba",
        error: error.message,
      })
    }
  }),
)

export default router
