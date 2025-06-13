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
            <h2>Sistema</h2>
            <h3>Nuevo Curso Disponible</h3>
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
                    fecha_envio: new Date().toLocaleDateString(),
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

//Envía notificaciones cuando se actualiza un curso

const sendCourseUpdateNotifications = async (courseId) => {
    try {
        // Obtener el curso actualizado
        const course = await dbInstance.Curso.findByPk(courseId);
        if (!course) {
            throw new Error('Curso no encontrado');
        }

        // Obtener los aprendices inscritos y el instructor
        const [inscripciones, asignacionInstructor] = await Promise.all([
            dbInstance.InscripcionCurso.findAll({
                where: { curso_ID: courseId },
                include: [{
                    model: dbInstance.Usuario,
                    as: 'aprendiz',
                    attributes: ['ID', 'email']
                }]
            }),
            dbInstance.AsignacionCursoInstructor.findOne({
                where: { curso_ID: courseId },
                include: [{
                    model: dbInstance.Usuario,
                    as: 'instructor',
                    attributes: ['ID', 'email']
                }]
            })
        ]);

        // Crear lista de usuarios a notificar
        const usersToNotify = [
            ...inscripciones.map(inscripcion => inscripcion.aprendiz),
            asignacionInstructor?.instructor
        ].filter(user => user); // Filtrar usuarios nulos

        const fechaActual = new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const message = `
            <h3>Fecha de notificación: ${fechaActual}</h3>
            <h2>Sistema</h2>
            <h3>Actualización de Curso</h3>
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
                    fecha_envio: new Date().toLocaleDateString(),
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

//Envía una notificación cuando un usuario cambia su contraseña
 
const sendPasswordChangeNotification = async (userId) => {
    try {
        // Obtener el usuario
        const user = await dbInstance.Usuario.findByPk(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const fechaActual = new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const message = `
            <h3>Fecha de notificación: ${fechaActual}</h3>
            <h2>Sistema</h2>
            <h3>Cambio de Contraseña</h3>
            <p>Estimado(a) ${user.nombres} ${user.apellidos},</p>
            <p>Le informamos que su contraseña ha sido actualizada exitosamente.</p>
            <p>Si usted no realizó este cambio, por favor contacte inmediatamente al administrador del sistema.</p>
            <p>Saludos cordiales,<br>SGFC</p>
        `;

        // Crear la notificación en la base de datos
        const notification = await dbInstance.Notificacion.create({
            usuario_ID: userId,
            tipo: 'actualizacion_contrasena',
            remitente: 'Sistema',
            asunto: 'Cambio de Contraseña',
            mensaje: message,
            fecha_envio: new Date().toLocaleDateString(),
            estado: 'enviada'
        });

        return {
            success: true,
            notification
        };
    } catch (error) {
        console.error('Error al enviar notificación de cambio de contraseña:', error);
        throw error;
    }
};

const sendProfileUpdateNotification = async (userId) => {
    try {
        // Obtener el usuario
        const user = await dbInstance.Usuario.findByPk(userId);
        if (!user) {
            throw new Error('Usuario no encontrado');
        }

        const fechaActual = new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const message = `
            <h3>Fecha de notificación: ${fechaActual}</h3>
            <h2>Sistema</h2>
            <h3>Actualización de Perfil</h3>
            <p>Estimado(a) ${user.nombres} ${user.apellidos},</p>
            <p>Le informamos que su perfil ha sido actualizado exitosamente.</p>
            <p>Si usted no realizó estos cambios, por favor contacte inmediatamente al administrador del sistema.</p>
            <p>Saludos cordiales,<br>SGFC</p>
        `;

        // Crear la notificación en la base de datos
        const notification = await dbInstance.Notificacion.create({
            usuario_ID: userId,
            tipo: 'actualizacion_perfil',
            remitente: 'Sistema',
            asunto: 'Actualización de Perfil',
            mensaje: message,
            fecha_envio: new Date().toLocaleDateString(),
            estado: 'enviada'
        });

        return {
            success: true,
            notification
        };
    } catch (error) {
        console.error('Error al enviar notificación de actualización de perfil:', error);
        throw error;
    }
};

const sendEnrollmentNotification = async (courseId, apprenticeId, gestorId, userType) => {
    try {
        console.log('Datos recibidos:', { courseId, apprenticeId, gestorId, userType });

        // Obtener el curso y el remitente (que puede ser administrador, empresa o gestor)
        const [course, remitente] = await Promise.all([
            dbInstance.Curso.findByPk(courseId),
            dbInstance.Usuario.findByPk(gestorId)
        ]);

        console.log('Resultados de búsqueda:', {
            course: course ? 'Encontrado' : 'No encontrado',
            remitente: remitente ? 'Encontrado' : 'No encontrado',
            remitenteId: gestorId,
            userType
        });

        if (!course) {
            throw new Error(`Curso no encontrado con ID: ${courseId}`);
        }
        if (!remitente) {
            throw new Error(`Remitente no encontrado con ID: ${gestorId}`);
        }

        // Obtener los aprendices inscritos
        const inscripciones = await dbInstance.InscripcionCurso.findAll({
            where: { 
                curso_ID: courseId,
                aprendiz_ID: apprenticeId
            },
            include: [{
                model: dbInstance.Usuario,
                as: 'aprendiz',
                attributes: ['ID', 'email', 'nombres', 'apellidos']
            }]
        });

        console.log('Inscripciones encontradas:', inscripciones.length);

        // Crear lista de usuarios a notificar (solo aprendices)
        const usersToNotify = inscripciones
            .map(inscripcion => inscripcion.aprendiz)
            .filter(user => user); // Filtrar usuarios nulos

        console.log('Usuarios a notificar:', usersToNotify.length);

        if (usersToNotify.length === 0) {
            throw new Error('No se encontraron aprendices para notificar');
        }

        const fechaActual = new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        // Usar el tipo de usuario logueado como remitente
        const tipoRemitente = userType;

        const message = `
            <h3>Fecha de notificación: ${fechaActual}</h3>
            <h2>${userType}</h2>
            <h3>Inscripción a Curso</h3>
            <p>Estimado(a) aprendiz,</p>
            <p>Le informamos que ha sido inscrito en el siguiente curso:</p>
            <ul>
                <li><strong>Nombre del Curso:</strong> ${course.nombre_curso}</li>
                <li><strong>Ficha:</strong> ${course.ficha}</li>
                <li><strong>Fecha de Inicio:</strong> ${new Date(course.fecha_inicio).toLocaleDateString()}</li>
                <li><strong>Fecha de Fin:</strong> ${new Date(course.fecha_fin).toLocaleDateString()}</li>
                <li><strong>Lugar:</strong> ${course.lugar_formacion}</li>
            </ul>
            <p>Puede acceder al curso haciendo clic en el siguiente enlace: <a href="http://localhost:5173/cursos/${course.ID}">Ver detalles del curso</a></p>
            
            <p>Saludos cordiales,<br>${remitente.nombres} ${remitente.apellidos}<br>${tipoRemitente} SGFC</p>
        `;

        // Crear notificaciones en la base de datos para todos los aprendices
        const notifications = await Promise.all(
            usersToNotify.map(async user => {
                try {
                    const notification = await dbInstance.Notificacion.create({
                        usuario_ID: user.ID,
                        tipo: 'inscripcion',
                        remitente: tipoRemitente,
                        asunto: 'Inscripción a Curso',
                        mensaje: message,
                        curso_ID: courseId,
                        fecha_envio: new Date().toLocaleDateString(),
                        estado: 'enviada'
                    });
                    console.log('Notificación creada:', notification.ID);
                    return notification;
                } catch (error) {
                    console.error('Error al crear notificación individual:', error);
                    throw error;
                }
            })
        );

        return {
            success: true,
            notificationsSent: notifications.length,
            notifications
        };
    } catch (error) {
        console.error('Error detallado al enviar notificación de inscripción:', error);
        throw error;
    }
};

const sendInstructorAssignmentNotification = async (courseId, instructorId, gestorId) => {
    try {
        // Obtener el curso, instructor y gestor
        const [course, instructor, gestor] = await Promise.all([
            dbInstance.Curso.findByPk(courseId),
            dbInstance.Usuario.findByPk(instructorId),
            dbInstance.Usuario.findByPk(gestorId)
        ]);

        if (!course) {
            throw new Error(`Curso no encontrado con ID: ${courseId}`);
        }
        if (!instructor) {
            throw new Error(`Instructor no encontrado con ID: ${instructorId}`);
        }
        if (!gestor) {
            throw new Error(`Gestor no encontrado con ID: ${gestorId}`);
        }

        const fechaActual = new Date().toLocaleString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const message = `
            <h3>Fecha de notificación: ${fechaActual}</h3>
            <h2>Gestor</h2>
            <h3>Asignación de Curso</h3>
            <p>Estimado(a) ${instructor.nombres} ${instructor.apellidos},</p>
            <p>Le informamos que ha sido asignado como instructor al siguiente curso:</p>
            <ul>
                <li><strong>Nombre del Curso:</strong> ${course.nombre_curso}</li>
                <li><strong>Ficha:</strong> ${course.ficha}</li>
                <li><strong>Fecha de Inicio:</strong> ${new Date(course.fecha_inicio).toLocaleDateString()}</li>
                <li><strong>Fecha de Fin:</strong> ${new Date(course.fecha_fin).toLocaleDateString()}</li>
                <li><strong>Lugar:</strong> ${course.lugar_formacion}</li>
            </ul>
            <p>Puede acceder al curso haciendo clic en el siguiente enlace: <a href="http://localhost:5173/cursos/${course.ID}">Ver detalles del curso</a></p>
            
            <p>Saludos cordiales,<br>${gestor.nombres} ${gestor.apellidos}<br>Gestor SGFC</p>
        `;

        // Crear la notificación en la base de datos
        const notification = await dbInstance.Notificacion.create({
            usuario_ID: instructorId,
            tipo: 'asignacion',
            remitente: 'Gestor',
            asunto: 'Asignación de Curso como Instructor',
            mensaje: message,
            curso_ID: courseId,
            fecha_envio: new Date().toLocaleDateString(),
            estado: 'enviada'
        });

        return {
            success: true,
            notification
        };
    } catch (error) {
        console.error('Error al enviar notificación de asignación de instructor:', error);
        throw error;
    }
};

/**
 * Obtiene las notificaciones de un usuario
 */
const getUserNotifications = async (userId, page = 1, limit = 10, type = null) => {
    try {
        const whereClause = { usuario_ID: userId };
        if (type) {
            whereClause.tipo = type;
        }

        const offset = (page - 1) * limit;

        const { count, rows: notifications } = await dbInstance.Notificacion.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: dbInstance.Usuario,
                    as: 'usuario',
                    attributes: ['ID', 'nombres', 'apellidos', 'email']
                }
            ],
            order: [['fecha_envio', 'DESC']],
            limit: parseInt(limit),
            offset: offset
        });

        return {
            success: true,
            notifications,
            pagination: {
                total: count,
                totalPages: Math.ceil(count / limit),
                currentPage: parseInt(page),
                limit: parseInt(limit)
            }
        };
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        throw error;
    }
};

/**
 * Marca una notificación como leída
 */
const markNotificationAsRead = async (notificationId, userId) => {
    try {
        const notification = await dbInstance.Notificacion.findOne({
            where: {
                ID: notificationId,
                usuario_ID: userId
            }
        });

        if (!notification) {
            throw new Error('Notificación no encontrada');
        }

        await notification.update({ estado: 'leida' });

        return {
            success: true,
            message: 'Notificación marcada como leída'
        };
    } catch (error) {
        console.error('Error al marcar notificación como leída:', error);
        throw error;
    }
};

/**
 * Envía una notificación de inasistencia manualmente
 */
const sendManualAbsenceNotification = async (attendanceId, instructorId) => {
    try {
        // Obtener el registro de asistencia
        const attendance = await dbInstance.Asistencia.findOne({
            where: {
                ID: attendanceId,
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

        if (!attendance) {
            throw new Error('Registro de asistencia no encontrado o no es una ausencia');
        }

        const title = `Notificación de Inasistencia`;
        const message = `
            <h2>Notificación de Inasistencia</h2>
            <p>Estimado(a) ${attendance.aprendiz.nombres} ${attendance.aprendiz.apellidos},</p>
            <p>Le informamos que se ha registrado una inasistencia en la fecha ${new Date(attendance.fecha).toLocaleDateString()}.</p>
            <p>Por favor, asegúrese de asistir a las próximas sesiones programadas.</p>
            <p>Saludos cordiales,<br>SGFC</p>
        `;

        const result = await sendNotification(
            attendance.aprendiz.ID,
            'inasistencia',
            title,
            message
        );

        return {
            success: true,
            message: 'Notificación de inasistencia enviada correctamente',
            notification: result
        };
    } catch (error) {
        console.error('Error al enviar notificación manualmente:', error);
        throw error;
    }
};

module.exports = {
    setDb,
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
}; 