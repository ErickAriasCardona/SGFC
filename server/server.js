require('dotenv').config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Importar cookie-parser
const initializeDatabase = require("./models/index");
const generalConfig = require('./config/general');
const authGoogleController = require('./controllers/authGoogleController'); // Importar controlador de autenticación de Google
const userRoutes = require("./routes/userRoutes"); // Importar rutas de usuario
const cursoRoutes = require("./routes/cursoRoutes"); // Importar rutas de cursos
// libreria para programar tareas
const cron = require('node-cron');
const { cleanExpiredTokens } = require('./controllers/userController');


// Ejecuta la limpieza de tokens expirados cada hora
cron.schedule('0 * * * *', async () => {
  try {
    await cleanExpiredTokens();
  } catch (error) {
    console.error('Error al limpiar tokens expirados:', error);
  }
}, {
  timezone: "America/Bogota" // Usa tu zona horaria real
});



const app = express();

// Configuración de CORS
app.use(
  cors({
    origin: "http://localhost:5173", // Cambia esto al dominio de tu frontend
    credentials: true, // Permitir el envío de cookies y credenciales
  })
);

app.use(express.json());
app.use(cookieParser()); // Usar cookie-parser para manejar cookies

// Registrar rutas
app.use("/", userRoutes); // Rutas de usuario
app.use("/", cursoRoutes); // Rutas de cursos
const path = require("path");

// Servir la carpeta 'uploads' como estática
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

async function startServer() {
  const db = await initializeDatabase(); // Inicializar base de datos
  authGoogleController.setDb(db);
  // Crear el usuario administrador por defecto
  await db.Departamento.createDefaultDeparment();
  await db.Ciudad.createDefaultCiudad();
  await db.Sena.createDefaultSENA();
  await db.Usuario.createDefaultAdmin(); // Accede al método a través de la instancia db


  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log("🚀 Servidor corriendo en el puerto", PORT);
  });
}

startServer(); 