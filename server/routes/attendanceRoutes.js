const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// Obtener las sesiones programadas del instructor
router.get('/sessions', attendanceController.getScheduledSessions);

// Obtener los participantes de una sesión específica
router.get('/sessions/:sessionId/participants', attendanceController.getSessionParticipants);

// Registrar asistencia para una sesión
router.post('/sessions/:sessionId/register', attendanceController.registerAttendance);

// Actualizar un registro de asistencia específico
router.put('/attendance/:attendanceId', attendanceController.updateAttendance);

// Obtener registros de asistencia con filtros
router.get('/records', attendanceController.getAttendanceRecords);

module.exports = router; 