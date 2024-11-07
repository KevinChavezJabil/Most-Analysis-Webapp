const jwt = require('jsonwebtoken');
const User = require('../database/schema/Schema'); // Asegúrate de que la ruta sea correcta

const authMiddleware = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/');
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY); // Usar TOKEN_KEY desde .env
        const user = await User.findById(decoded.id); // Busca el usuario en la base de datos
        if (!user) {
            return res.status(404).send('User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth Middleware Error:', error);
        res.status(400).send('Invalid Token');
    }
};

module.exports = authMiddleware;
