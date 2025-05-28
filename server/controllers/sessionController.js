const jwt = require('jsonwebtoken');
let dbInstance;

// Función para inyectar la instancia de la base de datos
const setDb = (databaseInstance) => {
    dbInstance = databaseInstance;
};

/**
 * Crear una nueva sesión
 */
const createSession = async (req, res) => {
    try {
        const { curso_ID, fecha, hora_inicio, hora_fin } = req.body;
        const instructor_ID = req.user.ID;

        // Validar que el instructor esté asignado al curso
        const asignacion = await dbInstance.AsignacionCursoInstructor.findOne({
            where: {
                curso_ID: curso_ID,
                instructor_ID: instructor_ID,
                estado: 'aceptada'
            }
        });

        if (!asignacion) {
            return res.status(403).json({
                success: false,
                message: 'No está autorizado para crear sesiones en este curso'
            });
        }

        // Crear la sesión
        const session = await dbInstance.Sesion.create({
            curso_ID,
            instructor_ID,
            fecha,
            hora_inicio,
            hora_fin,
            estado: 'programada'
        });

        res.status(201).json({
            success: true,
            message: 'Sesión creada correctamente',
            session
        });
    } catch (error) {
        console.error('Error al crear la sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear la sesión'
        });
    }
};

/**
 * Obtener todas las sesiones de un instructor
 */
const getInstructorSessions = async (req, res) => {
    try {
        const instructor_ID = req.user.ID;
        
        const sessions = await dbInstance.Sesion.findAll({
            where: {
                instructor_ID
            },
            include: [{
                model: dbInstance.Curso,
                attributes: ['nombre', 'descripcion']
            }],
            order: [
                ['fecha', 'DESC'],
                ['hora_inicio', 'ASC']
            ]
        });

        res.status(200).json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error('Error al obtener las sesiones:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener las sesiones'
        });
    }
};

/**
 * Obtener una sesión específica
 */
const getSessionById = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const instructor_ID = req.user.ID;

        const session = await dbInstance.Sesion.findOne({
            where: {
                ID: sessionId,
                instructor_ID
            },
            include: [
                {
                    model: dbInstance.Curso,
                    attributes: ['nombre', 'descripcion']
                },
                {
                    model: dbInstance.Asistencia,
                    as: 'asistencias',
                    include: [{
                        model: dbInstance.Usuario,
                        as: 'aprendiz',
                        attributes: ['ID', 'nombres', 'apellidos', 'email']
                    }]
                }
            ]
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Sesión no encontrada'
            });
        }

        res.status(200).json({
            success: true,
            session
        });
    } catch (error) {
        console.error('Error al obtener la sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener la sesión'
        });
    }
};

/**
 * Actualizar una sesión
 */
const updateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { fecha, hora_inicio, hora_fin, estado } = req.body;
        const instructor_ID = req.user.ID;

        const session = await dbInstance.Sesion.findOne({
            where: {
                ID: sessionId,
                instructor_ID
            }
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Sesión no encontrada'
            });
        }

        // Validar el estado
        const estadosValidos = ['programada', 'en_curso', 'finalizada', 'cancelada'];
        if (estado && !estadosValidos.includes(estado)) {
            return res.status(400).json({
                success: false,
                message: 'Estado no válido'
            });
        }

        await session.update({
            fecha: fecha || session.fecha,
            hora_inicio: hora_inicio || session.hora_inicio,
            hora_fin: hora_fin || session.hora_fin,
            estado: estado || session.estado
        });

        res.status(200).json({
            success: true,
            message: 'Sesión actualizada correctamente',
            session
        });
    } catch (error) {
        console.error('Error al actualizar la sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar la sesión'
        });
    }
};

/**
 * Eliminar una sesión
 */
const deleteSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const instructor_ID = req.user.ID;

        const session = await dbInstance.Sesion.findOne({
            where: {
                ID: sessionId,
                instructor_ID
            }
        });

        if (!session) {
            return res.status(404).json({
                success: false,
                message: 'Sesión no encontrada'
            });
        }

        // Verificar si hay asistencias registradas
        const asistencias = await dbInstance.Asistencia.count({
            where: {
                sesion_ID: sessionId
            }
        });

        if (asistencias > 0) {
            return res.status(400).json({
                success: false,
                message: 'No se puede eliminar la sesión porque ya tiene asistencias registradas'
            });
        }

        await session.destroy();

        res.status(200).json({
            success: true,
            message: 'Sesión eliminada correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar la sesión:', error);
        res.status(500).json({
            success: false,
            message: 'Error al eliminar la sesión'
        });
    }
};

module.exports = {
    setDb,
    createSession,
    getInstructorSessions,
    getSessionById,
    updateSession,
    deleteSession
}; 