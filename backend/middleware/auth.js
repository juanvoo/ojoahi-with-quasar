import logger from "../utils/logger.js"

export const isAuthenticated = (req, res, next) => {
  logger.info(`🔐 Verificando autenticación para: ${req.path}`)
  logger.info(`📝 Sesión actual:`, req.session)

  if (req.session?.user) {
    logger.info(`✅ Usuario autenticado: ${req.session.user.username}`)
    return next()
  }

  logger.warn(`❌ Acceso no autorizado a ${req.path} desde IP: ${req.ip}`)
  return res.status(401).json({
    success: false,
    message: "Debes iniciar sesión para acceder a este recurso",
  })
}

export const isNotAuthenticated = (req, res, next) => {
  logger.info(`🔓 Verificando que NO esté autenticado para: ${req.path}`)
  logger.info(`📝 Sesión actual:`, req.session)

  if (req.session?.user) {
    logger.info(`⚠️ Usuario ya autenticado: ${req.session.user.username}`)
    return res.status(403).json({
      success: false,
      message: "Ya has iniciado sesión",
    })
  }

  logger.info(`✅ Usuario no autenticado, permitiendo acceso`)
  next()
}

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({
        success: false,
        message: "Debes iniciar sesión",
      })
    }

    if (!roles.includes(req.session.user.role)) {
      logger.warn(`Acceso denegado para rol ${req.session.user.role} a ${req.path}`)
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para acceder a este recurso",
      })
    }

    next()
  }
}

export const isAdmin = requireRole("admin")
export const isVolunteer = requireRole("volunteer", "admin")
export const isBlind = requireRole("blind", "admin")
