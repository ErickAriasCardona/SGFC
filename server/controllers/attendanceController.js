const jwt = require('jsonwebtoken');
let dbInstance;

// Función para inyectar la instancia de la base de datos
const setDb = (databaseInstance) => {
    dbInstance = databaseInstance;
};

/**
 * Obtiene las sesiones programadas para un instructor
 */
const getScheduledSessions = async (req, res) => {
    try {
        const instructorId = req.user.id; // Obtenido del token JWT

        const sessions = await dbInstance.Sesion.findAll({
            where: {
                instructor_ID: instructorId,
                fecha: new Date(), // Sesiones del día actual
            },
            include: [{
                model: dbInstance.Curso,
                attributes: ['nombre']
            }],
            order: [['hora_inicio', 'ASC']]
        });

        res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error('Error al obtener las sesiones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las sesiones programadas'
        });
    }
};

/**
 * Obtiene la lista de participantes de una sesión específica
 */
const getSessionParticipants = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const instructorId = req.user.id;

        // Verificar que la sesión pertenezca al instructor
        const session = await dbInstance.Sesion.findOne({
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

        // Obtener los participantes del curso asociado a la sesión
        const participants = await dbInstance.Matricula.findAll({
            where: {
                curso_ID: session.curso_ID
            },
            include: [{
                model: dbInstance.Usuario,
                attributes: ['ID', 'nombres', 'apellidos', 'email']
            }]
        });

        res.status(200).json({
            success: true,
            participants
        });
    } catch (error) {
        console.error('Error al obtener los participantes:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los participantes de la sesión'
        });
    }
};

/**
 * Registra la asistencia de los participantes en una sesión
 */
const registerAttendance = async (req, res) => {
    try {
        const sessionId = req.params.sessionId;//parametro de la ruta
        const { attendanceData } = req.body;
        const instructorId = req.user.id;

        // Verificar que la sesión pertenezca al instructor
        const session = await dbInstance.Sesion.findOne({
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

        // Registrar la asistencia para cada participante
        const attendanceRecords = attendanceData.map(record => ({
            sesion_ID: sessionId,
            usuario_ID: record.userId,
            estado: record.status, // 'Presente' o 'Ausente'
            fecha: new Date(),
            registrado_por: instructorId
        }));

        await dbInstance.Asistencia.bulkCreate(attendanceRecords);

        res.status(200).json({
            success: true,
            message: 'Asistencia registrada correctamente'
        });
    } catch (error) {
        console.error('Error al registrar la asistencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al registrar la asistencia'
        });
    }
};

/**
 * Actualiza el registro de asistencia de un participante
 */
const updateAttendance = async (req, res) => {
    try {
        const { attendanceId } = req.params;
        const { status } = req.body;
        const instructorId = req.user.id;

        const attendance = await dbInstance.Asistencia.findOne({
            where: {
                ID: attendanceId
            },
            include: [{
                model: dbInstance.Sesion,
                where: {
                    instructor_ID: instructorId
                }
            }]
        });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Registro de asistencia no encontrado o no autorizado'
            });
        }

        await attendance.update({
            estado: status,
            actualizado_por: instructorId,
            fecha_actualizacion: new Date()
        });

        res.status(200).json({
            success: true,
            message: 'Asistencia actualizada correctamente'
        });
    } catch (error) {
        console.error('Error al actualizar la asistencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la asistencia'
        });
    }
};

/**
 * Obtiene los registros de asistencia con filtros
 * Permite filtrar por usuario, curso, sesión, fecha y estado
 */
const getAttendanceRecords = async (req, res) => {
    try {
        const {
            userId,
            courseId,
            sessionId,
            date,
            startDate,
            endDate,
            status,
            page = 1,
            limit = 10
        } = req.query;

        const user = req.user;
        let whereClause = {};
        let includeClause = [
            {
                model: dbInstance.Usuario,
                as: 'aprendiz',
                attributes: ['ID', 'nombres', 'apellidos', 'email']
            },
            {
                model: dbInstance.Sesion,
                attributes: ['ID', 'fecha', 'hora_inicio', 'hora_fin'],
                include: [{
                    model: dbInstance.Curso,
                    attributes: ['ID', 'nombre_curso', 'ficha']
                }]
            }
        ];

        // Aplicar filtros según el tipo de usuario
        if (user.accountType === 'Empresa') {
            const empresaUser = await dbInstance.Usuario.findByPk(user.id, {
                include: [{ model: dbInstance.Empresa, as: 'Empresa' }]
            });
            
            if (!empresaUser || !empresaUser.empresa_ID) {
                return res.status(404).json({
                    success: false,
                    message: 'Empresa no encontrada'
                });
            }

            // Modificar la consulta para filtrar por empresa
            includeClause[0].where = {
                empresa_ID: empresaUser.empresa_ID
            };
        } else if (user.accountType === 'Instructor') {
            // Modificar la consulta para filtrar por instructor
            includeClause[1].where = {
                instructor_ID: user.id
            };
        }

        // Aplicar filtros adicionales
        if (userId) whereClause.usuario_ID = userId;
        if (sessionId) whereClause.sesion_ID = sessionId;
        if (status) whereClause.estado = status;
        
        // Manejar filtro de curso
        if (courseId) {
            includeClause[1].include[0].where = {
                ID: courseId
            };
        }

        // Manejar filtros de fecha
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            whereClause.fecha = {
                [dbInstance.Sequelize.Op.between]: [startOfDay, endOfDay]
            };
        } else if (startDate || endDate) {
            whereClause.fecha = {};
            if (startDate) {
                const start = new Date(startDate);
                start.setHours(0, 0, 0, 0);
                whereClause.fecha[dbInstance.Sequelize.Op.gte] = start;
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                whereClause.fecha[dbInstance.Sequelize.Op.lte] = end;
            }
        }

        // Validar que la fecha no sea futura
        if (whereClause.fecha) {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            
            if (whereClause.fecha[dbInstance.Sequelize.Op.between]?.[0] > now) {
                return res.status(400).json({
                    success: false,
                    message: 'No se pueden consultar registros de fechas futuras'
                });
            }
        }

        // Calcular offset para paginación
        const offset = (page - 1) * limit;

        try {
            // Obtener registros con paginación
            const { count, rows: records } = await dbInstance.Asistencia.findAndCountAll({
                where: whereClause,
                include: includeClause,
                order: [['fecha', 'DESC'], ['createdAt', 'DESC']],
                limit: parseInt(limit),
                offset: offset,
                distinct: true,
                subQuery: false // Evitar subconsultas innecesarias
            });

            // Calcular total de páginas
            const totalPages = Math.ceil(count / limit);

            res.status(200).json({
                success: true,
                records,
                pagination: {
                    total: count,
                    totalPages,
                    currentPage: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (dbError) {
            console.error('Error en la consulta a la base de datos:', dbError);
            return res.status(500).json({
                success: false,
                message: 'Error al consultar los registros de asistencia',
                error: process.env.NODE_ENV === 'development' ? dbError.message : undefined
            });
        }
    } catch (error) {
        console.error('Error al obtener los registros de asistencia:', error);
        
        if (error.name === 'SequelizeDatabaseError') {
            return res.status(500).json({
                success: false,
                message: 'Error en la base de datos al obtener los registros'
            });
        }
        
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Error de validación en los datos proporcionados'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Error al obtener los registros de asistencia',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    setDb,
    getScheduledSessions,
    getSessionParticipants,
    registerAttendance,
    updateAttendance,
    getAttendanceRecords
}; 