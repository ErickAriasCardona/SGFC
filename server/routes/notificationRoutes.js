const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// Obtener notificaciones del usuario
router.get('/', notificationController.getUserNotifications);

// Marcar una notificación como leída
router.put('/:notificationId/read', notificationController.markNotificationAsRead);

// Enviar notificaciones de inasistencia manualmente (solo instructores)
router.post('/sessions/:sessionId/absence-notifications', notificationController.sendManualAbsenceNotification);

module.exports = router; 