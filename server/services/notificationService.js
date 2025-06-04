const { sendEmail } = require('./emailService');
const { Notificacion, Usuario, Sesion, Curso } = require('../models');
const { format } = require('date-fns');
const { Op } = require('sequelize');

let dbInstance;

// Función para inyectar la instancia de la base de datos
const setDb = (databaseInstance) => {
    dbInstance = databaseInstance;
};

/**
 * Envía una notificación por email y la registra en la base de datos
 */
const sendNotification = async (userId, type, title, message, sessionId = null, courseId = null) => {
    try {
        // Obtener el usuario usando dbInstance
        const user = await dbInstance.Usuario.findByPk(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        // Crear el registro de notificación usando dbInstance
        const notification = await dbInstance.Notificacion.create({
            usuario_ID: userId,
            tipo: type,
            titulo: title,
            mensaje: message,
            sesion_ID: sessionId,
            curso_ID: courseId,
            estado: 'pendiente'
        });

        // Enviar el email
        try {
            await sendEmail(user.email, title, message);
            await notification.update({ estado: 'enviada' });
            return { success: true, notification };
        } catch (emailError) {
            await notification.update({ estado: 'fallida' });
            throw emailError;
        }
    } catch (error) {
        console.error('Error al enviar notificación:', error);
        throw error;
    }
};

/**
 * Envía notificaciones de inasistencia a los usuarios que no asistieron a una sesión
 */
const sendAbsenceNotifications = async (sessionId) => {
    try {
        // Obtener la sesión con información del curso
        const session = await Sesion.findByPk(sessionId, {
            include: [{
                model: Curso,
                attributes: ['ID', 'nombre_curso', 'ficha']
            }]
        });

        if (!session) {
            throw new Error('Sesión no encontrada');
        }

        // Obtener las inasistencias de la sesión
        const absences = await Asistencia.findAll({
            where: {
                sesion_ID: sessionId,
                estado: 'Ausente'
            },
            include: [{
                model: Usuario,
                as: 'aprendiz',
                attributes: ['ID', 'email', 'nombres', 'apellidos']
            }]
        });

        // Enviar notificaciones a cada usuario ausente
        const notifications = await Promise.all(
            absences.map(async (absence) => {
                const user = absence.aprendiz;
                const title = `Inasistencia registrada - ${session.Curso.nombre_curso}`;
                const message = `
                    <h2>Notificación de Inasistencia</h2>
                    <p>Estimado(a) ${user.nombres} ${user.apellidos},</p>
                    <p>Le informamos que se ha registrado una inasistencia en la siguiente sesión:</p>
                    <ul>
                        <li><strong>Curso:</strong> ${session.Curso.nombre_curso}</li>
                        <li><strong>Ficha:</strong> ${session.Curso.ficha}</li>
                        <li><strong>Fecha:</strong> ${new Date(session.fecha).toLocaleDateString()}</li>
                        <li><strong>Hora:</strong> ${session.hora_inicio} - ${session.hora_fin}</li>
                    </ul>
                    <p>Por favor, asegúrese de asistir a las próximas sesiones programadas.</p>
                    <p>Saludos cordiales,<br>SGFC</p>
                `;

                return sendNotification(
                    user.ID,
                    'inasistencia',
                    title,
                    message,
                    sessionId,
                    session.curso_ID
                );
            })
        );

        return {
            success: true,
            notificationsSent: notifications.length,
            notifications
        };
    } catch (error) {
        console.error('Error al enviar notificaciones de inasistencia:', error);
        throw error;
    }
};

/**
 * Programa el envío automático de notificaciones de inasistencia
 * Esta función debe ser llamada por un cron job después de cada sesión
 */
const scheduleAbsenceNotifications = async () => {
    try {
        const today = new Date();
        const sessions = await dbInstance.Sesion.findAll({
            where: {
                fecha: {
                    [Op.lte]: today
                },
                estado: 'finalizada'
            },
            include: [
                {
                    model: dbInstance.Curso,
                    as: 'Curso',
                    attributes: ['ID', 'nombre_curso']
                },
                {
                    model: dbInstance.Usuario,
                    as: 'instructor',
                    attributes: ['ID', 'nombres', 'apellidos', 'email']
                }
            ]
        });

        let sessionsProcessed = 0;

        for (const session of sessions) {
            // Verificar si ya se enviaron notificaciones para esta sesión
            const existingNotifications = await dbInstance.Notificacion.findAll({
                where: {
                    sesion_ID: session.ID,
                    tipo: 'inasistencia'
                }
            });

            if (existingNotifications.length > 0) {
                continue; // Saltar esta sesión si ya se enviaron notificaciones
            }

            // Obtener las asistencias de la sesión
            const asistencias = await dbInstance.Asistencia.findAll({
                where: {
                    sesion_ID: session.ID,
                    estado: 'Ausente'
                },
                include: [
                    {
                        model: dbInstance.Usuario,
                        as: 'aprendiz',
                        attributes: ['ID', 'nombres', 'apellidos', 'email']
                    }
                ]
            });

            // Enviar notificaciones a los aprendices ausentes
            for (const asistencia of asistencias) {
                await dbInstance.Notificacion.create({
                    usuario_ID: asistencia.aprendiz.ID,
                    tipo: 'inasistencia',
                    titulo: 'Registro de Inasistencia',
                    mensaje: `Se ha registrado tu inasistencia a la sesión del curso "${session.Curso.nombre_curso}" el día ${format(new Date(session.fecha), 'dd/MM/yyyy')}.`,
                    fecha_envio: new Date(),
                    estado: 'enviada',
                    sesion_ID: session.ID,
                    curso_ID: session.Curso.ID
                });

                // Aquí podrías agregar la lógica para enviar el correo electrónico
                // await sendAbsenceEmail(asistencia.aprendiz.email, session);
            }

            sessionsProcessed++;
        }

        return { success: true, sessionsProcessed };
    } catch (error) {
        console.error('Error al programar notificaciones de inasistencia:', error);
        throw error;
    }
};

module.exports = {
    setDb,
    sendNotification,
    sendAbsenceNotifications,
    scheduleAbsenceNotifications
}; 