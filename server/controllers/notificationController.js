const { 
    sendNotification, 
    sendAbsenceNotifications,
    sendNewCourseNotifications,
    sendCourseUpdateNotifications,
    sendPasswordChangeNotification,
    sendProfileUpdateNotification,
    sendEnrollmentNotification,
    sendInstructorAssignmentNotification,
    getUserNotifications,
    markNotificationAsRead,
    sendManualAbsenceNotification
} = require('../services/notificationService');

let dbInstance;

// Función para inyectar la instancia de la base de datos
const setDb = (databaseInstance) => {
    dbInstance = databaseInstance;
};

/**
 * Obtiene las notificaciones de un usuario
 */
const getUserNotificationsController = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 10, type } = req.query;
        
        const result = await getUserNotifications(userId, page, limit, type);
        res.status(200).json(result);
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
const markNotificationAsReadController = async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user.id;

        const result = await markNotificationAsRead(notificationId, userId);
        res.status(200).json(result);
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
const sendManualAbsenceNotificationController = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const instructorId = req.user.id;

        const result = await sendManualAbsenceNotification(attendanceId, instructorId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al enviar notificación manualmente:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar la notificación'
        });
    }
};

/**
 * Envía notificación de nuevo curso
 */
const sendNewCourseNotificationController = async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await sendNewCourseNotifications(courseId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al enviar notificación de nuevo curso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar la notificación de nuevo curso'
        });
    }
};

/**
 * Envía notificación de actualización de curso
 */
const sendCourseUpdateNotificationController = async (req, res) => {
    try {
        const { courseId } = req.params;
        const result = await sendCourseUpdateNotifications(courseId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al enviar notificación de actualización de curso:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar la notificación de actualización de curso'
        });
    }
};

/**
 * Envía notificación de cambio de contraseña
 */
const sendPasswordChangeNotificationController = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await sendPasswordChangeNotification(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al enviar notificación de cambio de contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar la notificación de cambio de contraseña'
        });
    }
};

/**
 * Envía notificación de actualización de perfil
 */
const sendProfileUpdateNotificationController = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await sendProfileUpdateNotification(userId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al enviar notificación de actualización de perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar la notificación de actualización de perfil'
        });
    }
};

/**
 * Envía notificación de inscripción a curso
 */
const sendEnrollmentNotificationController = async (req, res) => {
    try {
        const { courseId, apprenticeId } = req.params;
        const gestorId = req.user.id;
        const userType = req.user.accountType;
        const result = await sendEnrollmentNotification(courseId, apprenticeId, gestorId, userType);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al enviar notificación de inscripción:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar la notificación de inscripción'
        });
    }
};

/**
 * Envía notificación de asignación de instructor
 */
const sendInstructorAssignmentNotificationController = async (req, res) => {
    try {
        const { courseId, instructorId } = req.params;
        const gestorId = req.user.id;
        const result = await sendInstructorAssignmentNotification(courseId, instructorId, gestorId);
        res.status(200).json(result);
    } catch (error) {
        console.error('Error al enviar notificación de asignación de instructor:', error);
        res.status(500).json({
            success: false,
            message: 'Error al enviar la notificación de asignación de instructor'
        });
    }
};

module.exports = {
    setDb,
    getUserNotifications: getUserNotificationsController,
    markNotificationAsRead: markNotificationAsReadController,
    sendManualAbsenceNotification: sendManualAbsenceNotificationController,
    sendNewCourseNotification: sendNewCourseNotificationController,
    sendCourseUpdateNotification: sendCourseUpdateNotificationController,
    sendPasswordChangeNotification: sendPasswordChangeNotificationController,
    sendProfileUpdateNotification: sendProfileUpdateNotificationController,
    sendEnrollmentNotification: sendEnrollmentNotificationController,
    sendInstructorAssignmentNotification: sendInstructorAssignmentNotificationController
}; 