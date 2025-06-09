import rateLimit from "express-rate-limit"
import logger from "../utils/logger.js"

// Custom handler for rate limit exceeded
const rateLimitHandler = (req, res) => {
  logger.warn(`Rate limit exceeded for IP: ${req.ip} on ${req.path}`)
  res.status(429).json({
    success: false,
    message: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
    retryAfter: Math.round(req.rateLimit.resetTime / 1000),
  })
}

// Auth endpoints rate limiter (más permisivo para desarrollo)
const authLimiter = rateLimit({
  windowMs: Number.parseInt(process.env.LOGIN_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number.parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 50, // Aumentado a 50 para desarrollo
  message: {
    success: false,
    message: "Demasiados intentos de autenticación. Intenta de nuevo en 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting for logout and user check
    return (req.method === "POST" && req.path === "/logout") || (req.method === "GET" && req.path === "/user")
  },
})

// General API rate limiter (más permisivo)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Aumentado a 1000 para desarrollo
  message: {
    success: false,
    message: "Demasiadas solicitudes. Intenta de nuevo más tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) => {
    // Skip rate limiting in development
    return process.env.NODE_ENV === "development"
  },
})

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Aumentado para desarrollo
  message: {
    success: false,
    message: "Demasiadas subidas de archivos. Intenta de nuevo en una hora.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
})

export const rateLimiters = {
  auth: authLimiter,
  general: generalLimiter,
  upload: uploadLimiter,
}
