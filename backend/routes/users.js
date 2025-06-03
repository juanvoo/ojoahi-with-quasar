const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { isAuthenticated } = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../public/uploads/profiles');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const userId = req.session.user.id;
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${userId}_${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Controladores
const userController = require('../controllers/userController');

// Obtener perfil del usuario autenticado
router.get('/profile', isAuthenticated, userController.getProfile);

// Editar perfil (GET: obtiene datos, POST: actualiza)
router.get('/profile/edit', isAuthenticated, userController.getEditProfile);
router.post('/profile/edit', isAuthenticated, userController.postEditProfile);

// Cambiar contraseña
router.get('/profile/change-password', isAuthenticated, userController.getChangePassword);
router.post('/profile/change-password', isAuthenticated, userController.postChangePassword);

// Dashboard (devolver datos para dashboard según rol)
router.get('/dashboard', isAuthenticated, userController.getDashboardData);

// Subida de imagen de perfil y edición de campos (nuevo sistema)
router.post('/profile/upload', isAuthenticated, upload.single('profile_image'), userController.uploadProfileImage);

// Refrescar datos de sesión
router.get('/profile/refresh', isAuthenticated, userController.refreshSession);

// Listar voluntarios disponibles (solo para usuarios ciegos)
router.get('/volunteers', isAuthenticated, userController.getVolunteers);

// Ver perfil de voluntario específico
router.get('/volunteers/:id', isAuthenticated, userController.getVolunteerProfile);

// Ver perfil público de un voluntario (para todos)
router.get('/profile/:id', isAuthenticated, userController.getPublicProfile);

module.exports = router;