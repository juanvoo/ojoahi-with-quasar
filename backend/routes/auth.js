const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isNotAuthenticated } = require('../middleware/auth');

// Las vistas de login/registro ahora son responsabilidad del frontend (Quasar)

// Registro de usuario (API)
router.post('/register', isNotAuthenticated, authController.register);

// Login de usuario (API)
router.post('/login', isNotAuthenticated, authController.login);

// Logout de usuario (API)
router.get('/logout', authController.logout);

module.exports = router;