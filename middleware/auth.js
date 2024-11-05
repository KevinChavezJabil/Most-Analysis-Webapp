const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/'); // Redirige al login si no está autenticado
    }

    // Aquí podrías agregar lógica para validar el token si estás usando JWT u otro método
    next();
};

module.exports = authMiddleware;
