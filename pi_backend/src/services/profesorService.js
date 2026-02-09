const bcrypt = require('bcrypt');

class ProfesorService {
    getProfesores(callback) {
        const query = `
            SELECT id, nombre, email, rol, activo, fecha_alta,
            (SELECT COUNT(*) FROM alumno WHERE id_profesor = profesor.id) AS total_alumnos
            FROM profesor`;
        
        global.db.query(query, (err, results) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            callback(null, results);
        });
    }

    createProfesor(nombre, email, contrasenia, rol, callback) {
        const hash = bcrypt.hashSync(contrasenia, 10);
        const query = 'INSERT INTO profesor (nombre, email, password_hash, rol, activo, fecha_alta) VALUES (?, ?, ?, ?, 1, NOW())';
        
        global.db.query(query, [nombre, email, hash, rol || 'profesor'], (err) => {
            if (err) {
                return callback({ status: 500, error: "El correo ya existe o hay un error" });
            }
            callback(null, { message: "Profesor creado" });
        });
    }

    deleteProfesor(profesorIdToDelete, profesorIdLoggedIn, callback) {
        if (profesorIdToDelete == profesorIdLoggedIn) {
            return callback({ status: 400, message: "No puedes borrarte a ti mismo" });
        }

        global.db.query('DELETE FROM profesor WHERE id = ?', [profesorIdToDelete], (err) => {
            if (err) {
                return callback({ status: 500, error: err.message });
            }
            callback(null, { message: "Eliminado correctamente" });
        });
    }
}

module.exports = new ProfesorService();
