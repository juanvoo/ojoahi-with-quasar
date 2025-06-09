import pool from '../config/database.js';
class Review {
  static async create(userId, volunteerId, reservationId, rating, comment) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO reviews (user_id, volunteer_id, reservation_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
        [userId, volunteerId, reservationId, rating, comment]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error al crear la reseña:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, u.username as volunteer_name 
         FROM reviews r 
         JOIN users u ON r.volunteer_id = u.id 
         WHERE r.user_id = ?
         ORDER BY r.created_at DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener las reseñas del usuario:', error);
      throw error;
    }
  }

  static async getByVolunteerId(volunteerId) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, u.username as user_name 
         FROM reviews r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.volunteer_id = ?
         ORDER BY r.created_at DESC`,
        [volunteerId]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener las reseñas del voluntario:', error);
      throw error;
    }
  }

  static async getReservationById(reservationId) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, u.username as volunteer_name 
         FROM reservations r 
         JOIN users u ON r.volunteer_id = u.id 
         WHERE r.id = ?`,
        [reservationId]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al obtener la reserva:', error);
      throw error;
    }
  }

  static async getAverageRatingByVolunteerId(volunteerId) {
    try {
      const [rows] = await pool.execute(
        `SELECT AVG(rating) as average_rating, COUNT(*) as total_reviews 
         FROM reviews 
         WHERE volunteer_id = ?`,
        [volunteerId]
      );
      return {
        averageRating: Number(rows[0]?.average_rating) || 0,
        totalReviews: Number(rows[0]?.total_reviews) || 0
      };
    } catch (error) {
      console.error('Error al obtener la calificación promedio del voluntario:', error);
      throw error;
    }
  }
}

export default Review;