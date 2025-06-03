const User = require('../models/User');
const Review = require('../models/Review');
const HelpRequest = require('../models/HelpRequest');

// Obtener la lista de todos los voluntarios
exports.getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await User.getAllVolunteers();
    return res.json({ 
      success: true,
      title: 'Lista de Voluntarios',
      volunteers,
      user: req.session.user
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Error al obtener la lista de voluntarios' });
  }
};

// (Opcional) Dashboard del voluntario - si lo descomentas y lo necesitas
// exports.getVolunteerDashboard = async (req, res) => {
//   try {
//     const volunteerId = req.session.user.id;
//     if (!volunteerId) {
//       return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
//     }

//     const volunteer = await User.findById(volunteerId);
//     if (!volunteer) {
//       return res.status(404).json({ success: false, message: 'Voluntario no encontrado' });
//     }

//     const reviews = await Review.getReviewsForVolunteer(volunteerId);
//     const helpRequests = await HelpRequest.getRequestsForVolunteer(volunteerId);

//     return res.json({
//       success: true,
//       title: 'Dashboard del Voluntario',
//       volunteer,
//       reviews,
//       helpRequests
//     });
//   } catch (error) {
//     console.error('Error en el dashboard del voluntario:', error);
//     return res.status(500).json({ success: false, message: 'Hubo un error al cargar tu dashboard. Por favor, intenta de nuevo más tarde.' });
//   }
// };

// Aceptar solicitud de ayuda
exports.acceptHelpRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    await HelpRequest.updateStatus(requestId, 'accepted');
    return res.json({ success: true, message: 'Solicitud de ayuda aceptada con éxito' });
  } catch (error) {
    console.error('Error al aceptar la solicitud de ayuda:', error);
    return res.status(500).json({ success: false, message: 'Hubo un error al aceptar la solicitud. Por favor, intenta de nuevo.' });
  }
};

// Rechazar solicitud de ayuda
exports.rejectHelpRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    await HelpRequest.updateStatus(requestId, 'rejected');
    return res.json({ success: true, message: 'Solicitud de ayuda rechazada' });
  } catch (error) {
    console.error('Error al rechazar la solicitud de ayuda:', error);
    return res.status(500).json({ success: false, message: 'Hubo un error al rechazar la solicitud. Por favor, intenta de nuevo.' });
  }
};