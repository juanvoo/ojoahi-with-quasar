const pool = require('../config/database');

class Notification {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.title = data.title;
    this.content = data.content || data.message || ''; // Soporte para diferentes nombres de columna
    this.type = data.type || 'general';
    this.link = data.link || null;
    this.is_read = data.is_read || 0;
    this.created_at = data.created_at;
  }

  static async createTable() {
    const connection = await pool.getConnection();
    try {
      // Intentar crear la tabla si no existe
      await connection.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NOT NULL,
          title VARCHAR(255) NOT NULL,
          content TEXT NOT NULL,
          type VARCHAR(50) DEFAULT 'general',
          link VARCHAR(255),
          is_read TINYINT(1) DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      console.log('Tabla de notificaciones creada o ya existente');
    } catch (error) {
      console.error('Error al crear/verificar la tabla de notificaciones:', error);
      throw error;
    } finally {
      connection.release();
    }
  }

  static async create(data) {
    try {
      if (data.user_id === undefined) throw new Error('El ID del usuario es requerido');
      if (data.title === undefined) throw new Error('El título es requerido');

      const [result] = await pool.execute(
        `INSERT INTO notifications (user_id, title, content, type, link)
         VALUES (?, ?, ?, ?, ?)`,
        [
          data.user_id,
          data.title,
          data.content || data.message || '',
          data.type || 'general',
          data.link || null
        ]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error al crear notificación:', error);
      throw error;
    }
  }

  static async getByUserId(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 10',
        [userId]
      );
      return rows;
    } catch (error) {
      console.error('Error al obtener notificaciones del usuario:', error);
      throw error;
    }
  }

  static async markAsRead(notificationId) {
    try {
      await pool.execute(
        'UPDATE notifications SET is_read = 1 WHERE id = ?',
        [notificationId]
      );
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
      throw error;
    }
  }

  static async getUnreadCount(userId) {
    try {
      const [rows] = await pool.execute(
        'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
        [userId]
      );
      return rows[0]?.count || 0;
    } catch (error) {
      console.error('Error al obtener conteo de notificaciones no leídas:', error);
      throw error;
    }
  }
}

module.exports = Notification;