const express = require('express');
const router = express.Router();
const observacionController = require('../controllers/observacionController');
const verificarToken = require('../middleware/authMiddleware');

router.get('/alumnos/:id/observaciones', verificarToken, (req, res) => observacionController.getObservaciones(req, res));
router.post('/alumnos/:id/observacion', verificarToken, (req, res) => observacionController.createObservacion(req, res));
router.delete('/observaciones/:id', verificarToken, (req, res) => observacionController.deleteObservacion(req, res));

module.exports = router;
