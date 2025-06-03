const express = require('express');
const router = express.Router();

router.get('/opinions', (req, res) => {
  res.json({
    title: 'Opiniones sobre OjoAhi',
    opinions: [
      // Aquí puedes agregar opiniones de ejemplo o traerlas de una base de datos
      // { user: 'Ana', opinion: 'Me encanta OjoAhi, es muy útil.' }
    ]
  });
});

module.exports = router;