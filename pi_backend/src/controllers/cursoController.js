const cursoService = require('../services/cursoService');

class CursoController {
    getCursos(req, res) {
        cursoService.getCursos((err, cursos) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.json(cursos);
        });
    }

    getModulosByCurso(req, res) {
        cursoService.getModulosByCurso(req.params.id, (err, modulos) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.json(modulos);
        });
    }
}

module.exports = new CursoController();
