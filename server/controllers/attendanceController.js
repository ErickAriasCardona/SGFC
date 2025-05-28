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

module.exports = {
    setDb,
    getScheduledSessions,
    getSessionParticipants,
    registerAttendance,
    updateAttendance
}; 