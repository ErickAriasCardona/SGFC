const express = require("express");
const { createCurso, updateCurso, getAllCursos, getCursoByNameOrFicha, asignarCursoAInstructor,obtenerCursosAsignadosAInstructor } = require("../controllers/cursoController");
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
router.put("/cursos/:id", authenticateUser, upload.single("imagen"), updateCurso);
/*
router.put("/cursos/:id", authenticateUser, updateCurso);
*/

// Ruta para obtener todos los cursos
router.get("/cursos", getAllCursos);

// POST /asignaciones
router.post('/asignaciones', asignarCursoAInstructor);

//cursos asignados a un isntructor
router.get('/cursos-asignados/:instructor_ID', obtenerCursosAsignadosAInstructor);

//ruta para buscar curso por nombre o ficha
router.get('/searchCurso', getCursoByNameOrFicha)

module.exports = router;