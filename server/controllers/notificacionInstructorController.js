const { NotificacionInstructor, Usuario, Curso, RespuestaDisponibilidad } = require('../models');
const enviarEmail = require('../utils/emailService');

// RF13.6 Notificación de asignación de cursos
const notificarAsignacionCurso = async (req, res) => {
  try {
    const { instructor_id, curso_id, mensaje_adicional } = req.body;

    // Verificar si el instructor existe
    const instructor = await Usuario.findByPk(instructor_id);
    if (!instructor || instructor.rol !== 'instructor') {
      return res.status(404).json({ mensaje: 'Instructor no encontrado' });
    }

    // Verificar si el curso existe
    const curso = await Curso.findByPk(curso_id);
    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    // Crear la notificación
    const titulo = `Asignación al curso: ${curso.nombre_curso}`;
    const mensaje = `Se le ha asignado el curso ${curso.nombre_curso} (Ficha: ${curso.ficha || 'No asignada'}). ${mensaje_adicional || ''}`;

    const notificacion = await NotificacionInstructor.create({
      instructor_id,
      curso_id,
      tipo: 'asignacion_curso',
      titulo,
      mensaje,
      requiere_respuesta: false
    });

    // Enviar email al instructor
    await enviarEmail(
      instructor.email,
      titulo,
      mensaje,
      { curso, instructor }
    );

    return res.status(201).json({
      mensaje: 'Notificación enviada exitosamente',
      notificacion
    });
  } catch (error) {
    console.error('Error al notificar asignación de curso:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

// RF13.7 Enviar notificación sobre cursos disponibles
const notificarCursosDisponibles = async (req, res) => {
  try {
    const { curso_id, instructores_ids, mensaje_adicional, fecha_limite_respuesta } = req.body;

    // Verificar si el curso existe
    const curso = await Curso.findByPk(curso_id);
    if (!curso) {
      return res.status(404).json({ mensaje: 'Curso no encontrado' });
    }

    // Verificar instructores existentes
    const instructores = await Usuario.findAll({
      where: {
        id: instructores_ids,
        rol: 'instructor'
      }
    });

    if (instructores.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron instructores válidos' });
    }

    // Crear notificaciones para cada instructor
    const titulo = `Curso disponible: ${curso.nombre_curso}`;
    const mensaje = `Hay un nuevo curso disponible para asignación: ${curso.nombre_curso}. ${mensaje_adicional || ''}`;

    const notificacionesCreadas = [];

    for (const instructor of instructores) {
      const notificacion = await NotificacionInstructor.create({
        instructor_id: instructor.id,
        curso_id,
        tipo: 'curso_disponible',
        titulo,
        mensaje,
        requiere_respuesta: true,
        fecha_limite_respuesta: fecha_limite_respuesta || null
      });
      
      notificacionesCreadas.push(notificacion);

      // Enviar email a cada instructor
      await enviarEmail(
        instructor.email,
        titulo,
        mensaje,
        { curso, instructor, notificacion }
      );
    }

    return res.status(201).json({
      mensaje: `Notificación enviada exitosamente a ${notificacionesCreadas.length} instructores`,
      notificaciones: notificacionesCreadas
    });
  } catch (error) {
    console.error('Error al notificar cursos disponibles:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

// RF13.8 Registrar respuesta de disponibilidad
const registrarRespuesta = async (req, res) => {
  try {
    const { notificacion_id } = req.params;
    const { respuesta, comentarios, horario_propuesto } = req.body;
    
    // Verificar si la notificación existe y requiere respuesta
    const notificacion = await NotificacionInstructor.findByPk(notificacion_id);
    
    if (!notificacion) {
      return res.status(404).json({ mensaje: 'Notificación no encontrada' });
    }
    
    if (!notificacion.requiere_respuesta) {
      return res.status(400).json({ mensaje: 'Esta notificación no requiere una respuesta' });
    }
    
    // Verificar si ya hay una respuesta para esta notificación
    const respuestaExistente = await RespuestaDisponibilidad.findOne({
      where: { notificacion_id }
    });
    
    if (respuestaExistente) {
      return res.status(400).json({ mensaje: 'Esta notificación ya tiene una respuesta registrada' });
    }
    
    // Crear la respuesta
    const respuestaRegistrada = await RespuestaDisponibilidad.create({
      notificacion_id,
      instructor_id: notificacion.instructor_id,
      curso_id: notificacion.curso_id,
      respuesta,
      comentarios,
      horario_propuesto
    });
    
    // Marcar la notificación como leída
    await notificacion.update({
      leida: true,
      fecha_lectura: new Date()
    });
    
    // Notificar al administrador sobre la respuesta
    // (Aquí se podría implementar un sistema para notificar a los administradores)
    
    return res.status(201).json({
      mensaje: 'Respuesta registrada exitosamente',
      respuesta: respuestaRegistrada
    });
  } catch (error) {
    console.error('Error al registrar respuesta:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

// RF13.9 Consultar trazabilidad de respuestas
const consultarTrazabilidad = async (req, res) => {
  try {
    const { instructor_id, curso_id, fecha_inicio, fecha_fin } = req.query;
    
    let where = {};
    
    // Filtros opcionales
    if (instructor_id) {
      where.instructor_id = instructor_id;
    }
    
    if (curso_id) {
      where.curso_id = curso_id;
    }
    
    // Filtro por fecha
    if (fecha_inicio && fecha_fin) {
      where.fecha_respuesta = {
        [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
      };
    }
    
    const respuestas = await RespuestaDisponibilidad.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'instructor',
          attributes: ['id', 'nombre', 'apellido', 'email', 'telefono']
        },
        {
          model: Curso,
          as: 'curso',
          attributes: ['ID', 'nombre_curso', 'ficha', 'estado']
        },
        {
          model: NotificacionInstructor,
          as: 'notificacion'
        }
      ],
      order: [['fecha_respuesta', 'DESC']]
    });
    
    return res.status(200).json(respuestas);
  } catch (error) {
    console.error('Error al consultar trazabilidad:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

module.exports = {
  notificarAsignacionCurso,
  notificarCursosDisponibles,
  registrarRespuesta,
  consultarTrazabilidad
};