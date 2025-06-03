const Review = require('../models/Review');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Obtener datos para el formulario de creación de reseña
exports.getCreateReview = async (req, res) => {
  try {
    const reservationId = req.params.reservationId;
    let volunteer = null;
    const ratingLabels = [
      { value: 5, label: 'Excelente' },
      { value: 4, label: 'Muy bueno' },
      { value: 3, label: 'Bueno' },
      { value: 2, label: 'Regular' },
      { value: 1, label: 'Necesita mejorar' }
    ];

    if (reservationId) {
      const reservation = await Review.getReservationById(reservationId);
      if (!reservation) {
        return res.status(404).json({ success: false, message: 'Reserva no encontrada' });
      }
      volunteer = await User.findById(reservation.volunteer_id);
      return res.json({
        success: true,
        title: 'Dejar Reseña',
        reservationId,
        volunteer,
        ratingLabels
      });
    } else {
      const volunteers = await User.getVolunteers();
      return res.json({
        success: true,
        title: 'Dejar Reseña',
        volunteers,
        ratingLabels
      });
    }
  } catch (error) {
    console.error('Error al cargar el formulario de reseña:', error);
    return res.status(500).json({ success: false, message: 'Error al cargar el formulario' });
  }
};

// Crear una reseña
exports.postCreateReview = async (req, res) => {
  try {
    const reservationId = req.params.reservationId || null;
    const { volunteer_id, rating, comment } = req.body;
    const user_id = req.session.user.id;

    // Validación básica
    if (!volunteer_id || !rating || !comment) {
      return res.status(400).json({ success: false, message: 'Por favor, completa todos los campos requeridos' });
    }

    await Review.create(user_id, volunteer_id, reservationId, rating, comment);

    // Notificación para el voluntario
    await Notification.create({
      user_id: volunteer_id,
      title: 'Nueva reseña recibida',
      message: `Has recibido una nueva reseña con calificación de ${rating} estrellas.`,
      type: 'new_review'
    });

    return res.json({ success: true, message: 'Reseña enviada exitosamente' });
  } catch (error) {
    console.error('Error al crear la reseña:', error);
    return res.status(500).json({ success: false, message: 'Error al crear la reseña' });
  }
};

// Obtener reseñas de un voluntario
exports.getVolunteerReviews = async (req, res) => {
  try {
    const volunteerId = req.params.volunteerId;
    const volunteer = await User.findById(volunteerId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Voluntario no encontrado' });
    }

    const reviews = await Review.getByVolunteerId(volunteerId);
    const { averageRating, totalReviews } = await Review.getAverageRatingByVolunteerId(volunteerId);

    return res.json({
      success: true,
      title: `Reseñas de ${volunteer.username}`,
      volunteer,
      reviews,
      averageRating,
      totalReviews
    });
  } catch (error) {
    console.error('Error al cargar las reseñas del voluntario:', error);
    return res.status(500).json({ success: false, message: 'Error al cargar las reseñas' });
  }
};