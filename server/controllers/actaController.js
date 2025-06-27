const  Acta  = require('../models/Acta');

// Crear un acta
const crearActa = async (req, res) => {
  try {
    const { tipo_acta, estado, enlace, contenido } = req.body;
    const nuevaActa = await Acta.create({
      tipo_acta,
      estado: estado || 'pendiente',
      enlace,
      contenido,
      fecha_creacion: new Date()
    });
    res.status(201).json(nuevaActa);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el acta', detalle: error.message });
  }
};

// Consultar todas las actas
const listarActas = async (req, res) => {
  try {
    const actas = await Acta.findAll();
    res.json(actas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las actas', detalle: error.message });
  }
};


// Consultar actas con filtros
const filtrarActas = async (req, res) => {
  try {
    const { tipo_acta, estado, fecha, instructor_ID, curso_ID } = req.query;
    const where = {};
    if (tipo_acta) where.tipo_acta = tipo_acta;
    if (estado) where.estado = estado;
    if (fecha) where.fecha_creacion = fecha;
    // Puedes agregar más filtros según relaciones futuras (ej: instructor_ID, curso_ID)
    const actas = await Acta.findAll({ where });
    res.json(actas);
  } catch (error) {
    res.status(500).json({ error: 'Error al filtrar las actas', detalle: error.message });
  }
};

// Actualizar observaciones y estado de un acta
const actualizarObservacionesYEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones, estado } = req.body;
    const acta = await Acta.findByPk(id);
    if (!acta) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }
    if (observaciones !== undefined) acta.observaciones = observaciones;
    if (estado !== undefined) acta.estado = estado;
    await acta.save();
    res.json(acta);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el acta', detalle: error.message });
  }
};

module.exports = { crearActa, listarActas, filtrarActas, actualizarObservacionesYEstado };
