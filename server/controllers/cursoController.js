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

let dbInstance;

// Función para inyectar la instancia de la base de datos
const setDb = (databaseInstance) => {
    dbInstance = databaseInstance;
};

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
          attributes: ['ID', 'nombre_curso', 'descripcion', 'imagen', 'ficha', 'tipo_oferta', 'estado', 'fecha_inicio', 'fecha_fin', 'dias_formacion', 'lugar_formacion']
        }
      ]
    });

    res.status(200).json(asignaciones);
  } catch (error) {
    console.error('Error al obtener los cursos asignados:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener los cursos asignados' });
  }
};

/**
 * Genera las sesiones automáticamente para un curso
 */
const generateSessions = async (curso) => {
    try {
        const { ID, fecha_inicio, fecha_fin, hora_inicio, hora_fin, dias_formacion } = curso;
        
        // Obtener la asignación del instructor para este curso
        const asignacion = await AsignacionCursoInstructor.findOne({
            where: {
                curso_ID: ID,
                estado: 'aceptada'
            },
            order: [['fecha_asignacion', 'DESC']] // Obtener la asignación más reciente
        });

        if (!asignacion) {
            console.warn(`No se encontró un instructor asignado para el curso ${ID}`);
            return 0;
        }

        // Convertir las fechas a objetos Date
        const startDate = new Date(fecha_inicio);
        const endDate = new Date(fecha_fin);
        
        // Convertir los días de formación a números (0 = Domingo, 1 = Lunes, etc.)
        const diasSemana = dias_formacion.map(dia => {
            const dias = {
                'Lunes': 1,
                'Martes': 2,
                'Miércoles': 3,
                'Jueves': 4,
                'Viernes': 5,
                'Sábado': 6,
                'Domingo': 0
            };
            return dias[dia];
        });

        // Array para almacenar las sesiones a crear
        const sessionsToCreate = [];
        
        // Iterar sobre cada día en el rango de fechas
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            // Verificar si el día actual está en los días de formación
            const dayOfWeek = currentDate.getDay();
            if (diasSemana.includes(dayOfWeek)) {
                // Crear una sesión para este día
                sessionsToCreate.push({
                    curso_ID: ID,
                    instructor_ID: asignacion.instructor_ID,
                    fecha: new Date(currentDate),
                    hora_inicio,
                    hora_fin,
                    estado: 'programada'
                });
            }
            // Avanzar al siguiente día
            currentDate.setDate(currentDate.getDate() + 1);
        }

        // Crear todas las sesiones en la base de datos
        if (sessionsToCreate.length > 0) {
            await dbInstance.Sesion.bulkCreate(sessionsToCreate);
        }

        return sessionsToCreate.length;
    } catch (error) {
        console.error('Error al generar las sesiones:', error);
        throw error;
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
        if (!ficha || !nombre_curso || !descripcion || !tipo_oferta || !estado || 
            !fecha_inicio || !fecha_fin || !hora_inicio || !hora_fin || !dias_formacion) {
            return res.status(400).json({
                message: "Todos los campos son obligatorios, incluyendo fechas, horarios y días de formación.",
            });
        }

        // Validar que la fecha de inicio sea anterior a la fecha de fin
        if (new Date(fecha_inicio) >= new Date(fecha_fin)) {
            return res.status(400).json({
                message: "La fecha de inicio debe ser anterior a la fecha de fin.",
            });
        }

        // Procesar imagen y convertir a Base64 si se envió
        let image = null;
        if (req.file) {
            const base64Data = req.file.buffer.toString('base64');
            const uniqueName = `${req.file.fieldname}-${Date.now()}.txt`;
            const savePath = path.join(__dirname, '../base64storage', uniqueName);

            if (!fs.existsSync(path.dirname(savePath))) {
                fs.mkdirSync(path.dirname(savePath), { recursive: true });
            }
            fs.writeFileSync(savePath, base64Data);

            image = `/base64storage/${uniqueName}`;
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

        // Si se recibe instructor_ID, se crea la asignación (AsignacionCursoInstructor) y se generan las sesiones automáticamente.
        if (req.body.instructor_ID) {
            const gestor_ID = req.user.id; // Se asume que el gestor_ID es el id del usuario autenticado (req.user.id)
            const instructor_ID = req.body.instructor_ID;
            const curso_ID = nuevoCurso.ID; // El ID del curso recién creado

            // Crear la asignación (AsignacionCursoInstructor)
            const nuevaAsignacion = await AsignacionCursoInstructor.create({
                gestor_ID,
                instructor_ID,
                curso_ID,
                fecha_asignacion: new Date(),
                estado: 'aceptada'
            });

            // Generar sesiones automáticamente (se llama a generateSessions con el curso creado)
            const sessionsCount = await generateSessions(nuevoCurso);
            console.log("Se generaron " + sessionsCount + " sesiones automáticamente para el curso (ID: " + curso_ID + ")");
        }

        // Responder con éxito (se envía el mensaje, el curso creado y, si se generaron sesiones, se incluye sessionsGenerated)
        res.status(201).json({ 
            message: "Curso creado con éxito.",
            sessionsGenerated: (req.body.instructor_ID ? (await generateSessions(nuevoCurso)) : 0),
            curso: nuevoCurso
        });

        // Buscar usuarios verificados para enviar notificación
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
    //const imagen = req.file ? `/uploads/${req.file.filename}` : curso.imagen;
    let image = null;
    if (req.file) {
      const base64Data = req.file.buffer.toString('base64');
      const uniqueName = `${req.file.fieldname}-${Date.now()}.txt`;
      const savePath = path.join(__dirname, '../base64storage', uniqueName);

      if (!fs.existsSync(path.dirname(savePath))) {
        fs.mkdirSync(path.dirname(savePath), { recursive: true });
      }
      fs.writeFileSync(savePath, base64Data);

      image = `/base64storage/${uniqueName}`;
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

// Obtener participantes de un curso
const getCursoParticipants = async (req, res) => {
  const { courseId } = req.params;

  try {
    const inscripciones = await dbInstance.InscripcionCurso.findAll({
      where: { 
        curso_ID: courseId,
        estado_inscripcion: 'activo'
      },
      include: [
        {
          model: dbInstance.Usuario,
          as: 'aprendiz',
          attributes: ['ID', 'nombres', 'apellidos', 'email', 'cedula']
        }
      ]
    });

    const participantes = inscripciones.map(inscripcion => ({
      ID: inscripcion.aprendiz.ID,
      nombres: inscripcion.aprendiz.nombres,
      apellidos: inscripcion.aprendiz.apellidos,
      email: inscripcion.aprendiz.email,
      documento: inscripcion.aprendiz.cedula,
      inscripcion_ID: inscripcion.ID
    }));

    res.status(200).json({
      success: true,
      participants: participantes
    });
  } catch (error) {
    console.error('Error al obtener los participantes del curso:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno al obtener los participantes del curso' 
    });
  }
};

/**
 * Regenera las sesiones para cursos existentes que tengan instructores asignados
 */
const regenerateSessions = async (req, res) => {
    try {
        console.log('Iniciando regeneración de sesiones...');
        
        // Obtener todos los cursos que tienen instructores asignados
        const cursosConInstructor = await Curso.findAll({
            include: [{
                model: AsignacionCursoInstructor,
                where: {
                    estado: 'aceptada'
                },
                required: true
            }]
        });

        console.log(`Se encontraron ${cursosConInstructor.length} cursos con instructores asignados`);

        let resultados = [];
        let totalSesionesGeneradas = 0;

        for (const curso of cursosConInstructor) {
            try {
                console.log(`Procesando curso ${curso.ID} - ${curso.nombre_curso}`);
                
                // Eliminar sesiones existentes del curso
                const sesionesEliminadas = await dbInstance.Sesion.destroy({
                    where: {
                        curso_ID: curso.ID
                    }
                });
                console.log(`Se eliminaron ${sesionesEliminadas} sesiones existentes del curso ${curso.ID}`);

                // Generar nuevas sesiones
                console.log(`Generando nuevas sesiones para el curso ${curso.ID}`);
                const sesionesGeneradas = await generateSessions(curso);
                console.log(`Se generaron ${sesionesGeneradas} nuevas sesiones para el curso ${curso.ID}`);
                
                resultados.push({
                    curso_ID: curso.ID,
                    nombre_curso: curso.nombre_curso,
                    sesiones_generadas: sesionesGeneradas,
                    estado: 'exitoso'
                });

                totalSesionesGeneradas += sesionesGeneradas;
            } catch (error) {
                console.error(`Error al regenerar sesiones para el curso ${curso.ID}:`, error);
                console.error('Detalles del error:', {
                    message: error.message,
                    stack: error.stack,
                    curso: {
                        ID: curso.ID,
                        nombre: curso.nombre_curso,
                        fecha_inicio: curso.fecha_inicio,
                        fecha_fin: curso.fecha_fin,
                        dias_formacion: curso.dias_formacion
                    }
                });
                resultados.push({
                    curso_ID: curso.ID,
                    nombre_curso: curso.nombre_curso,
                    error: error.message,
                    estado: 'error'
                });
            }
        }

        console.log('Proceso de regeneración completado');
        console.log('Resumen:', {
            totalCursos: cursosConInstructor.length,
            totalSesionesGeneradas,
            resultados
        });

        res.status(200).json({
            success: true,
            message: `Se regeneraron ${totalSesionesGeneradas} sesiones en total`,
            resultados
        });
    } catch (error) {
        console.error('Error al regenerar las sesiones:', error);
        console.error('Stack trace:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Error al regenerar las sesiones',
            error: error.message
        });
    }
};

module.exports = {
  setDb,
  createCurso,
  updateCurso,
  getAllCursos,
  getCursoById,
  getCursoByFicha,
  asignarCursoAInstructor,
  obtenerCursosAsignadosAInstructor,
  uploadImagesBase64,
  getCursoParticipants,
  generateSessions,
  regenerateSessions
};


