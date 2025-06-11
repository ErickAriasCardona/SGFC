const express = require("express");
const router = express.Router();
const cursoController = require("../controllers/cursoController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multer");
const { crearOActualizarInscripcion } = require('../controllers/inscripcionCursoController');

// Rutas públicas (no requieren autenticación)
router.get("/cursos", cursoController.getAllCursos);
router.get("/cursos/:id", cursoController.getCursoById);
router.get('/searchCurso', cursoController.getCursoByNameOrFicha)

router.use(authMiddleware);
// Crear Curso
router.post("/cursos", upload.single("imagen"), cursoController.createCurso);

// Actualizar un curso
router.put("/cursos/:id", upload.single("imagen"), cursoController.updateCurso);

// Asignar curso a instructor
router.post('/asignaciones', cursoController.asignarCursoAInstructor);

// Obtener cursos asignados a un instructor
router.get('/cursos-asignados/:instructor_ID', cursoController.obtenerCursosAsignadosAInstructor);

// Obtener participantes de un curso
router.get('/cursos/:courseId/participants', cursoController.getCursoParticipants);

// Ruta para crear o actualizar el estado de una inscripción (solo administradores)
router.put('/inscripciones', crearOActualizarInscripcion);

module.exports = router;