const { DisponibilidadInstructor, Curso, AsignacionCursoInstructor } = require('../models');
const { Op } = require('sequelize');

/**
 * Verifica si hay conflictos de horario para un instructor
 * @param {number} instructorId - ID del instructor
 * @param {string} diaSemana - Día de la semana (Lunes, Martes, etc.)
 * @param {string} horaInicio - Hora de inicio (formato HH:MM:SS)
 * @param {string} horaFin - Hora de fin (formato HH:MM:SS)
 * @param {number|null} disponibilidadId - ID de la disponibilidad actual (para excluir al verificar)
 * @returns {Promise<Array>} - Lista de conflictos encontrados
 */
const verificarConflictos = async (instructorId, diaSemana, horaInicio, horaFin, disponibilidadId = null) => {
  try {
    const conflictos = [];
    
    // 1. Verificar conflictos con otras disponibilidades del instructor
    const disponibilidadesConflicto = await DisponibilidadInstructor.findAll({
      where: {
        instructor_id: instructorId,
        dia_semana: diaSemana,
        estado: 'activo',
        [Op.or]: [
          {
            hora_inicio: {
              [Op.between]: [horaInicio, horaFin]
            }
          },
          {
            hora_fin: {
              [Op.between]: [horaInicio, horaFin]
            }
          },
          {
            [Op.and]: [
              { hora_inicio: { [Op.lte]: horaInicio } },
              { hora_fin: { [Op.gte]: horaFin } }
            ]
          }
        ],
        ...(disponibilidadId ? { id: { [Op.ne]: disponibilidadId } } : {})
      }
    });
    
    if (disponibilidadesConflicto.length > 0) {
      conflictos.push({
        tipo: 'disponibilidad',
        mensaje: 'Conflicto con otra disponibilidad registrada',
        conflictos: disponibilidadesConflicto
      });
    }
    
    // 2. Verificar conflictos con cursos asignados al instructor
    const cursosAsignados = await AsignacionCursoInstructor.findAll({
      where: {
        instructor_id: instructorId
      },
      include: [
        {
          model: Curso,
          as: 'curso',
          where: {
            estado: {
              [Op.in]: ['activo', 'pendiente']
            },
            dias_formacion: {
              [Op.like]: `%${diaSemana.charAt(0)}%` // Se asume que días_formacion guarda primeras letras de días
            }
          }
        }
      ]
    });
    
    // Verificar conflictos de horario con cursos asignados
    const cursosConflicto = cursosAsignados.filter(asignacion => {
      const curso = asignacion.curso;
      
      // Comparar horarios
      return (curso.hora_inicio <= horaFin && curso.hora_fin >= horaInicio);
    });
    
    if (cursosConflicto.length > 0) {
      conflictos.push({
        tipo: 'curso',
        mensaje: 'Conflicto con cursos asignados',
        conflictos: cursosConflicto
      });
    }
    
    return conflictos;
  } catch (error) {
    console.error('Error al verificar conflictos de horario:', error);
    throw error;
  }
};

module.exports = verificarConflictos;