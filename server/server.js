const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser"); // Importar cookie-parser
const initializeDatabase = require("./models/index");
const userRoutes = require("./routes/userRoutes"); // Importar rutas de usuario
const cursoRoutes = require("./routes/cursoRoutes"); // Importar rutas de cursos

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
  const { sequelize, Usuario,Departamento, Ciudad, Sena } = await initializeDatabase(); // Inicializar base de datos

  // Crear el usuario administrador por defecto
  await Usuario.createDefaultAdmin();
  await Departamento.createDefaultDeparment();
  await Ciudad.createDefaultCiudad();
  await Sena.createDefaultSENA(); 



  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log("🚀 Servidor corriendo en el puerto", PORT);
  });
}

startServer(); 