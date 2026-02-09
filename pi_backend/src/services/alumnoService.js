class AlumnoService {
    getAlumnos(profesorId, profesorRol, callback) {
        let query = `
            SELECT a.*, f.datos_medicos, f.adaptacion_curriculares, 
                    p.nombre AS tutor_nombre,
                    CONCAT(c.anio, 'º', c.nombre) AS curso_nombre
            FROM alumno a
            LEFT JOIN ficha f ON a.id_ficha = f.id_ficha
            LEFT JOIN curso c ON a.id_curso = c.id
            LEFT JOIN profesor p ON a.id_profesor = p.id`;

        let queryParams = [];
        if (profesorRol !== 'admin') {
            query += ` WHERE a.id_profesor = ?`;
            queryParams.push(profesorId);
        }
      
        global.db.query(query, queryParams, (err, results) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            callback(null, results);
        });
    }

    getAlumnoById(alumnoId, profesorId, profesorRol, callback) {
        let query = `SELECT a.*, f.datos_medicos, f.adaptacion_curriculares, f.id_ficha, CONCAT(c.anio, 'º', c.nombre) AS curso_nombre FROM alumno a LEFT JOIN ficha f ON a.id_ficha = f.id_ficha LEFT JOIN curso c ON a.id_curso = c.id WHERE a.id = ?`;
        let params = [alumnoId];

        if (profesorRol !== 'admin') {
            query += " AND a.id_profesor = ?";
            params.push(profesorId);
        }

        global.db.query(query, params, (err, results) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            if (results.length === 0) {
                return callback({ status: 404, message: "No encontrado" });
            }
            callback(null, results[0]);
        });
    }

    createAlumno(nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, id_curso, profesorId, callback) {
        const query = `INSERT INTO alumno (nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, id_curso, id_profesor, ultima_modificacion) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
        global.db.query(query, [nombre, apellidos, dni, fecha_nacimiento, contacto_tutor, id_curso, profesorId], (err, result) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            callback(null, { message: "Éxito", id: result.insertId });
        });
    }

    updateAlumno(alumnoId, dni, fecha_nacimiento, contacto_tutor, datos_medicos, adaptacion_curriculares, id_ficha, profesorId, profesorRol, callback) {
        let queryUpdate = "UPDATE alumno SET dni = ?, fecha_nacimiento = ?, contacto_tutor = ?, ultima_modificacion = NOW() WHERE id = ?";
        let paramsUpdate = [dni, fecha_nacimiento, contacto_tutor, alumnoId];

        if (profesorRol !== 'admin') {
            queryUpdate += " AND id_profesor = ?";
            paramsUpdate.push(profesorId);
        }

        global.db.query(queryUpdate, paramsUpdate, (err, result) => {
            if (err) {
                return callback({ status: 500, error: "Error en tabla alumno" });
            }
            if (result.affectedRows === 0) {
                return callback({ status: 403, error: "No tienes permiso" });
            }

            if (id_ficha) {
                global.db.query("UPDATE ficha SET datos_medicos = ?, adaptacion_curriculares = ? WHERE id_ficha = ?", [datos_medicos, adaptacion_curriculares, id_ficha], (err) => {
                    if (err) {
                        return callback({ status: 500, error: "Error en tabla ficha" });
                    }
                    callback(null, { message: "Guardado" });
                });
            } else {
                global.db.query("INSERT INTO ficha (datos_medicos, adaptacion_curriculares, fecha_creacion) VALUES (?, ?, NOW())", [datos_medicos, adaptacion_curriculares], (err, fichaResult) => {
                    if (err) {
                        return callback({ status: 500, error: "Error al crear ficha" });
                    }
                    const newFichaId = fichaResult.insertId;
                    global.db.query("UPDATE alumno SET id_ficha = ? WHERE id = ?", [newFichaId, alumnoId], () => {
                        callback(null, { message: "Vinculada" });
                    });
                });
            }
        });
    }

    getAlumnoModulos(alumnoId, profesorId, profesorRol, callback) {
        let query = `SELECT m.nombre_modulo, m.horas, am.estado, am.id_modulo FROM modulo m INNER JOIN alumno_modulo am ON m.id_modulo = am.id_modulo INNER JOIN alumno a ON am.id_alumno = a.id WHERE am.id_alumno = ?`;
        let params = [alumnoId];
        if (profesorRol !== 'admin') {
            query += " AND a.id_profesor = ?";
            params.push(profesorId);
        }
        global.db.query(query, params, (err, results) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            callback(null, results);
        });
    }

    createAlumnoModulo(alumnoId, nombre, codigo, horas, calificacion, estado, callback) {
        // Insertar el módulo (solo nombre_modulo y horas, sin codigo)
        const queryInsertModulo = `INSERT INTO modulo (nombre_modulo, horas) VALUES (?, ?)`;
        
        global.db.query(queryInsertModulo, [nombre, horas || 0], (err, result) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            
            const moduloId = result.insertId;
            
            // Vincular al alumno
            const queryLinkModulo = `INSERT INTO alumno_modulo (id_alumno, id_modulo, estado, calificacion) VALUES (?, ?, ?, ?)`;
            global.db.query(queryLinkModulo, [alumnoId, moduloId, estado || 'Pendiente', calificacion || null], (err) => {
                if (err) {
                    return callback({ status: 500, error: err.message });
                }
                callback(null, { message: 'Módulo añadido' });
            });
        });
    }

    deleteAlumnoModulo(idModulo, idAlumno, callback) {
    // Primero borramos la relación en la tabla intermedia
    const queryIntermedia = 'DELETE FROM alumno_modulo WHERE id_modulo = ? AND id_alumno = ?';
    
    global.db.query(queryIntermedia, [idModulo, idAlumno], (err, result) => {
        if (err) return callback({ status: 500, error: err.message });

        // Si no se borró ninguna fila, es que los IDs estaban mal
        if (result.affectedRows === 0) {
            return callback({ status: 404, error: "No se encontró la relación para eliminar" });
        }

        // AHORA: Borramos el módulo físico de la tabla 'modulo'
        const queryModulo = 'DELETE FROM modulo WHERE id_modulo = ?';
        global.db.query(queryModulo, [idModulo], (err) => {
            if (err) return callback({ status: 500, error: "Relación borrada, pero falló borrar el módulo físico" });
            
            callback(null, { message: 'Módulo eliminado de la app y de la base de datos' });
        });
    });
}

    deleteAlumno(alumnoId, profesorId, profesorRol, callback) {
        let query = "DELETE FROM alumno WHERE id = ?";
        let params = [alumnoId];

        if (profesorRol !== 'admin') {
            query = "DELETE FROM alumno WHERE id = ? AND id_profesor = ?";
            params.push(profesorId);
        }

        global.db.query(query, params, (err, result) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            if (result.affectedRows === 0) {
                return callback({ status: 403, message: "No tienes permiso o el alumno no existe" });
            }
            callback(null, { message: 'Alumno eliminado correctamente' });
        });
    }
}

module.exports = new AlumnoService();
