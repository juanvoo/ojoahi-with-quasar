module.exports = {
  isAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) {
      return next();
    }
    return res.status(401).json({ success: false, message: 'Por favor, inicia sesión para acceder' });
  },

  isNotAuthenticated: (req, res, next) => {
    if (req.session && req.session.user) {
      return res.status(403).json({ success: false, message: 'Ya has iniciado sesión' });
    }
    next();
  },

  isAdmin: (req, res, next) => {
    if (req.session.user && (req.session.user.userType === 'admin' || req.session.user.role === 'admin')) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Acceso denegado' });
  }
};