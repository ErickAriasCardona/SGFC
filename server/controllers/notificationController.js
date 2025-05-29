const { Notificacion, Usuario, Sesion, Curso } = require('../models');
const { sendNotification, sendAbsenceNotifications } = require('../services/notificationService');

/**
 * Obtiene las notificaciones de un usuario
 */
const getUserNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, type } = req.query;

        const whereClause = { usuario_ID: userId };
        if (type) {
            whereClause.tipo = type;
        }

        const offset = (page - 1) * limit;

        const { count, rows: notifications } = await Notificacion.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: Sesion,
                    attributes: ['ID', 'fecha', 'hora_inicio', 'hora_fin'],
                    include: [{
                        model: Curso,
                        attributes: ['ID', 'nombre_curso', 'ficha']
                    }]
                }
            ],
            order: [['fecha_envio', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        res.status(200).json({
            success: true,
            notifications,
            pagination: {
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las notificaciones'
        });
    }
};

/**
 * Marca una notificación como leída
 */
const markNotificationAsRead = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const notification = await Notificacion.findOne({
            where: {
                ID: notificationId,
                usuario_ID: userId
            }
        });

        if (!notification) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }

        await notification.update({ estado: 'leida' });

        res.status(200).json({
            success: true,
            message: 'Notificación marcada como leída'
        });
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la notificación'
        });
    }
};

/**
 * Envía una notificación de inasistencia manualmente
 */
const sendManualAbsenceNotification = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const instructorId = req.user.id;

        // Verificar que la sesión pertenezca al instructor
        const session = await Sesion.findOne({
            where: {
                ID: sessionId,
                instructor_ID: instructorId
            }
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Sesión no encontrada o no autorizada'
            });
        }

        const result = await sendAbsenceNotifications(sessionId);

        res.status(200).json({
            success: true,
            message: `Notificaciones enviadas a ${result.notificationsSent} usuarios`,
            result
        });
    } catch (error) {
        console.error('Error al enviar notificaciones manualmente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar las notificaciones'
        });
    }
};

module.exports = {
    getUserNotifications,
    markNotificationAsRead,
    sendManualAbsenceNotification
}; 