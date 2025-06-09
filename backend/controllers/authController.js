import User from "../models/User.js"
import bcrypt from "bcrypt"
import logger from "../utils/logger.js"
import { asyncHandler } from "../middleware/errorHandler.js"

// LOGIN
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  logger.info(`🔐 Login attempt for: ${email}`)

  try {
    // Buscar usuario
    const user = await User.findByEmail(email)
    if (!user) {
      logger.warn(`❌ User not found: ${email}`)
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      })
    }

    // Verificar contraseña
    let isMatch = false

    if (user.password.startsWith("$2")) {
      isMatch = await bcrypt.compare(password, user.password)
    } else {
      isMatch = password === user.password
      // Migrar contraseña si es texto plano
      if (isMatch) {
        await User.migratePassword(user.id, password)
      }
    }

    if (!isMatch) {
      logger.warn(`❌ Invalid password for user: ${user.username}`)
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      })
    }

    // Crear sesión
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      is_admin: user.is_admin || false,
    }

    // Forzar guardado de sesión
    req.session.save((err) => {
      if (err) {
        logger.error(`❌ Error saving session: ${err.message}`)
        return res.status(500).json({
          success: false,
          message: "Error interno del servidor",
        })
      }

      logger.info(`✅ Login successful for: ${user.username}`)

      res.json({
        success: true,
        message: "Inicio de sesión exitoso",
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      })
    })
  } catch (error) {
    logger.error(`❌ Login error: ${error.message}`)

    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
    })
  }
})

// REGISTER
export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body

  logger.info(`📝 Registration attempt for: ${email}`)

  // Check if user already exists
  const existingUser = await User.findByEmail(email)
  if (existingUser) {
    logger.warn(`❌ Email already registered: ${email}`)
    return res.status(409).json({
      success: false,
      message: "El email ya está registrado",
    })
  }

  // Create new user
  const userId = await User.create({
    username,
    email,
    password,
    role,
    user_type: role,
  })

  logger.info(`✅ User registered: ${username} (ID: ${userId})`)

  res.status(201).json({
    success: true,
    message: "Usuario registrado exitosamente",
    userId,
  })
})

// LOGOUT
export const logout = asyncHandler(async (req, res) => {
  const username = req.session?.user?.username

  logger.info(`👋 Logout for: ${username || "unknown user"}`)

  // Destroy session
  req.session.destroy((err) => {
    if (err) {
      logger.error("❌ Error destroying session:", err)
      return res.status(500).json({
        success: false,
        message: "Error al cerrar sesión",
      })
    }

    // Clear cookie
    res.clearCookie("ojoahi.sid", {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    })

    logger.info(`✅ Session closed for: ${username || "unknown user"}`)

    res.json({
      success: true,
      message: "Sesión cerrada correctamente",
    })
  })
})

export default { login, register, logout }
