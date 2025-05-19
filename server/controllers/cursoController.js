const Curso = require("../models/curso");
const path = require("path");

const  AsignacionCursoInstructor = require('../models/AsignacionCursoInstructor');

const { sendCursoUpdatedNotification } = require('../services/emailService');

//Asignar cursos
const asignarCursoAInstructor = async (req, res) => {
  const { gestor_ID, instructor_ID, curso_ID, fecha_asignacion, estado } = req.body;

  try {
    if (!gestor_ID || !instructor_ID || !curso_ID) {
      return res.status(400).json({ mensaje: 'Todos los campos (gestor_ID, instructor_ID, curso_ID) son obligatorios' });
    }

    const nuevaAsignacion = await AsignacionCursoInstructor.create({
      gestor_ID,
      instructor_ID,
      curso_ID,
      fecha_asignacion: fecha_asignacion || new Date(),
      estado: estado || 'aceptada',
    });

    res.status(201).json({ mensaje: 'Curso asignado correctamente', asignacion: nuevaAsignacion });
  } catch (error) {
    console.error('Error al asignar curso:', error);
    res.status(500).json({ mensaje: 'Error interno al asignar el curso' });
  }
};

//consultar cursos asignador a un instructor 
const obtenerCursosAsignadosAInstructor = async (req, res) => {
  const { instructor_ID } = req.params;

  try {
    if (!instructor_ID) {
      return res.status(400).json({ mensaje: 'El ID del instructor es obligatorio' });
    }

    const asignaciones = await AsignacionCursoInstructor.findAll({
      where: { instructor_ID },
      include: [
        {
          model: Curso,
          attributes: ['id', 'nombre_curso', 'descripcion', 'imagen'], // ajusta campos según tu modelo
        }
      ]
    });

    res.status(200).json(asignaciones);
  } catch (error) {
    console.error('Error al obtener los cursos asignados:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener los cursos asignados' });
  }
};

// Crear un curso (solo para administradores)
const createCurso = async (req, res) => {
  try {
    const { accountType } = req.user; // Asegúrate de que el middleware de autenticación pase el usuario
    if (accountType !== "Administrador") {
      return res.status(403).json({ message: "No tienes permisos para crear cursos." });
    }

    const {
      nombre_curso,
      descripcion,
      tipo_oferta,
      ficha,
      estado,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      dias_formacion,
      lugar_formacion,
    } = req.body;

    // Validar campos obligatorios
    if (!nombre_curso || !tipo_oferta || !ficha || !descripcion || !estado) {
      return res.status(400).json({
        message: "Los campos nombre_curso, tipo_oferta, ficha, descripcion y estado son obligatorios.",
      });
    }

    // Obtener la ruta de la imagen subida
    const imagen = req.file ? `/uploads/${req.file.filename}` : null;

    // Crear el curso
    const nuevoCurso = await Curso.create({
      nombre_curso,
      descripcion,
      tipo_oferta,
      ficha,
      estado,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      dias_formacion,
      lugar_formacion,
      imagen,
    });

    res.status(201).json({ message: "Curso creado con éxito.", curso: nuevoCurso });
  } catch (error) {
    console.error("Error al crear el curso:", error);

    // Manejo de errores específicos
    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "Error de validación.", errors: error.errors });
    }

    res.status(500).json({ message: "Error al crear el curso." });
  }
};

// Actualizar un curso (solo para administradores)
// const updateCurso = async (req, res) => {
//   try {
//     const { accountType } = req.user; // Asegúrate de que el middleware de autenticación pase el usuario
//     if (accountType !== "Administrador") {
//       return res.status(403).json({ message: "No tienes permisos para actualizar cursos." });
//     }

//     const { id } = req.params; // Obtener el ID del curso desde los parámetros de la URL
//     const {
//       nombre_curso,
//       descripcion,
//       tipo_oferta,
//       ficha,
//       fecha_inicio,
//       fecha_fin,
//       hora_inicio,
//       hora_fin,
//       dias_formacion,
//       lugar_formacion,
//       estado,
//     } = req.body;

//     // Buscar el curso por ID
//     const curso = await Curso.findByPk(id);
//     if (!curso) {
//       return res.status(404).json({ message: "Curso no encontrado." });
//     }

//     // Verificar si se envió una nueva imagen
//     const imagen = req.file ? `/uploads/${req.file.filename}` : curso.imagen;

//     // Actualizar el curso
//     await curso.update({
//       nombre_curso,
//       descripcion,
//       tipo_oferta,
//       ficha,
//       fecha_inicio,
//       fecha_fin,
//       hora_inicio,
//       hora_fin,
//       dias_formacion,
//       lugar_formacion,
//       estado,
//       imagen, // Actualizar la imagen si se envió una nueva
//     });

//     res.status(200).json({ message: "Curso actualizado con éxito.", curso });
//   } catch (error) {
//     console.error("Error al actualizar el curso:", error);

//     // Manejo de errores específicos
//     if (error.name === "SequelizeValidationError") {
//       return res.status(400).json({ message: "Error de validación.", errors: error.errors });
//     }

//     res.status(500).json({ message: "Error al actualizar el curso." });
//   }
// };


const updateCurso = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== "Administrador") {
      return res.status(403).json({ message: "No tienes permisos para actualizar cursos." });
    }

    const { id } = req.params;

    // 🚨 Simulamos un curso como si viniera de la base de datos
    const curso = {
      id,
      nombre_curso: req.body.nombre_curso || "Nombre simulado",
      descripcion: req.body.descripcion || "Descripción simulada",
      tipo_oferta: req.body.tipo_oferta || "abierta",
      estado: req.body.estado || "activo",
      ficha: req.body.ficha || "F12345",
      fecha_inicio: req.body.fecha_inicio || "2025-06-01",
      fecha_fin: req.body.fecha_fin || "2025-07-01",
      hora_inicio: req.body.hora_inicio || "08:00:00",
      hora_fin: req.body.hora_fin || "12:00:00",
      dias_formacion: req.body.dias_formacion || "Lunes y Miércoles",
      lugar_formacion: req.body.lugar_formacion || "SENA Simulado",
      imagen: "/uploads/ejemplo.jpg"
    };

    // 🔔 Simulamos envío de notificación
    sendCursoUpdatedNotification("newlandsyt@gmail.com", curso); // cambia el correo real 

    // ✅ Respondemos como si se hubiera actualizado
    res.status(200).json({
      message: "Curso actualizado (simulado)",
      curso
    });

  } catch (error) {
    console.error("Error al actualizar curso:", error);
    res.status(500).json({ message: "Error interno al actualizar el curso." });
  }
};


// Obtener todos los cursos
const getAllCursos = async (req, res) => {
  try {
    const cursos = await Curso.findAll(); // Obtener todos los cursos
    res.status(200).json(cursos);
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    res.status(500).json({ message: "Error al obtener los cursos." });
  }
};

// Obtener un curso por ID
const getCursoById = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del curso desde los parámetros de la URL
    const curso = await Curso.findByPk(id); // Buscar el curso por ID

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    res.status(200).json(curso);
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    res.status(500).json({ message: "Error al obtener el curso." });
  }
};

//obtener curso por ficha
const getCursoByFicha = async (req, res) => {
  try {
    const { ficha } = req.params; // Obtener la ficha del curso desde los parámetros de la URL
    console.log("Ficha recibida:", ficha); // Log para verificar el valor recibido

    // Buscar el curso por ficha
    const curso = await Curso.findOne({ where: { ficha } });
    console.log("Resultado de la consulta:", curso); // Log para verificar el resultado de la consulta

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    res.status(200).json(curso);
  } catch (error) {
    console.error("Error al obtener el curso por ficha:", error);
    res.status(500).json({ message: "Error al obtener el curso." });
  }
};

module.exports = { createCurso, updateCurso, getAllCursos, getCursoById, getCursoByFicha, asignarCursoAInstructor, obtenerCursosAsignadosAInstructor };

