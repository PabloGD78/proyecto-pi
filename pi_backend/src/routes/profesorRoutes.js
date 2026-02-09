const express = require('express');
const router = express.Router();
const profesorController = require('../controllers/profesorController');
const verificarToken = require('../middleware/authMiddleware');

router.get('/admin/profesores', verificarToken, (req, res) => profesorController.getProfesores(req, res));
router.post('/admin/profesores', verificarToken, (req, res) => profesorController.createProfesor(req, res));
router.delete('/admin/profesores/:id', verificarToken, (req, res) => profesorController.deleteProfesor(req, res));

module.exports = router;
