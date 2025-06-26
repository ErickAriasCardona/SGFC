const express = require('express')
const router = express.Router()
const certificacionController = require('../controllers/evaluacionYCertificacionController')
const authMiddleware = require("../middlewares/authMiddleware");

router.use(authMiddleware);

router.post("/criterioCertificacion", certificacionController.addCriterioCertificacion)// añade el criterio de certificacion
router.get("/criterioCertificacion/:ID?", certificacionController.getCriteriosCertificacion)// busca el criterio certificacion por id (opcionalmente)
router.put("/criterioCertificacion/:id", certificacionController.updatePonderacionCriterio) // ponderaciones
router.put("/criterioCertificacion2/:id", certificacionController.updateCriterioCertificacionWithHistory) // actualizar datos y subirlos al historial
router.post("/evaluacionCriterios", certificacionController.evaluarCumplimientoCriterios)
router.post("/certificaciones/:id?", certificacionController.aprobarORechazarCertificacion)
router.get("/certificaciones/reportes", certificacionController.generarReporteCertificaciones)
router.get("/certificaciones/historico", certificacionController.consultarHistoricoCertificaciones)


module.exports = router;