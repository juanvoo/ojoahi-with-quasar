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
// router.get('/logout', authController.logout);

router.post('/logout', (req, res) => {
  res.clearCookie('nombre_de_tu_cookie_de_sesion'); // Cambia por el nombre real
  req.session?.destroy?.(); // Solo si usas sesiones
  res.json({ success: true });
});

export default router;