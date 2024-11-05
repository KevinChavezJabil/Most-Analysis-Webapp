const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
        return res.redirect('/'); 
    }
    next();
};

module.exports = authMiddleware;
