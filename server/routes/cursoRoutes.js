const express = require("express");
const { createCurso, updateCurso, getAllCursos, getCursoByNameOrFicha, asignarCursoAInstructor,obtenerCursosAsignadosAInstructor } = require("../controllers/cursoController");
const { authenticateUser } = require("../middlewares/authMiddleware"); // Middleware para autenticar al usuario
const upload = require("../config/multer");
const { crearOActualizarInscripcion } = require('../controllers/inscripcionCursoController');

const router = express.Router();


// ruta para carga de imagenes en base64
router.post("/cursos", authenticateUser, upload.single("imagen"), createCurso);

// Ruta para actualizar un curso (solo administradores)
router.put("/cursos/:id", authenticateUser, upload.single("imagen"), updateCurso);

// Ruta para obtener todos los cursos
router.get("/cursos", getAllCursos);

// POST /asignaciones
router.post('/asignaciones', asignarCursoAInstructor);

//cursos asignados a un isntructor
router.get('/cursos-asignados/:instructor_ID', obtenerCursosAsignadosAInstructor);

//ruta para buscar curso por nombre o ficha
router.get('/searchCurso', getCursoByNameOrFicha)

// Ruta para crear o actualizar el estado de una inscripción (solo administradores)
router.put('/inscripciones', authenticateUser, crearOActualizarInscripcion);

// Ruta para actualizar la programación de un curso
router.put('/cursos/:id/programacion', authenticateUser, updateCurso);

module.exports = router;