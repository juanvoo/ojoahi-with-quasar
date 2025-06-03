import User from '../models/User.js';
import bcrypt from 'bcrypt';

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación básica
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Por favor, ingresa email y contraseña' });
    }

    // Buscar usuario por email
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    // Verificar contraseña
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Email o contraseña incorrectos' });
    }

    // Guardar usuario en sesión (o generar token JWT)
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_admin: user.is_admin
    };

    console.log(`Usuario ${user.username} (ID: ${user.id}) ha iniciado sesión. Rol: ${user.role}`);

    return res.json({ 
      success: true, 
      message: 'Has iniciado sesión exitosamente', 
      user: req.session.user 
    });
  } catch (error) {
    console.error('Error en el login:', error);
    return res.status(500).json({ success: false, message: 'Error en el inicio de sesión' });
  }
};

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    console.log('Datos recibidos:', req.body);

    // Validación básica
    if (!username || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Por favor, rellena todos los campos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'El email ya está registrado' });
    }

    // Crear nuevo usuario
    const userId = await User.create({ 
      username, 
      email, 
      password, 
      role,
      user_type: role // Asegurarse de que user_type y role sean iguales
    });
    console.log('Usuario creado con ID:', userId);

    return res.json({ success: true, message: 'Te has registrado exitosamente' });
  } catch (error) {
    console.error('Error en el registro:', error);
    return res.status(500).json({ success: false, message: 'Error en el registro' });
  }
};

// LOGOUT
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).json({ success: false, message: 'Error al cerrar sesión' });
    }
    res.json({ success: true, message: 'Sesión cerrada correctamente' });
  });
};

// EXPORTAR TODOS LOS CONTROLADORES JUNTOS
export default { login, register, logout };