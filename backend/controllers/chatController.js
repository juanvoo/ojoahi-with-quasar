const Message = require('../models/Message');
const User = require('../models/User');

// Obtener lista de conversaciones del usuario
exports.getConversations = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const conversations = await Message.getUserConversations(userId);

    // Obtener conteo de mensajes no leídos
    const unreadCount = await Message.getUnreadCount(userId);

    return res.json({
      success: true,
      conversations,
      unreadCount
    });
  } catch (error) {
    console.error('Error al cargar conversaciones:', error);
    return res.status(500).json({ success: false, message: 'Error al cargar las conversaciones' });
  }
};

// Obtener mensajes de una conversación específica
exports.getConversation = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const contactId = req.params.id;

    // Verificar que el contacto existe
    const contact = await User.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Marcar mensajes como leídos
    await Message.markAsRead(contactId, userId);

    // Obtener mensajes
    const messages = await Message.getConversation(userId, contactId);

    // Verificar si hay solicitudes pendientes entre los usuarios
    let pendingRequests = [];
    try {
      const HelpRequest = require('../models/HelpRequest');
      if (req.session.user.role === 'blind') {
        pendingRequests = await HelpRequest.getPendingByUserAndVolunteer(userId, contactId);
      } else if (req.session.user.role === 'volunteer') {
        pendingRequests = await HelpRequest.getPendingByUserAndVolunteer(contactId, userId);
      }
    } catch (error) {
      console.error('Error al obtener solicitudes pendientes:', error);
    }

    return res.json({
      success: true,
      contact,
      messages,
      pendingRequests
    });
  } catch (error) {
    console.error('Error al cargar la conversación:', error);
    return res.status(500).json({ success: false, message: 'Error al cargar la conversación' });
  }
};

// Enviar un mensaje
exports.sendMessage = async (req, res) => {
  try {
    const senderId = req.session.user.id;
    const { receiver_id, content } = req.body;

    if (!senderId) {
      return res.status(400).json({ success: false, message: 'Sesión inválida' });
    }
    if (!receiver_id) {
      return res.status(400).json({ success: false, message: 'Destinatario no especificado' });
    }
    if (!content || content.trim() === '') {
      return res.status(400).json({ success: false, message: 'El mensaje no puede estar vacío' });
    }

    // Verificar que el receptor existe
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Crear el mensaje
    await Message.create({
      sender_id: senderId,
      receiver_id,
      content
    });

    // Crear notificación para el receptor
    try {
      const Notification = require('../models/Notification');
      await Notification.create({
        user_id: receiver_id,
        title: 'Nuevo mensaje',
        content: `Has recibido un nuevo mensaje de ${req.session.user.username}`,
        type: 'message',
        link: `/chat/${senderId}`
      });
    } catch (notifError) {
      console.error('Error al crear notificación:', notifError);
    }

    return res.json({ success: true, message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    return res.status(500).json({ success: false, message: `Error al enviar el mensaje: ${error.message}` });
  }
};

// Iniciar una conversación (redirigir a la conversación)
exports.startConversation = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const contactId = req.params.id;

    // Verificar que el contacto existe
    const contact = await User.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Simplemente responde con el ID del chat/contacto para que el frontend redirija
    return res.json({ success: true, conversationId: contactId });
  } catch (error) {
    console.error('Error al iniciar conversación:', error);
    return res.status(500).json({ success: false, message: 'Error al iniciar la conversación' });
  }
};