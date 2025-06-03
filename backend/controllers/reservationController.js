const Reservation = require('../models/Reservation');
const Volunteer = require('../models/Volunteer');

// Obtener formulario de creación de reserva (lista de voluntarios disponibles)
exports.createReservationForm = async (req, res) => {
  try {
    const volunteers = await Volunteer.getAvailable();
    return res.json({ success: true, volunteers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Ocurrió un error al cargar el formulario de reserva' });
  }
};

// Crear una reserva
exports.createReservation = async (req, res) => {
  try {
    const { volunteerId, date, time, description, isVideoCall } = req.body;
    const userId = req.session.user.id;

    // Validar que el volunteerId sea válido
    const volunteer = await Volunteer.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Voluntario no encontrado' });
    }

    await Reservation.create(userId, volunteerId, date, time, description, isVideoCall === 'on' || isVideoCall === true);

    return res.json({ success: true, message: 'Reserva creada exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Ocurrió un error al crear la reserva' });
  }
};

// Obtener las reservas del usuario actual
exports.getUserReservations = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const reservations = await Reservation.getByUserId(userId);
    return res.json({ success: true, reservations });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Ocurrió un error al obtener las reservas' });
  }
};

// Cancelar una reserva
exports.cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    await Reservation.update(id, 'cancelled');
    return res.json({ success: true, message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Ocurrió un error al cancelar la reserva' });
  }
};