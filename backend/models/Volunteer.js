const pool = require('../config/database');

class Volunteer {
  static async getAll() {
    try {
      const [rows] = await pool.execute('SELECT * FROM volunteers');
      return rows;
    } catch (error) {
      console.error('Error al obtener todos los voluntarios:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute('SELECT * FROM volunteers WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      console.error('Error al buscar voluntario por ID:', error);
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      const [rows] = await pool.execute('SELECT * FROM volunteers WHERE user_id = ?', [userId]);
      return rows[0];
    } catch (error) {
      console.error('Error al buscar voluntario por user_id:', error);
      throw error;
    }
  }

  static async create(userId, bio, skills, availability) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO volunteers (user_id, bio, skills, availability) VALUES (?, ?, ?, ?)',
        [userId, bio, skills, availability]
      );
      return result.insertId;
    } catch (error) {
      console.error('Error al crear voluntario:', error);
      throw error;
    }
  }

  static async update(id, bio, skills, availability) {
    try {
      await pool.execute(
        'UPDATE volunteers SET bio = ?, skills = ?, availability = ? WHERE id = ?',
        [bio, skills, availability, id]
      );
    } catch (error) {
      console.error('Error al actualizar voluntario:', error);
      throw error;
    }
  }
}

module.exports = Volunteer;