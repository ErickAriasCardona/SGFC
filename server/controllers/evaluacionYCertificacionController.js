const Certificacion = require('../models/certificacion')
const evaluacion_criterios = require('../models/evaluacionCriterios')
const criterios_certificacion = require('../models/criteriosCertificacion')
const Usuario = require('../models/User')

const { sendCertificationNotification } = require('../services/emailService');
const Curso = require('../models/curso');
const AsignacionCursoInstructor = require('../models/AsignacionCursoInstructor')
const { Op } = require('sequelize');

const addCriterioCertificacion = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== 'Instructor') {
      return res.status(403).json({ message: "No tienes permisos para crear criterios de certificación." });
    }

    const { nombre, descripcion, ponderacion, programa_formacion_ID } = req.body;

    // Validar campos obligatorios
    if (!nombre || !descripcion || !ponderacion || !programa_formacion_ID) {
      return res.status(400).json({
        message: "Los campos nombre, descripcion, ponderacion y programa_formacion_ID son obligatorios.",
      });
    }

    // Validar que la ponderación esté dentro del rango permitido
    if (ponderacion < 0 || ponderacion > 100) {
      return res.status(400).json({
        message: "La ponderación debe estar entre 0 y 100.",
      });
    }

    // Verificar que la suma de las ponderaciones no exceda el 100%
    const criteriosExistentes = await criterios_certificacion.findAll({
      where: { programa_formacion_ID },
      attributes: ['ponderacion'],
    });

    const sumaPonderaciones = criteriosExistentes.reduce((total, criterio) => total + parseFloat(criterio.ponderacion), 0);

    if (sumaPonderaciones + parseFloat(ponderacion) > 100) {
      return res.status(400).json({
        message: `La suma de las ponderaciones no puede exceder el 100%. ${sumaPonderaciones}`,
      });
    }

    // Crear el criterio de certificación
    const nuevoCriterio = await criterios_certificacion.create({
      nombre,
      descripcion,
      ponderacion,
      programa_formacion_ID,
      responsable_creacion: req.user.id,
    });

    res.status(201).json({ message: "Criterio de certificación creado con éxito.", criterio: nuevoCriterio });
  } catch (error) {
    console.error("Error al crear el criterio de certificación:", error);
    res.status(500).json({ message: "Error al crear el criterio de certificación." });
  }
};

const getCriteriosCertificacion = async (req, res) => {
  try {

    const { accountType } = req.user;
    if (accountType !== 'Instructor') {
      return res.status(403).json({ message: "No tienes permisos para crear criterios de certificación." });
    }

    const { ID } = req.params;


    // Validar que el ID sea un número válido si está presente
    if (ID && isNaN(ID)) {
      return res.status(400).json({ message: "El ID debe ser un número válido." });
    }

    // Construir la condición WHERE de forma dinámica
    const whereCondition = ID ? { ID } : {};

    // Consultar los criterios de certificación
    const criterios = await criterios_certificacion.findAll({
      where: whereCondition,
      attributes: ['ID', 'nombre', 'descripcion', 'ponderacion', 'fecha_creacion', 'programa_formacion_ID', 'responsable_creacion'],
    });

    // Exportación a PDF o Excel (comentado por ahora)
    // Aquí se puede implementar la lógica para exportar los datos a PDF o Excel
    // Ejemplo: generarPDF(criterios) o generarExcel(criterios)

    res.status(200).json(criterios);
  } catch (error) {
    console.error("Error al obtener los criterios de certificación:", error);
    res.status(500).json({ message: "Error al obtener los criterios de certificación." });
  }
};
// se podria quitar realmente y se reemplaza con updateCriterioCertificacionWithHistory
const updatePonderacionCriterio = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== 'Instructor') {
      return res.status(403).json({ message: "No tienes permisos para crear criterios de certificación." });
    }

    const { id } = req.params;
    const { ponderacion } = req.body;

    // Validar que la ponderación esté dentro del rango permitido
    if (ponderacion < 0 || ponderacion > 100) {
      return res.status(400).json({
        message: "La ponderación debe estar entre 0 y 100.",
      });
    }

    // Buscar el criterio de certificación
    const criterio = await criterios_certificacion.findByPk(id)
    if (!criterio) {
      return res.status(404).json({ message: "Criterio de certificación no encontrado." });
    }

    // Verificar que la suma de las ponderaciones no exceda el 100%
    const criteriosExistentes = await criterios_certificacion.findAll({
      where: { programa_formacion_ID: criterio.programa_formacion_ID },
      attributes: ['ID', 'ponderacion'],
    });

    const sumaPonderaciones = criteriosExistentes.reduce((total, c) => { // total es el acumulador y c es el criterio actual
      if (c.ID === parseInt(id)) {
        return total + parseFloat(ponderacion); // Usar la nueva ponderación
      }
      return total + parseFloat(c.ponderacion);
    }, 0);

    if (sumaPonderaciones > 100) {
      return res.status(400).json({
        message: "La suma de las ponderaciones no puede exceder el 100%.",
      });
    }

    // Actualizar la ponderación del criterio
    await criterio.update({ ponderacion });

    // Registrar historial de cambios (comentado por ahora)
    // Aquí se puede implementar la lógica para registrar el historial de cambios
    // Ejemplo: registrarHistorial({ criterioId: id, cambio: `Ponderación actualizada a ${ponderacion}` });

    res.status(200).json({ message: "Ponderación actualizada con éxito.", criterio });
  } catch (error) {
    console.error("Error al actualizar la ponderación del criterio:", error);
    res.status(500).json({ message: "Error al actualizar la ponderación del criterio." });
  }
};

const updateCriterioCertificacionWithHistory = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== 'Instructor') {
      return res.status(403).json({ message: "No tienes permisos para crear criterios de certificación." });
    }

    const { id } = req.params;
    const { nombre, descripcion, ponderacion } = req.body;

    // Validar que la ponderación esté dentro del rango permitido
    if (ponderacion < 0 || ponderacion > 100) {
      return res.status(400).json({
        message: "La ponderación debe estar entre 0 y 100.",
      });
    }

    // Buscar el criterio de certificación
    const criterio = await criterios_certificacion.findByPk(id);
    if (!criterio) {
      return res.status(404).json({ message: "Criterio de certificación no encontrado." });
    }

    // Registrar historial de cambios
    // const historial = {
    //   criterio_ID: criterio.ID,
    //   nombre_anterior: criterio.nombre,
    //   descripcion_anterior: criterio.descripcion,
    //   ponderacion_anterior: criterio.ponderacion,
    //   fecha_modificacion: new Date(),
    // };

    // Guardar el historial en una tabla separada (comentado por ahora)
    // await historial_criterios.create(historial);

    // Actualizar el criterio de certificación
    await criterio.update({ nombre, descripcion, ponderacion });

    res.status(200).json({ message: "Criterio de certificación actualizado con éxito.", criterio });
  } catch (error) {
    console.error("Error al actualizar el criterio de certificación:", error);
    res.status(500).json({ message: "Error al actualizar el criterio de certificación." });
  }
};

const evaluarCumplimientoCriterios = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== 'Instructor') {
      return res.status(403).json({ message: "No tienes permisos para crear criterios de certificación." });
    }
    const { criterio_ID, aprendiz_ID, cumple, observaciones } = req.body;

    // Validar campos obligatorios
    if (!criterio_ID || !aprendiz_ID || cumple === undefined) {
      return res.status(400).json({
        message: "Los campos criterio_ID, aprendiz_ID y cumple son obligatorios.",
      });
    }

    // Verificar que el criterio esté previamente definido
    const criterio = await criterios_certificacion.findByPk(criterio_ID);
    if (!criterio) {
      return res.status(404).json({ message: "El criterio de certificación no existe." });
    }

    // Verificar si ya existe una evaluación para este aprendiz y criterio
    const evaluacionExistente = await evaluacion_criterios.findOne({
      where: { criterio_ID, aprendiz_ID },
    });

    if (evaluacionExistente) {
      // Permitir edición antes de la revisión final
      await evaluacionExistente.update({ cumple, observaciones });
      return res.status(200).json({
        message: "Evaluación actualizada con éxito.",
        evaluacion: evaluacionExistente,
      });
    }

    // Crear una nueva evaluación
    const nuevaEvaluacion = await evaluacion_criterios.create({
      criterio_ID,
      aprendiz_ID,
      cumple,
      observaciones,
    });

    res.status(201).json({
      message: "Evaluación registrada con éxito.",
      evaluacion: nuevaEvaluacion,
    });
  } catch (error) {
    console.error("Error al evaluar el cumplimiento de los criterios:", error);
    res.status(500).json({ message: "Error al evaluar el cumplimiento de los criterios." });
  }
};

// se utiliza este mismo controlador para crear el registro de la certificacion
// y tambien para actualizar la razon de rechazo como estipula el CU 17.9
// asi mismo tambien notifica al aprendiz al momento de registrar la certificaion como estipula el CU 17.7
const aprobarORechazarCertificacion = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== 'Instructor') {
      return res.status(403).json({ message: "No tienes permisos para crear criterios de certificación." });
    }
    const { id } = req.params; // Obtener el ID de la certificación desde la ruta
    const { aprendiz_ID, curso_ID, razones_rechazo } = req.body;
    let estado = 'rechazado'
    // Validar campos obligatorios
    if (!aprendiz_ID || !curso_ID ) {
      return res.status(400).json({
        message: "Los campos aprendiz_ID, curso_ID y estado son obligatorios.",
      });
    }

    if (id) {
      // Actualizar razones de rechazo si el ID de certificación existe
      const certificacionExistente = await Certificacion.findByPk(id);
      if (!certificacionExistente) {
        return res.status(404).json({ message: "Certificación no encontrada." });
      }

      await certificacionExistente.update({ razones_rechazo });
      return res.status(200).json({
        message: "Razones de rechazo actualizadas con éxito.",
        certificacion: certificacionExistente,
        estado: 'rechazado'
      });
    }

    // Verificar si ya existe una certificación para este aprendiz y curso
    const certificacionExistente = await Certificacion.findOne({
      where: { aprendiz_ID, curso_ID },
    });

    if (certificacionExistente) {
      return res.status(400).json({
        message: "Ya existe una certificación registrada para este aprendiz y curso.",
      });
    }

    // Verificación de cumplimiento de criterios asociados al curso
    const criterios = await criterios_certificacion.findAll({
      where: { programa_formacion_ID: curso_ID },
      attributes: ['ID', 'ponderacion'],
    });

    if (criterios.length === 0) {
      return res.status(404).json({
        message: "No se encontraron criterios de certificación para este curso.",
      });
    }

    const evaluaciones = await evaluacion_criterios.findAll({
      where: { aprendiz_ID },
      attributes: ['criterio_ID', 'cumple'],
    });

    if (evaluaciones.length === 0) {
      return res.status(404).json({
        message: "No se encontraron evaluaciones para este aprendiz.",
      });
    }

    // Calcular el cumplimiento ponderado
    let ponderacionTotal = 0;
    let ponderacionCumplida = 0;

    criterios.forEach((criterio) => {
      const evalC = evaluaciones.find(e => e.criterio_ID === criterio.ID);
      if (evalC) {
        ponderacionTotal += parseFloat(criterio.ponderacion);
        if (evalC.cumple) {
          ponderacionCumplida += parseFloat(criterio.ponderacion);
        }
      }
    });

    const porcentajeCumplido = (ponderacionCumplida / ponderacionTotal) * 100;
    const cumple = porcentajeCumplido >= 70;

    // Crear la certificación
    const nuevaCertificacion = await Certificacion.create({
      aprendiz_ID,
      curso_ID,
      estado: cumple ? 'aprobado' : estado,
      razones_rechazo: estado === 'rechazado' ? razones_rechazo : null,
      ponderacion: porcentajeCumplido,
      fecha_certificacion: new Date(),
    });

    const curso = await Curso.findByPk(curso_ID);
    // Generar notificación automática para el aprendiz
    try {
      const aprendiz = await Usuario.findByPk(aprendiz_ID);
      if (aprendiz && aprendiz.email) {
        await sendCertificationNotification(
          aprendiz.email,
          nuevaCertificacion.estado,
          curso.nombre_curso,
          razones_rechazo,
          porcentajeCumplido
        );
      }
    } catch (notificacionError) {
      console.error("Error al enviar la notificación:", notificacionError);
    }

    return res.status(201).json({
      message: "Certificación registrada con éxito.",
      certificacion: nuevaCertificacion,
    });
  } catch (error) {
    console.error("Error al registrar la certificación:", error);
    return res.status(500).json({ message: "Error al registrar la certificación." });
  }
};


const generarReporteCertificaciones = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== 'Instructor') {
      return res.status(403).json({ message: "No tienes permisos para crear criterios de certificación." });
    }
    const { estado, curso_ID, fecha_inicio, fecha_fin } = req.query;

    // Construir condiciones de búsqueda dinámicas
    const whereCondition = {};
    if (estado) whereCondition.estado = estado;
    if (curso_ID) whereCondition.curso_ID = curso_ID;
    if (fecha_inicio && fecha_fin) {
      whereCondition.fecha_certificacion = {
        [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)],
      };
    }

    // Consultar certificaciones
    const certificaciones = await Certificacion.findAll({
      //attributes: ['ID', 'estado', 'ponderacion'],
      where: whereCondition,
      include: [
        { model: Curso, attributes: ['nombre_curso'] },
        { model: Usuario, attributes: ['email'] },
      ],
    });

    // Exportación a PDF o Excel (comentado por ahora)
    // Aquí se puede implementar la lógica para exportar los datos a PDF o Excel
    // Ejemplo: generarPDF(certificaciones) o generarExcel(certificaciones)

    res.status(200).json(certificaciones);
  } catch (error) {
    console.error("Error al generar el reporte de certificaciones:", error);
    res.status(500).json({ message: "Error al generar el reporte de certificaciones." });
  }
};

const consultarHistoricoCertificaciones = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== 'Instructor') {
      return res.status(403).json({ message: "No tienes permisos para crear criterios de certificación." });
    }
    const { instructor_ID, curso_ID, estado, fecha_inicio, fecha_fin } = req.query;

    // Construir condiciones de búsqueda dinámicas
    const whereCondition = {};
    if (estado) whereCondition.estado = estado;
    if (curso_ID) whereCondition.curso_ID = curso_ID;
    if (fecha_inicio && fecha_fin) {
      whereCondition.fecha_certificacion = {
        [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)],
      };
    }

    // Si se proporciona instructor_ID, filtrar por cursos asignados al instructor
    let cursosAsignados = [];
    if (instructor_ID) {
      const asignaciones = await AsignacionCursoInstructor.findAll({
        where: { instructor_ID },
        attributes: ['curso_ID'],
      });
      cursosAsignados = asignaciones.map(asignacion => asignacion.curso_ID);
      whereCondition.curso_ID = { [Op.in]: cursosAsignados };
    }

    // Consultar certificaciones
    const certificaciones = await Certificacion.findAll({
      where: whereCondition,
      include: [
        { model: Curso, attributes: ['nombre_curso', 'ID'], include: [
          { model: AsignacionCursoInstructor, as: "asignaciones", attributes: ['instructor_ID'] }
        ] },
        { model: Usuario, attributes: ['email'] },
      ],
    });

    // Exportación a PDF o Excel (comentado por ahora)
    // Aquí se puede implementar la lógica para exportar los datos a PDF o Excel
    // Ejemplo: generarPDF(certificaciones) o generarExcel(certificaciones)

    res.status(200).json(certificaciones);
  } catch (error) {
    console.error("Error al consultar el histórico de certificaciones:", error);
    res.status(500).json({ message: "Error al consultar el histórico de certificaciones." });
  }
};

module.exports = {
  addCriterioCertificacion,
  getCriteriosCertificacion,
  updatePonderacionCriterio,
  updateCriterioCertificacionWithHistory,
  evaluarCumplimientoCriterios,
  aprobarORechazarCertificacion,
  generarReporteCertificaciones,
  consultarHistoricoCertificaciones,
}