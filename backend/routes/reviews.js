const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { isAuthenticated } = require('../middleware/auth');

// API para obtener datos necesarios para crear una reseña (si es necesario)
router.get('/create', isAuthenticated, reviewController.getCreateReview); // Debe devolver JSON si se usa
router.get('/create/:reservationId', isAuthenticated, reviewController.getCreateReview); // Debe devolver JSON si se usa

// API para crear una reseña
router.post('/create', isAuthenticated, reviewController.postCreateReview);
router.post('/create/:reservationId', isAuthenticated, reviewController.postCreateReview);

// API para ver las reseñas de un voluntario
router.get('/volunteer/:volunteerId', reviewController.getVolunteerReviews);

module.exports = router;