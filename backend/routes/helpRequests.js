const express = require('express');
const router = express.Router();
const helpRequestController = require('../controllers/helpRequestController');
const { isAuthenticated } = require('../middleware/auth');

// API para obtener datos necesarios para crear una solicitud de ayuda
router.get('/create', isAuthenticated, helpRequestController.getCreateHelpRequest); // Debe devolver JSON

// API para crear una solicitud de ayuda
router.post('/create', isAuthenticated, helpRequestController.postCreateHelpRequest);

// API para aceptar una solicitud de ayuda
router.get('/accept/:id', isAuthenticated, helpRequestController.acceptHelpRequest);

// API para rechazar una solicitud de ayuda
router.get('/reject/:id', isAuthenticated, helpRequestController.rejectHelpRequest);

// API para ver todas las solicitudes pendientes (para voluntarios)
router.get('/pending', isAuthenticated, helpRequestController.getPendingHelpRequests);

module.exports = router;