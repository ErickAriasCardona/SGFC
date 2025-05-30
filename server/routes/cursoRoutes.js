const express = require("express");
const router = express.Router();
const cursoController = require("../controllers/cursoController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multer");

// Rutas públicas (no requieren autenticación)
router.get("/cursos", cursoController.getAllCursos);
router.get("/cursos/:id", cursoController.getCursoById);
router.get("/cursos/ficha/:ficha", cursoController.getCursoByFicha);

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware);

// Crear un curso (con subida de imagen)
router.post("/cursos", upload.single("imagen"), cursoController.createCurso);

// Actualizar un curso
router.put("/cursos/:id", upload.single("imagen"), cursoController.updateCurso);

// Asignar curso a instructor
router.post('/asignaciones', cursoController.asignarCursoAInstructor);

// Obtener cursos asignados a un instructor
router.get('/cursos-asignados/:instructor_ID', cursoController.obtenerCursosAsignadosAInstructor);

module.exports = router;