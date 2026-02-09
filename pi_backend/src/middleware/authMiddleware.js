const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: "No se proporcionó un token." });
    }

    jwt.verify(token, global.SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido o expirado." });
        }
        req.profesorId = decoded.id;
        req.profesorRol = decoded.rol;
        next();
    });
};

module.exports = verificarToken;
