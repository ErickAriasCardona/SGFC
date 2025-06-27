// Middleware para autorizar por roles
function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !user.accountType) {
      return res.status(403).json({ message: 'No autenticado o sin rol' });
    }
    if (!allowedRoles.includes(user.accountType)) {
      return res.status(403).json({ message: 'No tienes permisos para realizar esta acción' });
    }
    next();
  };
}

module.exports = { authorizeRoles };
