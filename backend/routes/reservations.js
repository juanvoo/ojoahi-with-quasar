const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { isAuthenticated } = require('../middleware/auth');

// Crear una reserva
router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const { volunteerId, date, time, description } = req.body;
    const userId = req.session.user.id;
    await Reservation.create(userId, volunteerId, date, time, description);
    res.json({ success: true, message: 'Reserva creada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al crear la reserva' });
  }
});

// Cancelar una reserva
router.post('/cancel/:id', isAuthenticated, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);
    if (reservation.user_id !== req.session.user.id) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para cancelar esta reserva' });
    }
    await Reservation.updateStatus(reservationId, 'cancelled');
    res.json({ success: true, message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al cancelar la reserva' });
  }
});

// Aceptar una solicitud de reserva
router.post('/accept/:id', isAuthenticated, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);
    if (reservation.volunteer_id !== req.session.user.id) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para aceptar esta reserva' });
    }
    await Reservation.updateStatus(reservationId, 'confirmed');
    res.json({ success: true, message: 'Reserva aceptada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al aceptar la reserva' });
  }
});

// Rechazar una solicitud de reserva
router.post('/reject/:id', isAuthenticated, async (req, res) => {
  try {
    const reservationId = req.params.id;
    const reservation = await Reservation.findById(reservationId);
    if (reservation.volunteer_id !== req.session.user.id) {
      return res.status(403).json({ success: false, message: 'No tienes permiso para rechazar esta reserva' });
    }
    await Reservation.updateStatus(reservationId, 'rejected');
    res.json({ success: true, message: 'Reserva rechazada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Error al rechazar la reserva' });
  }
});

module.exports = router;