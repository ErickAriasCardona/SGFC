const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {
    try {
        const token = req.cookies.token; // Obtener el token desde las cookies

        if (!token) {
            return res.status(401).json({ message: "No se proporcionó un token de autenticación" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret"); // Verificar el token
        req.user = decoded; // Agregar la información del usuario al objeto req
        next();
    } catch (error) {
        console.error("Error al autenticar el usuario:", error);
        res.status(401).json({ message: "Token inválido o expirado" });
    }
};

module.exports = { authenticateUser };