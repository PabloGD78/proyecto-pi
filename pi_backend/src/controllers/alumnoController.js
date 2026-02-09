const alumnoService = require('../services/alumnoService');

class AlumnoController {
    getAlumnos(req, res) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        
        alumnoService.getAlumnos(req.profesorId, req.profesorRol, (err, results) => {
            if (err) {
                return res.status(err.status).json({ error: err.error });
            }
            res.json(results);
        });
    }

    getAlumnoById(req, res) {
        alumnoService.getAlumnoById(req.params.id, req.profesorId, req.profesorRol, (err, alumno) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.json(alumno);
        });
    }

    createAlumno(req, res) {
        const { nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, id_curso } = req.body;
        
        alumnoService.createAlumno(nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, id_curso, req.profesorId, (err, result) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.status(201).json(result);
        });
    }

    updateAlumno(req, res) {
        const { dni, fecha_nacimiento, contacto_tutor, datos_medicos, adaptacion_curriculares, id_ficha } = req.body;
        
        alumnoService.updateAlumno(req.params.id, dni, fecha_nacimiento, contacto_tutor, datos_medicos, adaptacion_curriculares, id_ficha, req.profesorId, req.profesorRol, (err, result) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.json(result);
        });
    }

    getAlumnoModulos(req, res) {
        alumnoService.getAlumnoModulos(req.params.id, req.profesorId, req.profesorRol, (err, modulos) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.json(modulos);
        });
    }

    createAlumnoModulo(req, res) {
        const { nombre, codigo, horas, calificacion, estado } = req.body;
        console.log('createAlumnoModulo recibido:', { alumnoId: req.params.id, nombre, codigo, horas, calificacion, estado });
        
        alumnoService.createAlumnoModulo(req.params.id, nombre, codigo, horas, calificacion, estado, (err, result) => {
            if (err) {
                console.error('Error en createAlumnoModulo:', err);
                return res.status(err.status).json(err);
            }
            res.status(201).json(result);
        });
    }

    deleteAlumnoModulo(req, res) {
    // Extraemos los nombres exactos definidos en el router (:id_modulo y :id_alumno)
    const { id_modulo, id_alumno } = req.params;
    
    console.log('Intentando eliminar:', { id_modulo, id_alumno });

    alumnoService.deleteAlumnoModulo(id_modulo, id_alumno, (err, result) => {
        if (err) {
            console.error('Error en deleteAlumnoModulo:', err);
            return res.status(err.status).json(err);
        }
        res.json(result);
    });
}

    deleteAlumno(req, res) {
        alumnoService.deleteAlumno(req.params.id, req.profesorId, req.profesorRol, (err, result) => {
            if (err) {
                return res.status(err.status).json(err);
            }
            res.json(result);
        });
    }
}

module.exports = new AlumnoController();
