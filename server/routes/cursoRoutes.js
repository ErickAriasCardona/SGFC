const express = require("express");
const router = express.Router();
const cursoController = require("../controllers/cursoController");
const {authMiddleware} = require("../middlewares/authMiddleware");
const upload = require("../config/multer");
const { crearOActualizarInscripcion } = require('../controllers/inscripcionCursoController');
// filepath: [userRoutes.js](http://_vscodecontentref_/2)
const { sendRequestCourseEmail } = require('../services/emailService');

// Rutas públicas (no requieren autenticación)
router.get("/cursos", cursoController.getAllCursos);
router.get('/searchCurso', cursoController.getCursoByNameOrFicha)
router.get("/cursos/:id", cursoController.getCursoById); // Obtener curso por ID
router.get('/empresa/:empresaId', cursoController.getCursosByEmpresaId);
router.post('/solicitud-curso', upload.single('pdf'), sendRequestCourseEmail);


//ruta que requieren autorizacion
router.use(authMiddleware);

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