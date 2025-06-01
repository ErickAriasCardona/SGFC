const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Importar cookie-parser
const initializeDatabase = require("./models/index");
const generalConfig = require('./config/general');
const path = require("path");
const { Op } = require('sequelize');

// Importar controladores y rutas
const authGoogleController = require('./controllers/authGoogleController');
const authRouter = express.Router();
const userRoutes = require("./routes/userRoutes");
const cursoRoutes = require("./routes/cursoRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

// Importar servicios
const { scheduleAbsenceNotifications } = require('./services/notificationService');

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

// Ejecuta el envío de notificaciones de inasistencia cada día a las 8:00 PM
cron.schedule('0 20 * * *', async () => {
  try {
    console.log('🕒 Iniciando envío de notificaciones de inasistencia...');
    const result = await scheduleAbsenceNotifications();
    console.log(`✅ Notificaciones enviadas: ${result.sessionsProcessed} sesiones procesadas`);
  } catch (error) {
    console.error('❌ Error al enviar notificaciones de inasistencia:', error);
  }
}, {
  timezone: "America/Bogota"
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

// Servir archivos estáticos
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/base64storage", express.static(path.join(__dirname, "base64storage")));

// Registrar rutas
app.use("/api/auth", authRouter);
app.use("/api/users", userRoutes);
app.use("/api/courses", cursoRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/notifications", notificationRoutes);

async function startServer() {
  try {
    // Inicializar base de datos
    const db = await initializeDatabase();
    
    // Inyectar la instancia de la base de datos en los controladores
    authGoogleController.setDb(db);
    const sessionController = require('./controllers/sessionController');
    const attendanceController = require('./controllers/attendanceController');
    const cursoController = require('./controllers/cursoController');
    sessionController.setDb(db);
    attendanceController.setDb(db);
    cursoController.setDb(db);

    // Crear datos por defecto
    await db.Departamento.createDefaultDeparment();
    await db.Ciudad.createDefaultCiudad();
    await db.Sena.createDefaultSENA();
    await db.Usuario.createDefaultAdmin();

    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log("🚀 Servidor corriendo en el puerto", PORT);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer(); 