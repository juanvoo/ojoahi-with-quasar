// Este controlador es opcional en una API moderna, pero aquí tienes una versión migrada

function login(req, res) {
  // El frontend debería manejar la navegación a la página de login,
  // pero puedes devolver un status si se requiere
  return res.json({ success: true, message: "Mostrar formulario de login en el frontend." });
}

function register(req, res) {
  // El frontend debería manejar la navegación a la página de registro,
  // pero puedes devolver un status si se requiere
  return res.json({ success: true, message: "Mostrar formulario de registro en el frontend." });
}

module.exports = {
  login,
  register,
};