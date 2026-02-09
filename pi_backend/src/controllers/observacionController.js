const observacionService = require('../services/observacionService');

class ObservacionController {
    getObservaciones(req, res) {
        observacionService.getObservaciones(req.params.id, req.profesorId, req.profesorRol, (err, observaciones) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.json(observaciones);
        });
    }

    createObservacion(req, res) {
        const { contenido, tipo, visible_tutor } = req.body;
        
        observacionService.createObservacion(req.params.id, contenido, tipo, visible_tutor, (err, result) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.status(201).json(result);
        });
    }

    deleteObservacion(req, res) {
        observacionService.deleteObservacion(req.params.id, (err, result) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.json(result);
        });
    }
}

module.exports = new ObservacionController();
