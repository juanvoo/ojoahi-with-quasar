const SupportChat = require("../models/SupportChat")
const User = require("../models/User")
const Notification = require("../models/Notification")
const pool = require("../config/database")

// Verificar si un usuario es agente de soporte
const isSupport = (user) => {
  return user && (user.role === "admin" || user.role === "support")
}

// Panel de soporte (agente o usuario)
exports.getIndex = async (req, res) => {
  try {
    const userId = req.session.user.id

    if (isSupport(req.session.user)) {
      // Vista para agentes de soporte
      const sessions = await SupportChat.getAgentSessions(userId)
      const waitingCount = await SupportChat.getWaitingSessionsCount()

      return res.json({
        success: true,
        user: req.session.user,
        sessions,
        waitingCount,
        isAgent: true,
        title: "Panel de Soporte",
      })
    } else {
      // Vista para usuarios regulares
      const sessions = await SupportChat.getUserSessions(userId)

      return res.json({
        success: true,
        user: req.session.user,
        sessions,
        isAgent: false,
        title: "Mis Conversaciones de Soporte",
      })
    }
  } catch (error) {
    console.error("Error al cargar el panel de soporte:", error)
    return res.status(500).json({ success: false, message: "Error al cargar el panel de soporte" })
  }
}

// Obtener una sesión de soporte
exports.getSession = async (req, res) => {
  try {
    const userId = req.session.user.id
    const sessionId = req.params.id

    // Obtener la sesión
    const session = await SupportChat.getSessionById(sessionId)

    if (!session) {
      return res.status(404).json({ success: false, message: "Sesión de chat no encontrada" })
    }

    // Verificar permisos
    const isUserSession = session.user_id === userId
    const isAgentSession =
      isSupport(req.session.user) && (session.support_agent_id === userId || !session.support_agent_id)

    if (!isUserSession && !isAgentSession) {
      return res.status(403).json({ success: false, message: "No tienes permiso para acceder a esta sesión" })
    }

    // Si es un agente y la sesión está en espera, asignarla automáticamente
    if (isAgentSession && session.status === "waiting") {
      await SupportChat.assignAgentToSession(sessionId, userId)
      // Actualizar la sesión después de asignarla
      session.support_agent_id = userId
      session.status = "active"
      session.agent_username = req.session.user.username
    }

    // Marcar mensajes como leídos
    if (isUserSession) {
      await SupportChat.markMessagesAsRead(sessionId, false) // Marcar mensajes del agente como leídos
    } else if (isAgentSession) {
      await SupportChat.markMessagesAsRead(sessionId, true) // Marcar mensajes del usuario como leídos
    }

    // Obtener mensajes
    const messages = await SupportChat.getSessionMessages(sessionId)

    return res.json({
      success: true,
      user: req.session.user,
      session,
      messages,
      isAgent: isSupport(req.session.user),
      title: `Chat de Soporte - ${session.subject || "Sin asunto"}`,
    })
  } catch (error) {
    console.error("Error al cargar la sesión de chat:", error)
    return res.status(500).json({ success: false, message: "Error al cargar la sesión de chat" })
  }
}

// Crear una nueva sesión de soporte
exports.createSession = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { subject } = req.body

    if (!subject) {
      return res.status(400).json({ success: false, message: "Por favor, indica el asunto de tu consulta" })
    }

    // Crear nueva sesión
    const sessionId = await SupportChat.createSession(userId, subject)

    // Retornar id de la sesión creada
    return res.json({ success: true, message: "Sesión de soporte creada", sessionId })
  } catch (error) {
    console.error("Error al crear sesión de chat:", error)
    return res.status(500).json({ success: false, message: "Error al crear sesión de chat" })
  }
}

// Enviar mensaje en sesión de soporte
exports.sendMessage = async (req, res) => {
  try {
    const userId = req.session.user.id
    const { session_id, message } = req.body

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "El mensaje no puede estar vacío" })
    }

    // Obtener la sesión
    const session = await SupportChat.getSessionById(session_id)

    if (!session) {
      return res.status(404).json({ success: false, message: "Sesión de chat no encontrada" })
    }

    // Verificar permisos
    const isUserSession = session.user_id === userId
    const isAgentSession = isSupport(req.session.user) && session.support_agent_id === userId

    if (!isUserSession && !isAgentSession) {
      return res.status(403).json({ success: false, message: "No tienes permiso para enviar mensajes en esta sesión" })
    }

    // Determinar si el mensaje es del usuario o del agente
    const isFromUser = isUserSession

    // Crear el mensaje
    await SupportChat.createMessage(session_id, userId, message, isFromUser)

    // Crear notificación para el destinatario
    try {
      let recipientId
      let notificationTitle
      let notificationContent

      if (isFromUser) {
        // Notificar al agente si hay uno asignado
        if (session.support_agent_id) {
          recipientId = session.support_agent_id
          notificationTitle = "Nuevo mensaje de soporte"
          notificationContent = `${req.session.user.username} ha enviado un mensaje en la consulta "${session.subject}"`
        }
      } else {
        // Notificar al usuario
        recipientId = session.user_id
        notificationTitle = "Respuesta de soporte"
        notificationContent = `Un agente ha respondido a tu consulta "${session.subject}"`
      }

      if (recipientId) {
        await Notification.create({
          user_id: recipientId,
          title: notificationTitle,
          content: notificationContent,
          type: "support",
          link: `/support/chat/${session_id}`,
        })
      }
    } catch (notifError) {
      console.error("Error al crear notificación:", notifError)
      // Continuar a pesar del error en la notificación
    }

    return res.json({ success: true, message: "Mensaje enviado correctamente" })
  } catch (error) {
    console.error("Error al enviar mensaje:", error)
    return res.status(500).json({ success: false, message: "Error al enviar mensaje" })
  }
}

// Cerrar una sesión de soporte (solo agentes)
exports.closeSession = async (req, res) => {
  try {
    const userId = req.session.user.id
    const sessionId = req.params.id

    // Obtener la sesión
    const session = await SupportChat.getSessionById(sessionId)

    if (!session) {
      return res.status(404).json({ success: false, message: "Sesión de chat no encontrada" })
    }

    // Verificar permisos (solo agentes pueden cerrar sesiones)
    if (!isSupport(req.session.user)) {
      return res.status(403).json({ success: false, message: "No tienes permiso para cerrar esta sesión" })
    }

    // Cerrar la sesión
    await SupportChat.closeSession(sessionId)

    // Notificar al usuario
    try {
      await Notification.create({
        user_id: session.user_id,
        title: "Consulta cerrada",
        content: `Tu consulta "${session.subject}" ha sido cerrada por el equipo de soporte`,
        type: "support",
        link: `/support/chat/${sessionId}`,
      })
    } catch (notifError) {
      console.error("Error al crear notificación:", notifError)
    }

    return res.json({ success: true, message: "Sesión cerrada correctamente" })
  } catch (error) {
    console.error("Error al cerrar sesión:", error)
    return res.status(500).json({ success: false, message: "Error al cerrar sesión" })
  }
}

// Obtener FAQs (Preguntas Frecuentes)
exports.getHelp = async (req, res) => {
  try {
    const [faqs] = await pool.execute("SELECT * FROM faqs")
    return res.json({ success: true, faqs })
  } catch (error) {
    console.error("Error en getHelp:", error.message)
    return res.status(500).json({ success: false, message: `Error interno: ${error.message}` })
  }
}