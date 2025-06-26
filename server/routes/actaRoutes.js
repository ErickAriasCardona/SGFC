const express = require('express');
const router = express.Router();
const actaController = require('../controllers/actaController');
const firmaActaController = require('../controllers/firmaActaController');

// Crear un acta
router.post('/actas', actaController.crearActa);

// Listar todas las actas
router.get('/actas', actaController.listarActas);

// Filtrar actas por query params
router.get('/actas/filtrar', actaController.filtrarActas);

// Registrar una firma para un acta
router.post('/firmas-acta', firmaActaController.crearFirma);

// Listar firmas de un acta
router.get('/firmas-acta/:acta_ID', firmaActaController.listarFirmasPorActa);

// Generar PDF de un acta
router.get('/actas/:id/pdf', firmaActaController.generarPDF);

module.exports = router;
