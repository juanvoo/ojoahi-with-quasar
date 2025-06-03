const Volunteer = require('../models/Volunteer');
const Reservation = require('../models/Reservation');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Message = require('../models/Message');

// Dashboard para voluntarios
exports.volunteerDashboard = async (req, res) => {
  try {
    const volunteer = await Volunteer.findByUserId(req.session.user.id);

    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'No se encontró el perfil de voluntario' });
    }

    const reservations = await Reservation.getByVolunteerId(volunteer.id);
    const reviews = await Review.getByVolunteerId(volunteer.id);

    return res.json({
      success: true,
      user: req.session.user,
      volunteer,
      reservations,
      reviews
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al cargar el dashboard' });
  }
};

// Dashboard para usuarios ciegos
exports.blindDashboard = async (req, res) => {
  try {
    const user = req.session.user;

    // Obtener reservas del usuario
    const reservations = await Reservation.find({
      user_id: user.id,
      sort: { date: -1 }
    });

    // Obtener reseñas hechas por el usuario
    const reviews = await Review.find({
      user_id: user.id,
      sort: { created_at: -1 }
    });

    // Obtener notificaciones no leídas
    const notifications = await Notification.find({
      user_id: user.id,
      unread: true,
      sort: { created_at: -1 }
    });

    // Obtener cantidad de mensajes no leídos
    const unreadMessages = await Message.countUnread(user.id);

    // Formatear los datos para el frontend
    const formattedReservations = reservations.map(reservation => ({
      id: reservation.id,
      date: reservation.date,
      time: reservation.time,
      volunteer_name: reservation.volunteer_name,
      volunteer_id: reservation.volunteer_id,
      description: reservation.description,
      status: reservation.status
    }));

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      volunteer_name: review.volunteer_name,
      rating: review.rating,
      comment: review.comment,
      created_at: review.created_at
    }));

    const formattedNotifications = notifications.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      created_at: notification.created_at,
      unread: notification.unread
    }));

    return res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      },
      reservations: formattedReservations,
      reviews: formattedReviews,
      notifications: formattedNotifications,
      unreadMessages
    });

  } catch (error) {
    console.error('Error en blind dashboard:', error);
    return res.status(500).json({ success: false, message: 'Hubo un error al cargar el dashboard' });
  }
};

// Marcar una notificación como leída
exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.session.user.id;

    await Notification.markAsRead(notificationId, userId);

    return res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar notificación como leída:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al marcar la notificación como leída'
    });
  }
};

// Marcar todas las notificaciones como leídas
exports.markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.session.user.id;

    await Notification.markAllAsRead(userId);

    return res.json({ success: true });
  } catch (error) {
    console.error('Error al marcar todas las notificaciones como leídas:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al marcar las notificaciones como leídas'
    });
  }
};

// Cancelar una reserva
exports.cancelReservation = async (req, res) => {
  try {
    const { reservationId } = req.params;
    const userId = req.session.user.id;

    const reservation = await Reservation.findOne({
      id: reservationId,
      user_id: userId
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        error: 'Reserva no encontrada'
      });
    }

    if (reservation.status !== 'pending') {
      return res.status(400).json({
        success: false,
        error: 'Solo se pueden cancelar reservas pendientes'
      });
    }

    await Reservation.cancel(reservationId);

    await Notification.create({
      user_id: reservation.volunteer_id,
      title: 'Reserva cancelada',
      message: `${req.session.user.username} ha cancelado la reserva del ${new Date(reservation.date).toLocaleDateString()}`,
      type: 'assistance'
    });

    return res.json({ success: true });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al cancelar la reserva'
    });
  }
};

// Obtener estado del chat
exports.getChatStatus = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const unreadCount = await Message.countUnread(userId);

    return res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Error al obtener estado del chat:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener estado del chat'
    });
  }
};