const express = require("express");
const { createCurso, updateCurso, getAllCursos, getCursoById, getCursoByFicha, asignarCursoAInstructor,obtenerCursosAsignadosAInstructor } = require("../controllers/cursoController");
const { authenticateUser } = require("../middlewares/authMiddleware"); // Middleware para autenticar al usuario
const upload = require("../config/multer");

const router = express.Router();

/*
// Ruta para crear un curso (con subida de imagen)
router.post("/cursos", authenticateUser, upload.single("imagen"), createCurso);
*/

// ruta para carga de imagenes en base64
router.post("/cursos", authenticateUser, upload.single("imagen"), createCurso);

// Ruta para actualizar un curso (solo administradores)
router.put("/cursos/:id", authenticateUser, updateCurso);

// Ruta para obtener todos los cursos
router.get("/cursos", getAllCursos);

// Ruta para obtener un curso por ID
router.get("/cursos/:id", getCursoById);

// ruta para buscar curso por id o ficha
router.get("/cursos/:ficha", getCursoByFicha);

// POST /asignaciones
router.post('/asignaciones', asignarCursoAInstructor);

//cursos asignados a un isntructor
router.get('/cursos-asignados/:instructor_ID', obtenerCursosAsignadosAInstructor);

module.exports = router;