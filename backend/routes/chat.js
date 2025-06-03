const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Lista de conversaciones
router.get('/', isAuthenticated, chatController.getConversations);

// Ver conversación específica
router.get('/:id', isAuthenticated, chatController.getConversation);

// Enviar mensaje
router.post('/send', isAuthenticated, chatController.sendMessage);

// Iniciar conversación con un usuario
router.get('/start/:id', isAuthenticated, chatController.startConversation);

module.exports = router;