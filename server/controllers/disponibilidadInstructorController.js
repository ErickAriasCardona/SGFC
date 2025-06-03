const {
  DisponibilidadInstructor,
  Usuario,
  Curso,
  AsignacionCursoInstructor,
} = require("../models");
const { Op } = require("sequelize");
const verificarConflictos = require("../utils/verificarConflictosHorarios");

// RF13.1 Crear disponibilidad de horario
const crearDisponibilidad = async (req, res) => {
  try {
    const { instructor_id, disponibilidades } = req.body;

    // Verificar si el instructor existe
    const instructor = await Usuario.findByPk(instructor_id);
    if (!instructor || instructor.rol !== "instructor") {
      return res.status(404).json({
        mensaje: "Instructor no encontrado o el usuario no es un instructor",
      });
    }

    // Crear múltiples disponibilidades
    const disponibilidadesCreadas = await DisponibilidadInstructor.bulkCreate(
      disponibilidades.map((disp) => ({
        instructor_id,
        ...disp,
      }))
    );

    return res.status(201).json({
      mensaje: "Disponibilidad creada exitosamente",
      disponibilidades: disponibilidadesCreadas,
    });
  } catch (error) {
    console.error("Error al crear disponibilidad:", error);
    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

// RF13.2 Consultar disponibilidad de horario
const consultarDisponibilidad = async (req, res) => {
  try {
    const { instructor_id, fecha_inicio, fecha_fin, dia_semana } = req.query;

    let where = {};

    // Filtrar por instructor si se proporciona
    if (instructor_id) {
      where.instructor_id = instructor_id;
    }

    // Filtrar por día de la semana si se proporciona
    if (dia_semana) {
      where.dia_semana = dia_semana;
    }

    // Filtrar por rango de fechas si se proporciona
    if (fecha_inicio && fecha_fin) {
      where[Op.or] = [
        {
          fecha_inicio_periodo: {
            [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)],
          },
        },
        {
          fecha_fin_periodo: {
            [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)],
          },
        },
        {
          [Op.and]: [
            { fecha_inicio_periodo: { [Op.lte]: new Date(fecha_inicio) } },
            { fecha_fin_periodo: { [Op.gte]: new Date(fecha_fin) } },
          ],
        },
      ];
    }

    // Solo mostrar disponibilidades activas
    where.estado = "activo";

    const disponibilidades = await DisponibilidadInstructor.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: "instructor",
          attributes: ["id", "nombre", "apellido", "email", "telefono"],
        },
      ],
      order: [
        ["dia_semana", "ASC"],
        ["hora_inicio", "ASC"],
      ],
    });

    return res.status(200).json(disponibilidades);
  } catch (error) {
    console.error("Error al consultar disponibilidad:", error);
    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

// RF13.3 Actualizar disponibilidad de horario
const actualizarDisponibilidad = async (req, res) => {
  try {
    const { id } = req.params;
    const datosActualizados = req.body;

    const disponibilidad = await DisponibilidadInstructor.findByPk(id);

    if (!disponibilidad) {
      return res.status(404).json({ mensaje: "Disponibilidad no encontrada" });
    }

    // Si se están cambiando los horarios, verificar conflictos
    if (
      datosActualizados.hora_inicio ||
      datosActualizados.hora_fin ||
      datosActualizados.dia_semana
    ) {
      const tieneConflictos = await verificarConflictos(
        disponibilidad.instructor_id,
        datosActualizados.dia_semana || disponibilidad.dia_semana,
        datosActualizados.hora_inicio || disponibilidad.hora_inicio,
        datosActualizados.hora_fin || disponibilidad.hora_fin,
        disponibilidad.id
      );

      if (tieneConflictos) {
        return res.status(400).json({
          mensaje: "La actualización genera conflictos con otros horarios",
          conflictos: tieneConflictos,
        });
      }
    }

    await disponibilidad.update(datosActualizados);

    return res.status(200).json({
      mensaje: "Disponibilidad actualizada exitosamente",
      disponibilidad,
    });
  } catch (error) {
    console.error("Error al actualizar disponibilidad:", error);
    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

// RF13.4 Validar conflictos de horarios
const validarConflictos = async (req, res) => {
  try {
    const {
      instructor_id,
      dia_semana,
      hora_inicio,
      hora_fin,
      disponibilidad_id,
    } = req.body;

    const conflictos = await verificarConflictos(
      instructor_id,
      dia_semana,
      hora_inicio,
      hora_fin,
      disponibilidad_id
    );

    if (conflictos.length > 0) {
      return res.status(200).json({
        hayConflictos: true,
        conflictos: conflictos,
      });
    }

    return res.status(200).json({
      hayConflictos: false,
      mensaje: "No hay conflictos de horario",
    });
  } catch (error) {
    console.error("Error al validar conflictos de horario:", error);
    return res
      .status(500)
      .json({ mensaje: "Error interno del servidor", error: error.message });
  }
};

module.exports = {
  crearDisponibilidad,
  consultarDisponibilidad,
  actualizarDisponibilidad,
  validarConflictos,
};
