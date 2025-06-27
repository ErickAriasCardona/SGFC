const FirmaActa = require('../models/FirmaActa');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Acta = require('../models/Acta');
const { sendActaPDFEmail } = require('../services/emailService');

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

// Generar PDF de un acta
const generarPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const acta = await Acta.findByPk(id);
    if (!acta) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    const fileName = `acta_${id}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(18).text('Acta', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Tipo: ${acta.tipo_acta}`);
    doc.text(`Estado: ${acta.estado}`);
    doc.text(`Fecha de creación: ${acta.fecha_creacion}`);
    doc.text(`Enlace: ${acta.enlace || '-'}`);
    doc.moveDown();
    doc.fontSize(14).text('Contenido:', { underline: true });
    doc.fontSize(12).text(acta.contenido);
    if (acta.observaciones) {
      doc.moveDown();
      doc.fontSize(14).text('Observaciones:', { underline: true });
      doc.fontSize(12).text(acta.observaciones);
    }
    doc.end();
    doc.on('finish', () => {
      res.download(filePath, fileName, (err) => {
        if (err) {
          res.status(500).json({ error: 'Error al descargar el PDF' });
        } else {
          fs.unlink(filePath, () => {});
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al generar el PDF', detalle: error.message });
  }
};

// Enviar PDF de acta por correo
const enviarPDFPorCorreo = async (req, res) => {
  try {
    const { id } = req.params;
    const { emails, mensaje } = req.body; // emails puede ser string o array
    const acta = await Acta.findByPk(id);
    if (!acta) {
      return res.status(404).json({ error: 'Acta no encontrada' });
    }
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir);
    }
    const fileName = `acta_${id}.pdf`;
    const filePath = path.join(uploadsDir, fileName);
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));
    doc.fontSize(18).text('Acta', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Tipo: ${acta.tipo_acta}`);
    doc.text(`Estado: ${acta.estado}`);
    doc.text(`Fecha de creación: ${acta.fecha_creacion}`);
    doc.text(`Enlace: ${acta.enlace || '-'}`);
    doc.moveDown();
    doc.fontSize(14).text('Contenido:', { underline: true });
    doc.fontSize(12).text(acta.contenido);
    if (acta.observaciones) {
      doc.moveDown();
      doc.fontSize(14).text('Observaciones:', { underline: true });
      doc.fontSize(12).text(acta.observaciones);
    }
    doc.end();
    doc.on('finish', async () => {
      try {
        await sendActaPDFEmail(
          emails,
          `Acta ${acta.tipo_acta} - ${acta.estado}`,
          mensaje || 'Adjunto encontrarás el acta en PDF.',
          filePath
        );
        fs.unlink(filePath, () => {});
        res.json({ success: true, message: 'Correo enviado con PDF adjunto.' });
      } catch (err) {
        res.status(500).json({ error: 'Error al enviar el correo', detalle: err.message });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al enviar el PDF por correo', detalle: error.message });
  }
};

module.exports = { crearFirma, listarFirmasPorActa, generarPDF, enviarPDFPorCorreo };
