const pool = require('../config/database');

class Reservation {
  static async create({ user_id, volunteer_id, date, time, notes, status = 'pending', help_request_id = null }) {
    try {
      const sql = `
        INSERT INTO reservations 
        (user_id, volunteer_id, date, time, notes, status, help_request_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [user_id, volunteer_id, date, time, notes, status, help_request_id];
      const [result] = await pool.execute(sql, params);
      return result.insertId;
    } catch (error) {
      console.error('Error al crear la reserva:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, u.username as volunteer_name 
         FROM reservations r 
         LEFT JOIN users u ON r.volunteer_id = u.id 
         WHERE r.id = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      console.error('Error al obtener reserva por ID:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, u.username as volunteer_name 
         FROM reservations r 
         LEFT JOIN users u ON r.volunteer_id = u.id 
         WHERE r.user_id = ?
         ORDER BY r.date DESC, r.time DESC`,
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener las reservas del usuario:', error);
      throw error;
    }
  }

  static async getByVolunteerId(volunteerId) {
    try {
      const [rows] = await pool.execute(
        `SELECT r.*, u.username as user_name, r.status
         FROM reservations r 
         JOIN users u ON r.user_id = u.id 
         WHERE r.volunteer_id = ? AND r.status IN ('accepted', 'rejected')
         ORDER BY r.date DESC, r.time DESC`,
        [volunteerId]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener las reservas del voluntario:', error);
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await pool.execute(
        'UPDATE reservations SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar el estado de la reserva:', error);
      throw error;
    }
  }

  static async cancel(id) {
    try {
      const [result] = await pool.execute(
        'UPDATE reservations SET status = ? WHERE id = ?',
        ['cancelled', id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al cancelar reserva:', error);
      throw error;
    }
  }
}

module.exports = Reservation;