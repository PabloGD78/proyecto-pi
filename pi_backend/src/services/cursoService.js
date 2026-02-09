class CursoService {
    getCursos(callback) {
        global.db.query('SELECT id, nombre, anio FROM curso ORDER BY anio, nombre', (err, results) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            callback(null, results);
        });
    }

    getModulosByCurso(cursoId, callback) {
        global.db.query('SELECT * FROM modulo WHERE id_curso = ?', [cursoId], (err, results) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            callback(null, results);
        });
    }
}

module.exports = new CursoService();
