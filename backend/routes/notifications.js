const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { isAuthenticated } = require('../middleware/auth');

// Marcar todas las notificaciones como leídas
router.post('/mark-all-read', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    await Notification.markAllAsRead(userId);
    res.json({ success: true, message: 'Todas las notificaciones han sido marcadas como leídas' });
  } catch (error) {
    console.error('Error al marcar las notificaciones como leídas:', error);
    res.status(500).json({ success: false, message: 'Error al marcar las notificaciones como leídas' });
  }
});

// Marcar una notificación específica como leída
router.post('/mark-read/:id', isAuthenticated, async (req, res) => {
  try {
    const notificationId = req.params.id;
    await Notification.markAsRead(notificationId);
    res.json({ success: true, message: 'Notificación marcada como leída' });
  } catch (error) {
    console.error('Error al marcar la notificación como leída:', error);
    res.status(500).json({ success: false, message: 'Error al marcar la notificación como leída' });
  }
});

module.exports = router;