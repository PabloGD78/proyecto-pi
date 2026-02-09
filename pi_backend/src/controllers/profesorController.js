const profesorService = require('../services/profesorService');

class ProfesorController {
    getProfesores(req, res) {
        if (req.profesorRol !== 'admin') {
            return res.status(403).json({ message: "No autorizado" });
        }

        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');

        profesorService.getProfesores((err, profesores) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.json(profesores);
        });
    }

    createProfesor(req, res) {
        if (req.profesorRol !== 'admin') {
            return res.status(403).json({ message: "No autorizado" });
        }

        const { nombre, email, contrasenia, rol } = req.body;
        
        profesorService.createProfesor(nombre, email, contrasenia, rol, (err, result) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.status(201).json(result);
        });
    }

    deleteProfesor(req, res) {
        if (req.profesorRol !== 'admin') {
            return res.status(403).json({ message: "No autorizado" });
        }

        profesorService.deleteProfesor(req.params.id, req.profesorId, (err, result) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.json(result);
        });
    }
}

module.exports = new ProfesorController();
