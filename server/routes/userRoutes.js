const express = require("express");
const { registerUser, verifyEmail, loginUser,requestPasswordReset,resetPassword, getAllUsers, getUserProfile, getAprendices, getEmpresas, getInstructores, getGestores, updateUserProfile,updateProfilePicture,createInstructor, createGestor } = require("../controllers/userController");
const router = express.Router();
const upload = require("../config/multer"); // Importar configuración de multer

router.post("/createUser", registerUser); // Ruta para registrar usuario
router.get("/verificarCorreo", verifyEmail); // Ruta para verificar correo
router.post("/login", loginUser); // Ruta para iniciar sesión
router.post("/requestPasswordReset", requestPasswordReset); // Solicitar recuperación de contraseña
router.post("/resetPassword", resetPassword); // Restablecer contraseña
router.get("/users",getAllUsers); // Obtener todos los usuarios
router.get('/perfil/:id', getUserProfile); // Obtener perfil de usuario por ID
router.get('/aprendices', getAprendices); // Obtener todos los aprendices
router.get('/empresas', getEmpresas); // Obtener todas las empresas
router.get('/instructores', getInstructores); // Obtener todos los instructores
router.get('/gestores', getGestores); // Obtener todos los gestores
router.put('/perfil/actualizar/:id', upload.single('foto_perfil'), updateUserProfile);
router.put('/perfil/actualizarFoto/:id', updateProfilePicture); // Actualizar foto de perfil de usuario por ID
router.post('/crearInstructor', upload.single('foto_perfil'), createInstructor);
router.post('/crearGestor', upload.single('foto_perfil'), createGestor);

router.get("/", (req, res) => {
    res.send("🚀 API funcionando correctamente");
  });
  

module.exports = router;  