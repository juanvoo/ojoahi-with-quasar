import express from "express"
import authController from "../controllers/authController.js"
import { validate, userSchemas } from "../utils/validation.js"

const router = express.Router()

// Register user
router.post("/register", validate(userSchemas.register), authController.register)

// Login user
router.post("/login", validate(userSchemas.login), authController.login)

// Logout user
router.post("/logout", authController.logout)

export default router
