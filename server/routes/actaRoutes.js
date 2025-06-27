const express = require('express');
const router = express.Router();
const actaController = require('../controllers/actaController');
const firmaActaController = require('../controllers/firmaActaController');
const { authenticateUser } = require('../middlewares/authMiddleware');
const { authorizeRoles } = require('../middlewares/roleMiddleware');

// Crear un acta (solo Gestor o Administrador)
router.post('/actas', authenticateUser, authorizeRoles('Gestor', 'Administrador'), actaController.crearActa);

// Listar todas las actas (todos los roles autenticados)
router.get('/actas', authenticateUser, actaController.listarActas);

// Filtrar actas por query params (todos los roles autenticados)
router.get('/actas/filtrar', authenticateUser, actaController.filtrarActas);

// Registrar una firma para un acta (solo Instructor o Gestor o Administrador)
router.post('/firmas-acta', authenticateUser, authorizeRoles('Instructor', 'Gestor', 'Administrador'), firmaActaController.crearFirma);

// Listar firmas de un acta (todos los roles autenticados)
router.get('/firmas-acta/:acta_ID', authenticateUser, firmaActaController.listarFirmasPorActa);

// Generar PDF de un acta (Gestor o Administrador)
router.get('/actas/:id/pdf', authenticateUser, authorizeRoles('Gestor', 'Administrador'), firmaActaController.generarPDF);

// Enviar PDF de acta por correo (Gestor o Administrador)
router.post('/actas/:id/enviar-pdf', authenticateUser, authorizeRoles('Gestor', 'Administrador'), firmaActaController.enviarPDFPorCorreo);

// Actualizar observaciones y estado de un acta (Gestor o Administrador)
router.put('/actas/:id/observaciones-estado', authenticateUser, authorizeRoles('Gestor', 'Administrador'), actaController.actualizarObservacionesYEstado);

module.exports = router;
