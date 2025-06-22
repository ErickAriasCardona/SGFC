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

module.exports = { crearActa, listarActas };
