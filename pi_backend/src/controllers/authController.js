const authService = require('../services/authService');

class AuthController {
    login(req, res) {
        const { correo, contrasenia } = req.body;
        
        authService.login(correo, contrasenia, (err, result) => {
            if (err) {
                return res.status(err.status).json({ message: err.message });
            }
            res.status(200).json(result);
        });
    }
}

module.exports = new AuthController();
