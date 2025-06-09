import User from '../models/User.js';
import Reservation from '../models/Reservation.js';
import Review from '../models/Review.js';
import HelpRequest from '../models/HelpRequest.js';
import path from 'path';
import fs from "fs";
import router from '../routes/auth.js';

// Dashboard del usuario (ciego o voluntario)
export const getDashboard = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Por favor inicia sesión para acceder' });
    }

    const userId = req.session.user.id;
    const userRole = req.session.user.role;

    if (userRole === 'blind') {
      const helpRequests = await HelpRequest.getByUserId(userId);
      const reviews = await Review.getByUserId(userId);

      return res.json({
        success: true,
        user: req.session.user,
        reservations: helpRequests,
        reviews,
        title: 'Dashboard'
      });

    } else if (userRole === 'volunteer') {
      const pool = require('../config/database');
      const [directReservations] = await pool.execute(
        'SELECT * FROM reservations WHERE volunteer_id = ?',
        [userId]
      );

      const reservations = await Reservation.getByVolunteerId(userId);
      const reviews = await Review.getByVolunteerId(userId);
      const pendingRequests = await HelpRequest.getPendingByVolunteerId(userId);

      return res.json({
        success: true,
        user: req.session.user,
        reservations,
        reviews,
        pendingRequests,
        title: 'Dashboard'
      });
    }

    return res.status(400).json({ success: false, message: 'Tipo de usuario no válido' });
  } catch (error) {
    console.error('Error al cargar el dashboard:', error);
    return res.status(500).json({ success: false, message: 'Error al cargar el dashboard' });
  }
};

// Obtener el perfil del usuario
export const getProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const forceRefresh = req.query.refresh === 'true';

    // Si se solicita un refresco forzado, limpiar la caché de la sesión
    if (forceRefresh) {
      delete req.session.user;
      req.session.save();
    }

    // Obtener datos directamente de la base de datos
    const pool = require('../config/database');
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    // Obtener estadísticas si es un voluntario (puedes añadir campos aquí)
    let stats = {};
    if (user.role === 'volunteer') {
      // stats = ... // Lógica de estadísticas
    }

    // Actualizar la sesión con los datos más recientes
    req.session.user = user;

    return res.json({
      success: true,
      title: 'Mi Perfil',
      user,
      ...stats
    });
  } catch (error) {
    console.error('Error al cargar el perfil:', error);
    return res.status(500).json({ success: false, message: 'Error al cargar el perfil' });
  }
};

// Obtener formulario de edición de perfil
export const getEditProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;

    // Obtener datos directamente de la base de datos
    const pool = require('../config/database');
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    const user = rows[0];

    return res.json({ success: true, title: 'Editar Perfil', user });
  } catch (error) {
    console.error('Error al cargar el formulario de edición:', error);
    return res.status(500).json({ success: false, message: 'Error al cargar el formulario' });
  }
};

// Editar perfil del usuario
export const postEditProfile = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { username, name, email, phone, address, bio, availability } = req.body;

    const pool = require('../config/database');

    // Validar email único
    if (email) {
      const [emailCheck] = await pool.execute(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, userId]
      );
      if (emailCheck.length > 0) {
        return res.status(409).json({ success: false, message: 'El email ya está en uso por otro usuario' });
      }
    }

    // Validar username único
    if (username) {
      const [usernameCheck] = await pool.execute(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, userId]
      );
      if (usernameCheck.length > 0) {
        return res.status(409).json({ success: false, message: 'El nombre de usuario ya está en uso' });
      }
    }

    // Obtener las columnas disponibles
    const [columns] = await pool.execute('SHOW COLUMNS FROM users');
    const columnNames = columns.map(col => col.Field);

    // Construir la consulta SQL dinámicamente
    let sql = 'UPDATE users SET ';
    const updateFields = [];
    const params = [];

    // Solo incluir campos que existen en la tabla
    if (username && columnNames.includes('username')) {
      updateFields.push('username = ?');
      params.push(username);
    }

    if (columnNames.includes('name')) {
      updateFields.push('name = ?');
      params.push(name || '');
    }

    if (email && columnNames.includes('email')) {
      updateFields.push('email = ?');
      params.push(email);
    }

    if (columnNames.includes('phone')) {
      updateFields.push('phone = ?');
      params.push(phone || '');
    }

    if (columnNames.includes('address')) {
      updateFields.push('address = ?');
      params.push(address || '');
    }

    if (columnNames.includes('bio')) {
      updateFields.push('bio = ?');
      params.push(bio || '');
    }

    if (columnNames.includes('availability')) {
      updateFields.push('availability = ?');
      params.push(availability || '');
    }

    // Si no hay campos para actualizar, devolver el usuario actual
    if (updateFields.length === 0) {
      return res.json({ success: true, message: 'No se realizaron cambios' });
    }

    // Añadir la fecha de actualización si existe
    if (columnNames.includes('updated_at')) {
      updateFields.push('updated_at = NOW()');
    }

    sql += updateFields.join(', ');
    sql += ' WHERE id = ?';
    params.push(userId);

    await pool.execute(sql, params);

    // Manejar la subida de imagen si existe
    if (req.files && req.files.profile_image) {
      const profileImage = req.files.profile_image;
      const uploadDir = path.join(__dirname, '../public/uploads/profiles');

      // Crear el directorio si no existe
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const uploadPath = path.join(uploadDir, `${userId}_${Date.now()}${path.extname(profileImage.name)}`);

      // Mover la imagen al directorio de uploads
      await profileImage.mv(uploadPath);

      // Actualizar la ruta de la imagen en la base de datos
      const imagePath = `/uploads/profiles/${path.basename(uploadPath)}`;
      await pool.execute(
        'UPDATE users SET profile_image = ? WHERE id = ?',
        [imagePath, userId]
      );
    }

    // Obtener los datos actualizados
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);
    req.session.user = rows[0];

    req.session.save(err => {
      if (err) {
        console.error('Error al guardar la sesión:', err);
      }
      return res.json({ success: true, message: 'Perfil actualizado correctamente', user: rows[0] });
    });
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error al actualizar el perfil' });
  }
};

// Obtener formulario de cambio de contraseña
export const getChangePassword = (req, res) => {
  return res.json({ success: true, title: 'Cambiar Contraseña' });
};

// Cambiar la contraseña del usuario
export const postChangePassword = async (req, res) => {
  try {
    const userId = req.session.user.id;
    const { current_password, new_password, confirm_password } = req.body;

    // Validar que las contraseñas coincidan
    if (new_password !== confirm_password) {
      return res.status(400).json({ success: false, message: 'Las contraseñas no coinciden' });
    }

    // Validar longitud mínima
    if (new_password.length < 6) {
      return res.status(400).json({ success: false, message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    // Cambiar la contraseña
    await User.changePassword(userId, current_password, new_password);

    return res.json({ success: true, message: 'Contraseña cambiada correctamente' });
  } catch (error) {
    console.error('Error al cambiar la contraseña:', error);
    return res.status(500).json({ success: false, message: error.message || 'Error al cambiar la contraseña' });
  }
};

export default router;