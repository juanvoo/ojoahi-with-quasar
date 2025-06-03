import express from 'express';
const router = express.Router();
import authController from '../controllers/authController.js';
import { isNotAuthenticated } from '../middleware/auth.js';

// Las vistas de login/registro ahora son responsabilidad del frontend (Quasar)

// Registro de usuario (API)
router.post('/register', isNotAuthenticated, authController.register);

// Login de usuario (API)
router.post('/login', isNotAuthenticated, authController.login);

// Logout de usuario (API)
router.get('/logout', authController.logout);

export default router;