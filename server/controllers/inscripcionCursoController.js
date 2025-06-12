const InscripcionCurso = require("../models/InscripcionCurso");
const Curso = require("../models/curso");
const Usuario = require("../models/User");
const { sendEnrollmentNotification } = require("../services/notificationService");

const crearOActualizarInscripcion = async (req, res) => {
  const { curso_ID, aprendiz_ID, nuevoEstado, gestor_ID } = req.body;
  
  console.log('Usuario autenticado completo:', req.user);
  
  // Determinar el ID del gestor según el tipo de usuario
  let gestorIdFinal;
  if (req.user.accountType === 'Gestor') {
    gestorIdFinal = req.user.id;
  } else if (req.user.accountType === 'Administrador' || req.user.accountType === 'Empresa') {
    if (!gestor_ID) {
      return res.status(400).json({
        mensaje: 'El campo gestor_ID es obligatorio cuando el usuario es Administrador o Empresa',
      });
    }
    gestorIdFinal = gestor_ID;
  }
  
  console.log('Información de usuario y gestor:', {
    usuarioAutenticado: {
      id: req.user.id,
      tipo: req.user.accountType
    },
    gestorIdFinal
  });

  try {
    // Validación básica
    if (!curso_ID || !aprendiz_ID || !nuevoEstado) {
      return res.status(400).json({
        mensaje: 'Los campos curso_ID, aprendiz_ID y nuevoEstado son obligatorios',
      });
    }

    // Validar rol del usuario autenticado
    if (!req.user || (req.user.accountType !== 'Empresa' && req.user.accountType !== 'Administrador' && req.user.accountType !== 'Gestor')) {
      return res.status(403).json({
        mensaje: 'No tienes permisos para realizar esta acción. Solo Empresa, Administrador o Gestor pueden realizar inscripciones.',
      });
    }

    // Validar existencia del aprendiz
    const aprendiz = await Usuario.findByPk(aprendiz_ID);
    if (!aprendiz || aprendiz.accountType !== 'Aprendiz') {
      return res.status(404).json({
        mensaje: 'Aprendiz no encontrado o no válido',
      });
    }

    // Validar existencia del curso
    const curso = await Curso.findByPk(curso_ID);
    if (!curso) {
      return res.status(404).json({
        mensaje: 'Curso no encontrado',
      });
    }

    // Validar existencia del gestor si se proporciona
    if (gestorIdFinal) {
      const gestor = await Usuario.findByPk(gestorIdFinal);
      if (!gestor || gestor.accountType !== 'Gestor') {
        return res.status(404).json({
          mensaje: 'Gestor no encontrado o no válido',
        });
      }
    }

    // Validar estado permitido
    const estadosValidos = ['activo', 'rechazado', 'pendiente'];
    if (!estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({ mensaje: 'Estado no válido' });
    }

    // Buscar inscripción existente
    let inscripcion = await InscripcionCurso.findOne({
      where: { curso_ID, aprendiz_ID },
    });

    if (inscripcion) {
      inscripcion.estado_inscripcion = nuevoEstado;
      inscripcion.gestor_ID = gestorIdFinal;
      await inscripcion.save();

      // Manejo de notificación para inscripción existente
      if (nuevoEstado === 'activo') {
        try {
          await sendEnrollmentNotification(curso_ID, aprendiz_ID, gestorIdFinal, req.user.accountType);
        } catch (notificacionError) {
          console.error('Error al enviar notificación de inscripción:', notificacionError);
          // No interrumpimos el flujo principal si falla la notificación
        }
      }

      return res.status(200).json({
        mensaje: 'Estado de inscripción actualizado correctamente',
        inscripcion,
      });
    }

    // Crear inscripción nueva
    inscripcion = await InscripcionCurso.create({
      curso_ID,
      aprendiz_ID,
      gestor_ID: gestorIdFinal,
      estado_inscripcion: nuevoEstado,
      fecha_inscripcion: new Date(),
    });

    // Manejo de notificación para nueva inscripción
    if (nuevoEstado === 'activo') {
      try {
        await sendEnrollmentNotification(curso_ID, aprendiz_ID, gestorIdFinal, req.user.accountType);
      } catch (notificacionError) {
        console.error('Error al enviar notificación de inscripción:', notificacionError);
        // No interrumpimos el flujo principal si falla la notificación
      }
    }

    return res.status(201).json({
      mensaje: 'Inscripción creada correctamente',
      inscripcion,
    });
  } catch (error) {
    console.error('Error al crear o actualizar inscripción:', error);
    return res.status(500).json({
      mensaje: 'Error interno del servidor',
    });
  }
};

module.exports = {
  crearOActualizarInscripcion,
};
