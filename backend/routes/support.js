const express = require("express")
const router = express.Router()
const { isAuthenticated } = require("../middleware/auth")
const supportChatController = require("../controllers/supportChatController")

// API principal de ayuda (debe devolver JSON o puedes eliminarla si la ayuda va en el frontend)
router.get("/help", supportChatController.getHelp)

// Chat de soporte (requiere autenticación)
// Todas estas rutas deben devolver JSON y ser consumidas por el frontend Quasar
router.get("/", isAuthenticated, supportChatController.getIndex)
router.get("/chat/:id", isAuthenticated, supportChatController.getSession)
router.post("/create", isAuthenticated, supportChatController.createSession)
router.post("/send", isAuthenticated, supportChatController.sendMessage)
router.get("/close/:id", isAuthenticated, supportChatController.closeSession)

module.exports = router