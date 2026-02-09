const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {
    login(correo, contrasenia, callback) {
        global.db.query('SELECT * FROM profesor WHERE email = ? AND activo = 1', [correo], (err, results) => {
            if (err || results.length === 0) {
                return callback({ status: 401, message: 'Error de acceso.' });
            }
            
            const prof = results[0];
            bcrypt.compare(contrasenia, prof.password_hash, (err, matches) => {
                if (matches) {
                    const token = jwt.sign(
                        { id: prof.id, nombre: prof.nombre, rol: prof.rol }, 
                        global.SECRET_KEY, 
                        { expiresIn: '4h' }
                    );
                    
                    callback(null, {
                        message: 'OK',
                        token: token,
                        profesor: { id: prof.id, nombre: prof.nombre, rol: prof.rol }
                    });
                } else {
                    callback({ status: 401, message: 'Contraseña incorrecta.' });
                }
            });
        });
    }
}

module.exports = new AuthService();
