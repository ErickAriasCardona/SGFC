/**
 * Middleware para verificar roles de usuario
 * @param {Array} allowedRoles - Array de roles permitidos
 * @returns {Function} Middleware function
 */
const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        // Verificar si existe el usuario y su tipo de cuenta
        if (!req.user || !req.user.accountType) {
            return res.status(403).json({
                success: false,
                message: 'No tiene permisos para acceder a este recurso'
            });
        }

        // Verificar si el rol del usuario está en la lista de roles permitidos
        if (!allowedRoles.includes(req.user.accountType)) {
            return res.status(403).json({
                success: false,
                message: 'No tiene los permisos necesarios para realizar esta acción'
            });
        }

        // Si el rol es válido, continuar con la siguiente función
        next();
    };
};

module.exports = roleMiddleware; 