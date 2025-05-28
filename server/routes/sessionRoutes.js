const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const authMiddleware = require('../middlewares/authMiddleware');

// Proteger todas las rutas con autenticación
router.use(authMiddleware);

// Crear una nueva sesión
router.post('/', sessionController.createSession);

// Obtener todas las sesiones del instructor
router.get('/', sessionController.getInstructorSessions);

// Obtener una sesión específica
router.get('/:sessionId', sessionController.getSessionById);

// Actualizar una sesión
router.put('/:sessionId', sessionController.updateSession);

// Eliminar una sesión
router.delete('/:sessionId', sessionController.deleteSession);

module.exports = router; 