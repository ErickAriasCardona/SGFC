const express = require('express');
const router = express.Router();
const disponibilidadController = require('../controllers/disponibilidadInstructorController');
const notificacionController = require('../controllers/notificacionInstructorController');
const { verificarToken, verificarRol } = require('../middleware/authMiddleware');

// Rutas de disponibilidad
router.post('/disponibilidad', 
  verificarToken, 
  verificarRol(['administrador', 'instructor']), 
  disponibilidadController.crearDisponibilidad
);

router.get('/disponibilidad', 
  verificarToken, 
  disponibilidadController.consultarDisponibilidad
);

router.put('/disponibilidad/:id', 
  verificarToken, 
  verificarRol(['administrador', 'instructor']), 
  disponibilidadController.actualizarDisponibilidad
);

router.post('/disponibilidad/validar-conflictos', 
  verificarToken, 
  disponibilidadController.validarConflictos
);

// Rutas de notificaciones
router.post('/notificaciones/asignacion-curso', 
  verificarToken, 
  verificarRol(['administrador']), 
  notificacionController.notificarAsignacionCurso
);

router.post('/notificaciones/cursos-disponibles', 
  verificarToken, 
  verificarRol(['administrador']), 
  notificacionController.notificarCursosDisponibles
);

router.post('/notificaciones/:notificacion_id/respuesta', 
  verificarToken, 
  verificarRol(['instructor']), 
  notificacionController.registrarRespuesta
);

router.get('/notificaciones/trazabilidad', 
  verificarToken, 
  verificarRol(['administrador']), 
  notificacionController.consultarTrazabilidad
);

module.exports = router;