const Curso = require("../models/curso");
const User = require("../models/User");
const Empresa = require('../models/empresa'); // Importar el modelo Empresa
const path = require("path");
const AsignacionCursoInstructor = require("../models/AsignacionCursoInstructor");
const { sendCourseCreatedEmail } = require("../services/emailService");
const { Router } = require("express");
const upload = require("../config/multer");
const { sendCursoUpdatedNotification, sendInstructorAssignedEmail, sendStudentsInstructorAssignedEmail } = require('../services/emailService');
const { Op } = require('sequelize');
const fs = require('fs');
const InscripcionCurso = require('../models/InscripcionCurso');


let dbInstance;

// Función para inyectar la instancia de la base de datos
const setDb = (databaseInstance) => {
  dbInstance = databaseInstance;
};

//Asignar cursos
const asignarCursoAInstructor = async (req, res) => {
  const { gestor_ID, instructor_ID, curso_ID, fecha_asignacion, estado } =
    req.body;

  try {
    // Validación básica
    if (!gestor_ID || !instructor_ID || !curso_ID) {
      return res.status(400).json({
        mensaje:
          "Todos los campos (gestor_ID, instructor_ID, curso_ID) son obligatorios",
      });
    }

    // Validar existencia del gestor
    const gestor = await User.findByPk(gestor_ID);
    if (!gestor || gestor.accountType !== "Gestor") {
      return res
        .status(404)
        .json({ mensaje: "Gestor no encontrado o no válido" });
    }

    // Validar existencia del instructor
    const instructor = await User.findByPk(instructor_ID);
    if (!instructor || instructor.accountType !== "Instructor") {
      return res
        .status(404)
        .json({ mensaje: "Instructor no encontrado o no válido" });
    }

    // Validar existencia del curso
    const curso = await Curso.findByPk(curso_ID);
    if (!curso) {
      return res.status(404).json({ mensaje: "Curso no encontrado" });
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
        mensaje: "Este curso ya ha sido asignado a este instructor previamente",
      });
    }

    // Crear la nueva asignación
    const nuevaAsignacion = await AsignacionCursoInstructor.create({
      gestor_ID,
      instructor_ID,
      curso_ID,
      fecha_asignacion: fecha_asignacion || new Date(),
      estado: estado || "aceptada",
    });
    // Enviar correo al instructor
    if (instructor.email) {
      await sendInstructorAssignedEmail(instructor.email, curso);
    }

    // Buscar aprendices inscritos a ese curso
    // Obtener aprendices inscritos en el curso
    const inscripciones = await InscripcionCurso.findAll({ where: { curso_ID } });

    if (inscripciones.length === 0) {
      console.log("⚠️ No hay aprendices inscritos aún, no se enviaron notificaciones.");
    } else {
      const aprendizIDs = inscripciones.map(inscripcion => inscripcion.aprendiz_ID);

      const aprendices = await User.findAll({
        where: {
          ID: { [Op.in]: aprendizIDs },
          email: { [Op.ne]: null },
          verificacion_email: true
        }
      });

      const emailsAprendices = aprendices.map(a => a.email);

      // instructor_ID viene de asignacion_cursos_instructor
      const instructor = await User.findOne({
        where: {
          ID: instructor_ID,
          accountType: 'Instructor'
        }
      });

      let nombreInstructor = 'Instructor asignado';
      if (instructor) {
        nombreInstructor = `${instructor.nombres} ${instructor.apellidos}`;
      }

      // Ahora llama a tu función de email y pásale el nombre del instructor
      for (const email of emailsAprendices) {
        await sendStudentsInstructorAssignedEmail(email, curso, nombreInstructor);
      }
    }

    res.status(201).json({
      mensaje: "Curso asignado correctamente",
      asignacion: nuevaAsignacion,
    });
  } catch (error) {
    console.error("Error al asignar curso:", error);
    res.status(500).json({
      mensaje: "Error interno al asignar el curso",
    });
  }
};

//consultar cursos asignador a un instructor
const obtenerCursosAsignadosAInstructor = async (req, res) => {
  const { instructor_ID } = req.params;

  try {
    if (!instructor_ID) {
      return res
        .status(400)
        .json({ mensaje: "El ID del instructor es obligatorio" });
    }

    const asignaciones = await AsignacionCursoInstructor.findAll({
      where: { instructor_ID },
      include: [
        {
          model: Curso,
          attributes: ["id", "nombre_curso", "descripcion", "imagen"],
        }
      ]
    });

    res.status(200).json(asignaciones);
  } catch (error) {
    console.error("Error al obtener los cursos asignados:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno al obtener los cursos asignados" });
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
      slots_formacion,
      empresa_ID // Esperado solo si tipo_oferta es "Cerrada"
    } = req.body;

    // ✅ Validación estricta del tipo de oferta
    const tipoOfertaValida = ["Cerrada", "Abierta"];
    if (!tipoOfertaValida.includes(tipo_oferta)) {
      return res.status(400).json({
        message: "El tipo de oferta debe ser 'Cerrada' o 'Abierta'."
      });
    }

    // ✅ Validación de empresa_ID si es oferta cerrada
    let finalEmpresaID = null;
    if (tipo_oferta === "Cerrada") {
      if (!empresa_ID || isNaN(Number(empresa_ID))) {
        return res.status(400).json({
          message: "Debe proporcionar un ID de empresa válido para una oferta cerrada."
        });
      }

      const empresa = await Empresa.findByPk(empresa_ID);

      if (!empresa) {
        return res.status(404).json({
          message: `No se encontró una empresa con el ID ${empresa_ID}.`
        });
      }

      finalEmpresaID = empresa_ID;
    }

    // ✅ Validaciones generales del curso
    if (!ficha || isNaN(Number(ficha))) {
      return res.status(400).json({ message: "El campo ficha es obligatorio y debe ser un número." });
    }

    const cursoExistente = await Curso.findOne({ where: { ficha } });
    if (cursoExistente) {
      return res.status(409).json({ message: "Ya existe un curso con la misma ficha." });
    }

    if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
      return res.status(400).json({ message: "La fecha de inicio debe ser anterior a la fecha de fin." });
    }

    if (typeof dias_formacion !== 'string') {
      return res.status(400).json({ message: "El campo dias_formacion debe ser un string." });
    }

    let image = null;
    if (req.file) {
      image = req.file.buffer.toString('base64');
    }

    let slotsFormacionString = null;
    if (slots_formacion) {
      slotsFormacionString = Array.isArray(slots_formacion)
        ? JSON.stringify(slots_formacion)
        : slots_formacion;
    }

    const sena_ID = 1;

    // ✅ Crear el curso
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
      imagen: image,
      sena_ID,
      empresa_ID: finalEmpresaID,
      slots_formacion: slotsFormacionString
    });

    res.status(201).json({ message: "Curso creado con éxito.", curso: nuevoCurso });

    // ✅ Enviar notificación por email (opcional)
    const usuarios = await User.findAll({
      where: {
        verificacion_email: true,
        accountType: { [Op.or]: ['Empresa', 'Aprendiz'] },
      },
      attributes: ['email'],
    });

    const emails = usuarios.map(user => user.email);
    if (emails.length > 0) {
      const courseLink = `http://localhost:5173/cursos/${nuevoCurso.id}`;
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
      return res
        .status(403)
        .json({ message: "No tienes permisos para actualizar cursos." });
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
      slots_formacion,
      empresa_ID
    } = req.body;

    // Validar que el curso exista
    const curso = await Curso.findByPk(id);
    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    // Verificar si se envió una nueva imagen
    let image = curso.imagen;
    if (req.file) {
      image = req.file.buffer.toString('base64');
    }

    // 🟨 Validar empresa si tipo_oferta es "Cerrada"
    let finalEmpresaID = null;
    if (tipo_oferta === "Cerrada") {
      if (!empresa_ID || isNaN(Number(empresa_ID))) {
        return res.status(400).json({
          message: "Debe proporcionar un ID de empresa válido para una oferta cerrada.",
        });
      }

      const empresa = await Empresa.findByPk(empresa_ID);
      if (!empresa) {
        return res.status(404).json({
          message: `No se encontró una empresa con el ID ${empresa_ID}.`,
        });
      }

      finalEmpresaID = empresa_ID;
    }

    // 🧩 Preparar datos para actualización
    const datosActualizacion = {
      nombre_curso,
      descripcion,
      tipo_oferta,
      ficha,
      dias_formacion,
      lugar_formacion,
      estado,
      empresa_ID: tipo_oferta === "Cerrada" ? finalEmpresaID : null, // ✅ Actualizar o limpiar
    };

    if (fecha_inicio && fecha_fin) {
      datosActualizacion.fecha_inicio = fecha_inicio;
      datosActualizacion.fecha_fin = fecha_fin;
    }

    if (hora_inicio && hora_fin) {
      datosActualizacion.hora_inicio =
        hora_inicio.includes(":") && hora_inicio.split(":").length === 2
          ? hora_inicio + ":00"
          : hora_inicio;
      datosActualizacion.hora_fin =
        hora_fin.includes(":") && hora_fin.split(":").length === 2
          ? hora_fin + ":00"
          : hora_fin;
    }

    if (image) {
      datosActualizacion.imagen = image;
    }

    if (slots_formacion) {
      datosActualizacion.slots_formacion = Array.isArray(slots_formacion)
        ? JSON.stringify(slots_formacion)
        : slots_formacion;
    }

    // ✅ Actualizar curso en la base de datos
    await curso.update(datosActualizacion);

    // 📨 Notificar por email
    const usuarios = await User.findAll({
      where: {
        verificacion_email: true,
        accountType: { [Op.or]: ["Empresa", "Aprendiz"] },
      },
      attributes: ["email"],
    });

    const emails = usuarios.map((user) => user.email);
    if (emails.length > 0) {
      await sendCursoUpdatedNotification(emails, curso);
    }

    res.status(200).json({
      message: `Curso actualizado con éxito. Notificaciones enviadas a ${emails.length} usuarios.`,
      curso,
      validaciones_aplicadas: {
        fechas: !!(fecha_inicio && fecha_fin),
        horas: !!(hora_inicio && hora_fin),
        empresa: tipo_oferta === "Cerrada",
      },
    });
  } catch (error) {
    console.error("Error al actualizar el curso:", error);
    res.status(500).json({ message: "Error al actualizar el curso." });
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

const getCursoByNameOrFicha = async (req, res) => {
  try {
    const { input } = req.query;

    if (!input) {
      return res.status(400).json({ message: "El campo 'input' es obligatorio." });
    }

    const curso = await Curso.findAll({
      where: {
        [Op.or]: [
          {
            nombre_curso: {
              [Op.like]: `%${input}%`
            }
          },
          {
            ficha: {
              [Op.like]: `%${input}%`
            }
          }
        ]
      }
    });

    if (!curso || curso.length === 0) {
      return res.status(404).json({ message: "Curso no encontrado" });
    }

    res.status(200).json(curso);

  } catch (error) {
    console.error("Error al obtener curso: ", error);
    res.status(500).json({ message: "Error al obtener el curso." });
  }
};

// Nuevo controlador para transformacion
const uploadImagesBase64 = async (req, res) => {
  try {
    const file = req.file;
    if (!file)
      return res.status(400).json({ message: "No se recibio ningun archivo" });

    const base64Data = file.buffer.toString("base64");
    const uniqueName = `${file.fieldname}-${Date.now()}.txt`;
    const savePath = path.join(__dirname, "../base64storage", uniqueName);

    if (!fs.existsSync(path.dirname(savePath))) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }

    fs.writeFileSync(savePath, base64Data);

    return res.status(200).json({
      message: "Imagen convertida y guardada.",
      filename: uniqueName,
      path: savePath,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al guardar la imagen." });
  }
};

const actualizarProgramacion = async (req, res) => {
  // ...código igual que antes...
};

const getCursoParticipants = async (req, res) => {
  try {
    const { courseId } = req.params;

    const participantes = await dbInstance.InscripcionCurso.findAll({
      where: {
        curso_ID: courseId,
        estado_inscripcion: 'activo'
      },
      include: [{
        model: dbInstance.Usuario,
        as: 'aprendiz',
        attributes: ['ID', 'nombres', 'apellidos', 'email', 'documento', 'foto_perfil']
      }]
    });

    res.status(200).json({
      success: true,
      participants: participantes
    });
  } catch (error) {
    console.error('Error al obtener los participantes del curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los participantes del curso'
    });
  }
};

const getCursoById = async (req, res) => {
  try {
    const { id } = req.params;

    const curso = await Curso.findByPk(id, {
      include: [
        {
          model: Empresa,
          as: 'Empresa', 
        }
      ]
    });

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    res.status(200).json(curso);
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    res.status(500).json({ message: "Error al obtener el curso." });
  }
};

// Obtener todos los cursos relacionados a una empresa por su ID
const getCursosByEmpresaId = async (req, res) => {
  try {
    const { empresaId } = req.params;

    if (!empresaId) {
      return res.status(400).json({ message: "El ID de la empresa es obligatorio." });
    }

    // Verificar si la empresa existe
    const empresa = await Empresa.findByPk(empresaId);
    if (!empresa) {
      return res.status(404).json({ message: `No se encontró una empresa con el ID ${empresaId}.` });
    }

    const cursos = await Curso.findAll({
      where: { empresa_ID: empresaId },
      include: [
        {
          model: Empresa,
          as: 'Empresa'
        }
      ]
    });

    res.status(200).json({ success: true, cursos });
  } catch (error) {
    console.error("Error al obtener los cursos de la empresa:", error);
    res.status(500).json({ message: "Error al obtener los cursos de la empresa." });
  }
};


module.exports = {
  setDb,
  createCurso,
  updateCurso,
  getAllCursos,
  getCursoByNameOrFicha,
  asignarCursoAInstructor,
  obtenerCursosAsignadosAInstructor,
  uploadImagesBase64,
  getCursoParticipants,
  actualizarProgramacion,
  getCursoById,
  getCursosByEmpresaId
};