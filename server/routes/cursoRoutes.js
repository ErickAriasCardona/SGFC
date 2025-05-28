const express = require("express");
const router = express.Router();
const cursoController = require("../controllers/cursoController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

// Rutas que requieren autenticación
router.use(authMiddleware);

// Crear un curso (con subida de imagen)
router.post("/cursos", upload.single("imagen"), cursoController.createCurso);

// Actualizar un curso
router.put("/cursos/:id", upload.single("imagen"), cursoController.updateCurso);

// Obtener todos los cursos (no requiere autenticación)
router.get("/cursos", cursoController.getAllCursos);

// Obtener un curso por ID (no requiere autenticación)
router.get("/cursos/:id", cursoController.getCursoById);

// Buscar curso por ficha (no requiere autenticación)
router.get("/cursos/ficha/:ficha", cursoController.getCursoByFicha);

// Asignar curso a instructor
router.post('/asignaciones', cursoController.asignarCursoAInstructor);

// Obtener cursos asignados a un instructor
router.get('/cursos-asignados/:instructor_ID', cursoController.obtenerCursosAsignadosAInstructor);

module.exports = router;