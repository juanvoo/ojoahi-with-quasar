const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const volunteerController = require('../controllers/volunteerController');
const helpRequestController = require('../controllers/helpRequestController');

// API: Obtener perfil y datos para dashboard del usuario actual
router.get('/profile', isAuthenticated, (req, res) => {
  res.json({ 
    title: 'Su Dashboard', 
    user: req.session.user 
  });
});

// API: Lista de voluntarios (solo para usuarios tipo 'blind')
router.get('/volunteer-list', isAuthenticated, (req, res, next) => {
  if (req.session.user.userType !== 'blind') {
    return res.status(403).json({ error: 'Solo usuarios ciegos pueden acceder a esta lista.' });
  }
  volunteerController.getAllVolunteers(req, res, next);
});

// API: Mostrar formulario de solicitud de ayuda (puedes devolver datos necesarios para el formulario)
router.get('/request-help/:volunteerId', isAuthenticated, (req, res, next) => {
  if (req.session.user.userType !== 'blind') {
    return res.status(403).json({ error: 'Solo usuarios ciegos pueden solicitar ayuda.' });
  }
  helpRequestController.showRequestForm(req, res, next);
});

// API: Enviar solicitud de ayuda
router.post('/request-help', isAuthenticated, (req, res, next) => {
  if (req.session.user.userType !== 'blind') {
    return res.status(403).json({ error: 'Solo usuarios ciegos pueden solicitar ayuda.' });
  }
  helpRequestController.submitRequest(req, res, next);
});

module.exports = router;