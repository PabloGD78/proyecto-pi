class ObservacionService {
    getObservaciones(alumnoId, profesorId, profesorRol, callback) {
        let query = 'SELECT o.* FROM observacion o JOIN alumno a ON o.id_alumno = a.id WHERE o.id_alumno = ?';
        let params = [alumnoId];
        if (profesorRol !== 'admin') {
            query += " AND a.id_profesor = ?";
            params.push(profesorId);
        }
        
        global.db.query(query + ' ORDER BY o.fecha DESC', params, (err, results) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            callback(null, results);
        });
    }

    createObservacion(alumnoId, contenido, tipo, visible_tutor, callback) {
        global.db.query('INSERT INTO observacion (id_alumno, contenido, tipo, visible_tutor, fecha) VALUES (?, ?, ?, ?, NOW())', [alumnoId, contenido, tipo, visible_tutor], (err) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            callback(null, { message: "Añadida" });
        });
    }

    deleteObservacion(observacionId, callback) {
        global.db.query('DELETE FROM observacion WHERE id = ?', [observacionId], (err) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            callback(null, { message: 'Eliminada' });
        });
    }
}

module.exports = new ObservacionService();
