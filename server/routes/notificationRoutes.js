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
router.post('/attendance/:attendanceId/absence-notifications', notificationController.sendManualAbsenceNotification);

// Enviar notificación de nuevo curso
router.post('/course/:courseId/new-course', notificationController.sendNewCourseNotification);

// Enviar notificación de actualización de curso
router.post('/course/:courseId/update', notificationController.sendCourseUpdateNotification);

// Enviar notificación de cambio de contraseña
router.post('/password-change/:userId', notificationController.sendPasswordChangeNotification);

// Enviar notificación de actualización de perfil
router.post('/profile-update/:userId', notificationController.sendProfileUpdateNotification);

// Enviar notificación de inscripción a curso
router.post('/enrollment/:courseId/:apprenticeId', notificationController.sendEnrollmentNotification);

// Enviar notificación de asignación de instructor
router.post('/instructor-assignment/:courseId/:instructorId', notificationController.sendInstructorAssignmentNotification);

module.exports = router; 