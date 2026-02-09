const express = require('express');
const router = express.Router();
const cursoController = require('../controllers/cursoController');

router.get('/cursos', (req, res) => cursoController.getCursos(req, res));
router.get('/cursos/:id/modulos', (req, res) => cursoController.getModulosByCurso(req, res));

module.exports = router;
