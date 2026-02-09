const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');
const verificarToken = require('../middleware/authMiddleware');

router.get('/alumnos', verificarToken, (req, res) => alumnoController.getAlumnos(req, res));
router.post('/alumnos', verificarToken, (req, res) => alumnoController.createAlumno(req, res));
router.get('/alumnos/:id', verificarToken, (req, res) => alumnoController.getAlumnoById(req, res));
router.put('/alumnos/:id/guardar', verificarToken, (req, res) => alumnoController.updateAlumno(req, res));
router.delete('/alumnos/:id', verificarToken, (req, res) => alumnoController.deleteAlumno(req, res));
router.get('/alumnos/:id/modulos', verificarToken, (req, res) => alumnoController.getAlumnoModulos(req, res));
router.post('/alumnos/:id/modulo', verificarToken, (req, res) => alumnoController.createAlumnoModulo(req, res));
router.delete('/modulos/:id_modulo/alumno/:id_alumno', verificarToken, (req, res) => alumnoController.deleteAlumnoModulo(req, res));

module.exports = router;
