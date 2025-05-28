// controllers/inscripcionCursoController.js
const { InscripcionCurso } = require('../models');

const actualizarEstadoInscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { nuevoEstado } = req.body;
    const usuario = req.user;

    // Verificar si el usuario es administrador
    if (!usuario || usuario.rol !== 'administrador') {
      return res.status(403).json({ mensaje: 'No tienes permisos para realizar esta acción.' });
    }

    // Validar estado permitido
    const estadosValidos = ['activo', 'rechazado', 'pendiente'];
    if (!estadosValidos.includes(nuevoEstado)) {
      return res.status(400).json({ mensaje: 'Estado no válido.' });
    }

    // Buscar la inscripción
    const inscripcion = await InscripcionCurso.findByPk(id);
    if (!inscripcion) {
      return res.status(404).json({ mensaje: 'Inscripción no encontrada.' });
    }

    // Actualizar estado
    inscripcion.estado_inscripcion = nuevoEstado;
    await inscripcion.save();

    return res.status(200).json({
      mensaje: 'Estado de inscripción actualizado correctamente.',
      inscripcion,
    });
  } catch (error) {
    console.error('Error al actualizar el estado:', error);
    return res.status(500).json({ mensaje: 'Error del servidor.' });
  }
};

module.exports = {
  actualizarEstadoInscripcion,
};
