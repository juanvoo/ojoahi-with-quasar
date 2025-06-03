const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

// Obtener lista de voluntarios disponibles
exports.getCreateHelpRequest = async (req, res) => {
  try {
    const volunteers = await User.getVolunteers();
    return res.json({
      success: true,
      title: 'Solicitar Ayuda',
      volunteers
    });
  } catch (error) {
    console.error('Error al cargar la página de solicitud de ayuda:', error);
    return res.status(500).json({ success: false, message: 'Error al cargar la página' });
  }
};

// Crear una solicitud de ayuda
exports.postCreateHelpRequest = async (req, res) => {
  try {
    const { volunteer_id, description, date, time } = req.body;
    const user_id = req.session.user.id;

    // Validación básica
    if (!description || !date || !time) {
      return res.status(400).json({ success: false, message: 'Por favor, completa todos los campos requeridos' });
    }

    // Crear la solicitud de ayuda
    await HelpRequest.create({
      user_id,
      volunteer_id: volunteer_id || null,
      description,
      date,
      time
    });

    return res.json({ success: true, message: 'Solicitud de ayuda creada exitosamente' });
  } catch (error) {
    console.error('Error al crear la solicitud de ayuda:', error);
    return res.status(500).json({ success: false, message: 'Error al crear la solicitud de ayuda' });
  }
};

// Aceptar una solicitud de ayuda
exports.acceptHelpRequest = async (req, res) => {
  try {
    const helpRequestId = req.params.id;
    const volunteerId = req.session.user.id;

    // Obtener la solicitud de ayuda
    const helpRequest = await HelpRequest.getById(helpRequestId);
    if (!helpRequest) {
      return res.status(404).json({ success: false, message: 'Solicitud de ayuda no encontrada' });
    }

    // Actualizar el estado de la solicitud
    await HelpRequest.updateStatus(helpRequestId, 'accepted', volunteerId);

    // Crear notificación para el usuario ciego
    const Notification = require('../models/Notification');
    await Notification.create({
      user_id: helpRequest.user_id,
      title: 'Solicitud de ayuda aceptada',
      message: `Tu solicitud de ayuda para el ${new Date(helpRequest.date).toLocaleDateString()} a las ${helpRequest.time} ha sido aceptada por ${req.session.user.username}.`,
      type: 'help_request_accepted'
    });

    return res.json({ success: true, message: 'Solicitud de ayuda aceptada exitosamente' });
  } catch (error) {
    console.error('Error al aceptar la solicitud de ayuda:', error);
    return res.status(500).json({ success: false, message: 'Error al aceptar la solicitud de ayuda' });
  }
};

// Rechazar una solicitud de ayuda
exports.rejectHelpRequest = async (req, res) => {
  try {
    const helpRequestId = req.params.id;

    // Obtener la solicitud de ayuda
    const helpRequest = await HelpRequest.getById(helpRequestId);
    if (!helpRequest) {
      return res.status(404).json({ success: false, message: 'Solicitud de ayuda no encontrada' });
    }

    // Actualizar el estado de la solicitud
    await HelpRequest.updateStatus(helpRequestId, 'rejected');

    // Crear notificación para el usuario ciego
    const Notification = require('../models/Notification');
    await Notification.create({
      user_id: helpRequest.user_id,
      title: 'Solicitud de ayuda rechazada',
      message: `Tu solicitud de ayuda para el ${new Date(helpRequest.date).toLocaleDateString()} a las ${helpRequest.time} ha sido rechazada.`,
      type: 'help_request_rejected'
    });

    return res.json({ success: true, message: 'Solicitud de ayuda rechazada' });
  } catch (error) {
    console.error('Error al rechazar la solicitud de ayuda:', error);
    return res.status(500).json({ success: false, message: 'Error al rechazar la solicitud de ayuda' });
  }
};

// Obtener solicitudes pendientes para el voluntario actual
exports.getPendingHelpRequests = async (req, res) => {
  try {
    const volunteerId = req.session.user.id;
    const pendingRequests = await HelpRequest.getPendingByVolunteerId(volunteerId);

    return res.json({
      success: true,
      title: 'Solicitudes de Ayuda Pendientes',
      pendingRequests
    });
  } catch (error) {
    console.error('Error al cargar las solicitudes pendientes:', error);
    return res.status(500).json({ success: false, message: 'Error al cargar las solicitudes pendientes' });
  }
};