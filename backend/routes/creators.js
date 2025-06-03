const express = require('express');
const router = express.Router();

router.get('/creators', (req, res) => {
  res.json({
    title: 'Creadores de OjoAhi',
    creators: [
      // Coloca aquí nombres, roles, enlaces, etc.
      // Ejemplo:
      // { name: 'Juan Pérez', role: 'Desarrollador', link: 'https://github.com/juanperez' }
    ]
  });
});

module.exports = router;