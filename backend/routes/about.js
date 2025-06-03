const express = require('express');
const router = express.Router();

router.get('/about', (req, res) => {
  res.json({
    title: 'Sobre OjoAhi',
    description: 'OjoAhi es una plataforma para ...' // Puedes poner aquí una breve descripción de tu app
  });
});

module.exports = router;