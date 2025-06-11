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
 * Envía notificaciones a los usuarios cuando se crea un nuevo curso
 */
const sendNewCourseNotifications = async (courseId) => {
    try {
        // Obtener el curso
        const course = await dbInstance.Curso.findByPk(courseId);
        if (!course) {
            throw new Error('Curso no encontrado');
        }

        // Obtener todas las empresas y aprendices
        const users = await dbInstance.Usuario.findAll({
            where: {
                accountType: {
                    [Op.in]: ['Empresa', 'Aprendiz']
                }
            }
        });

        const fechaActual = new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const message = `
            <h3>Fecha de notificación: ${fechaActual}</h3>
            <h2>Nuevo Curso Disponible</h2>
            <p>Se ha publicado un nuevo curso en el sistema:</p>
            <ul>
                <li><strong>Nombre del Curso:</strong> ${course.nombre_curso}</li>
                <li><strong>Ficha:</strong> ${course.ficha}</li>
                <li><strong>Fecha de Inicio:</strong> ${new Date(course.fecha_inicio).toLocaleDateString()}</li>
                <li><strong>Fecha de Fin:</strong> ${new Date(course.fecha_fin).toLocaleDateString()}</li>
                <li><strong>Lugar:</strong> ${course.lugar_formacion}</li>
            </ul>
            <p>Puede acceder al curso haciendo clic en el siguiente enlace: <a href="http://localhost:5173/cursos/${course.ID}">Ver detalles del curso</a></p>
            
            <p>Saludos cordiales,<br>SGFC</p>
        `;

        // Crear notificaciones en la base de datos para todos los usuarios
        const notifications = await Promise.all(
            users.map(async user => {
                const notification = await dbInstance.Notificacion.create({
                    usuario_ID: user.ID,
                    tipo: 'nuevo_curso',
                    remitente: 'Sistema',
                    asunto: 'Nuevo Curso Disponible',
                    mensaje: message,
                    curso_ID: courseId,
                    fecha_envio: new Date(),
                    estado: 'enviada'
                });
                return notification;
            })
        );

        return {
            success: true,
            notificationsSent: notifications.length,
            notifications
        };
    } catch (error) {
        console.error('Error al enviar notificaciones de nuevo curso:', error);
        throw error;
    }
};

/**
 * Envía notificaciones cuando se actualiza un curso
 * @param {number} courseId - ID del curso actualizado
 */
const sendCourseUpdateNotifications = async (courseId) => {
    try {
        // Obtener el curso actualizado
        const course = await dbInstance.Curso.findByPk(courseId);
        if (!course) {
            throw new Error('Curso no encontrado');
        }

        // Obtener los aprendices inscritos y el instructor
        const [inscripciones, instructor] = await Promise.all([
            dbInstance.Inscripcion.findAll({
                where: { curso_ID: courseId },
                include: [{
                    model: dbInstance.Usuario,
                    as: 'aprendiz',
                    attributes: ['ID', 'email']
                }]
            }),
            dbInstance.Usuario.findByPk(course.instructor_ID, {
                attributes: ['ID', 'email']
            })
        ]);

        // Crear lista de usuarios a notificar
        const usersToNotify = [
            ...inscripciones.map(inscripcion => inscripcion.aprendiz),
            instructor
        ].filter(user => user); // Filtrar usuarios nulos

        const message = `
            <h2>Actualización de Curso</h2>
            <p>Se ha actualizado la información del curso en el que está inscrito:</p>
            <ul>
                <li><strong>Nombre del Curso:</strong> ${course.nombre_curso}</li>
                <li><strong>Ficha:</strong> ${course.ficha}</li>
                <li><strong>Fecha de Inicio:</strong> ${new Date(course.fecha_inicio).toLocaleDateString()}</li>
                <li><strong>Fecha de Fin:</strong> ${new Date(course.fecha_fin).toLocaleDateString()}</li>
                <li><strong>Lugar:</strong> ${course.lugar_formacion}</li>
            </ul>
            <p>Puede acceder al curso haciendo clic en el siguiente enlace: <a href="http://localhost:5173/cursos/${course.ID}">Ver detalles del curso</a></p>
            
            <p>Saludos cordiales,<br>SGFC</p>
        `;

        // Crear notificaciones en la base de datos para todos los usuarios
        const notifications = await Promise.all(
            usersToNotify.map(async user => {
                const notification = await dbInstance.Notificacion.create({
                    usuario_ID: user.ID,
                    tipo: 'actualizacion_curso',
                    remitente: 'Sistema',
                    asunto: 'Actualización de Curso',
                    mensaje: message,
                    curso_ID: courseId,
                    fecha_envio: new Date(),
                    estado: 'enviada'
                });
                return notification;
            })
        );

        return {
            success: true,
            notificationsSent: notifications.length,
            notifications
        };
    } catch (error) {
        console.error('Error al enviar notificaciones de actualización:', error);
        throw error;
    }
};

module.exports = {
    setDb,
    sendNotification,
    sendAbsenceNotifications,
    sendNewCourseNotifications,
    sendCourseUpdateNotifications
}; 