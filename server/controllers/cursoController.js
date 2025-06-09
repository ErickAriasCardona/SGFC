const Curso = require("../models/curso");
const User = require("../models/User");
const path = require("path");
const AsignacionCursoInstructor = require('../models/AsignacionCursoInstructor');
const { sendCourseCreatedEmail } = require("../services/emailService");
const { Router } = require("express");
const upload = require("../config/multer");
const { sendCursoUpdatedNotification } = require('../services/emailService');
const { InscripcionCurso } = require('../models');
const { Op } = require('sequelize');
const fs = require('fs');

//Asignar cursos
const asignarCursoAInstructor = async (req, res) => {
  const { gestor_ID, instructor_ID, curso_ID, fecha_asignacion, estado } = req.body;

  try {
    // Validación básica
    if (!gestor_ID || !instructor_ID || !curso_ID) {
      return res.status(400).json({
        mensaje: 'Todos los campos (gestor_ID, instructor_ID, curso_ID) son obligatorios',
      });
    }

    // Validar existencia del gestor
    const gestor = await User.findByPk(gestor_ID);
    if (!gestor || gestor.accountType !== 'Gestor') {
      return res.status(404).json({ mensaje: 'Gestor no encontrado o no válido' });
    }

    // Validar existencia del instructor
    const instructor = await User.findByPk(instructor_ID);
    if (!instructor || instructor.accountType !== 'Instructor') {
      return res.status(404).json({ mensaje: 'Instructor no encontrado o no válido' });
    }

    // Validar existencia del curso
    const curso = await Curso.findByPk(curso_ID);
    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    // Validar que no se haya asignado ya este curso al instructor
    const asignacionExistente = await AsignacionCursoInstructor.findOne({
      where: {
        gestor_ID,
        instructor_ID,
        curso_ID,
      },
    });

    if (asignacionExistente) {
      return res.status(409).json({
        mensaje: 'Este curso ya ha sido asignado a este instructor previamente',
      });
    }

    // Crear la nueva asignación
    const nuevaAsignacion = await AsignacionCursoInstructor.create({
      gestor_ID,
      instructor_ID,
      curso_ID,
      fecha_asignacion: fecha_asignacion || new Date(),
      estado: estado || 'aceptada',
    });

    res.status(201).json({
      mensaje: 'Curso asignado correctamente',
      asignacion: nuevaAsignacion,
    });
  } catch (error) {
    console.error('Error al asignar curso:', error);
    res.status(500).json({
      mensaje: 'Error interno al asignar el curso',
    });
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
    const { accountType } = req.user;
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
    if (!ficha || !nombre_curso || !descripcion || !tipo_oferta || !estado) {
      return res.status(400).json({
        message: "Los campos nombre_curso, tipo_oferta, ficha, descripcion y estado son obligatorios.",
      });
    }

    // Procesar imagen y convertir a Base64 si se envió
    let image = null;
    if (req.file) {
      image = req.file.buffer.toString('base64'); // Guardar base64 en la base de datos
    }

    // Procesar días de formación
    let diasFormacionParsed = dias_formacion;
    if (typeof dias_formacion === 'string') {
      try {
        diasFormacionParsed = JSON.parse(dias_formacion);
      } catch (e) {
        return res.status(400).json({ message: "El formato de los días de formación no es válido." });
      }
    }

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
      dias_formacion: diasFormacionParsed,
      lugar_formacion,
      imagen: image,
    });

    // Responder con éxito
    res.status(201).json({ message: "Curso creado con éxito." });

    // Buscar usuarios verificados
    const usuarios = await User.findAll({
      where: {
        verificacion_email: true,
        accountType: { [Op.or]: ['Empresa', 'Aprendiz'] },
      },
      attributes: ['email'],
    });

    const emails = usuarios.map(user => user.email);

    if (emails.length === 0) {
      console.warn('No hay usuarios aceptados para mandar Email');
    } else {
      const courseLink = `https://sgfc-seven.vercel.app/cursos/${nuevoCurso.id}`;
      await sendCourseCreatedEmail(emails, nombre_curso, courseLink);
    }

  } catch (error) {
    console.error("Error al crear el curso:", error);

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({ message: "Error de validación.", errors: error.errors });
    }

    res.status(500).json({ message: "Error al crear el curso." });
  }
};

// Actualizar un curso (solo para administradores)
const updateCurso = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== "Administrador") {
      return res.status(403).json({ message: "No tienes permisos para actualizar cursos." });
    }

    const { id } = req.params;
    const {
      nombre_curso,
      descripcion,
      tipo_oferta,
      ficha,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      dias_formacion,
      lugar_formacion,
      estado,
    } = req.body;

    // Buscar el curso real en la base de datos
    const curso = await Curso.findByPk(id);
    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    // Verificar si se envió una nueva imagen
    let image = curso.imagen;
    if (req.file) {
      image = req.file.buffer.toString('base64'); // Guardar base64 en la base de datos
    }

    // Actualizar el curso en la base de datos
    await curso.update({
      nombre_curso,
      descripcion,
      tipo_oferta,
      ficha,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      dias_formacion,
      lugar_formacion,
      estado,
      imagen: image, // Actualizar la imagen si se envió una nueva
    });

    const usuarios = await User.findAll({ where: { verificacion_email: true, accountType: { [Op.or]: ['Empresa', 'Aprendiz'] } }, attributes: ['email'] });
    const emails = usuarios.map(user => user.email);

    if (emails.length === 0) {
      console.warn('No hay usuarios aceptados para mandar Email')
    } else {
      await sendCursoUpdatedNotification(emails, curso);
    };

    res.status(200).json({
      message: `Curso actualizado con éxito. Notificaciones enviadas a ${emails.length} usuarios.`,
      curso
    });

  } catch (error) {
    console.error("Error al actualizar el curso:", error);
    res.status(500).json({ message: "Error al actualizar el curso." });
  }
};
// ...existing code...

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

// Nuevo controlador para transformacion
const uploadImagesBase64 = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No se recibio ningun archivo' });

    const base64Data = file.buffer.toString('base64');
    const uniqueName = `${file.fieldname}-${Date.now()}.txt`;
    const savePath = path.join(__dirname, '../base64storage', uniqueName);

    if (!fs.existsSync(path.dirname(savePath))) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }

    fs.writeFileSync(savePath, base64Data);

    return res.status(200).json({
      message: 'Imagen convertida y guardada.',
      filename: uniqueName,
      path: savePath
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al guardar la imagen.' });
  }

};

module.exports = {
  createCurso,
  updateCurso,
  getAllCursos,
  getCursoById,
  getCursoByFicha,
  asignarCursoAInstructor,
  obtenerCursosAsignadosAInstructor,
  uploadImagesBase64
};


