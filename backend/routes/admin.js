import express from "express"
import { isAuthenticated, isAdmin } from "../middleware/auth.js"
import adminController from "../controllers/adminController.js"
import { rateLimiters } from "../middleware/rateLimiter.js"

const router = express.Router()

// Aplicar middleware de autenticación y autorización a todas las rutas
router.use(isAuthenticated)
router.use(isAdmin)
router.use(rateLimiters.general)

// Dashboard principal
router.get("/dashboard", adminController.getDashboard)

// Gestión de usuarios
router.get("/users", adminController.getUsers)
router.post("/users/:userId/toggle-status", adminController.toggleUserStatus)
router.post("/users/:userId/verify", adminController.verifyUser)

// Monitoreo de solicitudes
router.get("/help-requests", adminController.getHelpRequests)
router.post("/help-requests/:requestId/reassign", adminController.reassignRequest)
router.post("/help-requests/:requestId/priority", adminController.updateRequestPriority)

// Analytics y reportes
router.get("/analytics", adminController.getAnalytics)
router.get("/export", adminController.exportData)

// Moderación y seguridad
router.get("/reports", adminController.getReports)
router.post("/reports/:reportId/handle", adminController.handleReport)
router.get("/security-alerts", adminController.getSecurityAlerts)

export default router