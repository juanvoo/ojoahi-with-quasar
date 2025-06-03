
export function isNotAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return res.status(403).json({ success: false, message: 'Ya has iniciado sesión.' });
  }
  next();
}

// Si tienes más middlewares, expórtalos igual:
export function isAuthenticated(req, res, next) {
  if (req.session && req.session.user) {
    return next();
  }
  return res.status(401).json({ success: false, message: 'Debes iniciar sesión.' });
}

export function  isAdmin (req, res, next) {
    if (req.session.user && (req.session.user.userType === 'admin' || req.session.user.role === 'admin')) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
