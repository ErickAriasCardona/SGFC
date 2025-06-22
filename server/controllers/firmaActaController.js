const FirmaActa = require('../models/FirmaActa');

// Crear una firma para un acta
const crearFirma = async (req, res) => {
  try {
    const { acta_ID, usuario_ID, tipo_firma, firma } = req.body;
    const nuevaFirma = await FirmaActa.create({
      acta_ID,
      usuario_ID,
      tipo_firma,
      fecha_firma: new Date(),
      firma
    });
    res.status(201).json(nuevaFirma);
  } catch (error) {
    res.status(500).json({ error: 'Error al registrar la firma', detalle: error.message });
  }
};

// Consultar todas las firmas de un acta
const listarFirmasPorActa = async (req, res) => {
  try {
    const { acta_ID } = req.params;
    const firmas = await FirmaActa.findAll({ where: { acta_ID } });
    res.json(firmas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las firmas', detalle: error.message });
  }
};

module.exports = { crearFirma, listarFirmasPorActa };
