const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sendNotification } = require('../services/notificationService');
let dbInstance;

// Función para inyectar la instancia de la base de datos
const setDb = (databaseInstance) => {
    dbInstance = databaseInstance;
};

/**
 * Registrar asistencia para un curso
 */
const registerAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { usuario_ID, estado, fecha } = req.body;
        const registrador_ID = req.user.id;

        // Obtener información del curso
        const curso = await dbInstance.Curso.findByPk(courseId);
        if (!curso) {
            return res.status(404).json({
                success: false,
                message: 'Curso no encontrado'
            });
        }

        // Obtener información del aprendiz
        const aprendiz = await dbInstance.Usuario.findByPk(usuario_ID);
        if (!aprendiz) {
            return res.status(404).json({
                success: false,
                message: 'Aprendiz no encontrado'
            });
        }

        // Crear la asistencia con la fecha proporcionada
        const asistencia = await dbInstance.Asistencia.create({
            usuario_ID,
            estado,
            registrado_por: registrador_ID,
            fecha: fecha ? new Date(fecha) : new Date(),
            curso_ID: courseId
        });

        // Si el estado es 'Ausente', enviar notificación
        if (estado === 'Ausente') {
            const title = `Inasistencia registrada - ${curso.nombre_curso}`;
            const message = `
                <h2>Notificación de Inasistencia</h2>
                <p>Estimado(a) ${aprendiz.nombres} ${aprendiz.apellidos},</p>
                <p>Le informamos que se ha registrado una inasistencia en el curso:</p>
                <ul>
                    <li><strong>Curso:</strong> ${curso.nombre_curso}</li>
                    <li><strong>Ficha:</strong> ${curso.ficha}</li>
                    <li><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</li>
                </ul>
                <p>Por favor, asegúrese de asistir a las próximas sesiones programadas.</p>
                <p>Saludos cordiales,<br>SGFC</p>
            `;

            await sendNotification(
                aprendiz.ID,
                'inasistencia',
                title,
                message,
                null,
                curso.ID
            );
        }

        res.status(201).json({
            success: true,
            message: 'Asistencia registrada correctamente',
            asistencia
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
            }
        });

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: 'Registro de asistencia no encontrado'
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
 * Permite filtrar por usuario, fecha y estado
 */
const getAttendanceRecords = async (req, res) => {
    try {
        const {
            userId,
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
        }

        // Aplicar filtros adicionales
        if (userId) whereClause.usuario_ID = userId;
        if (status) whereClause.estado = status;

        // Filtrar por rango de fechas
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            whereClause.fecha = {
                [Op.between]: [start, end]
            };
        }

        // Calcular el offset para la paginación
        const offset = (page - 1) * limit;

        // Realizar la consulta con paginación
        const { count, rows: records } = await dbInstance.Asistencia.findAndCountAll({
            where: whereClause,
            include: includeClause,
            order: [
                ['fecha', 'DESC'],
                ['ID', 'DESC']
            ],
            limit: parseInt(limit),
            offset: offset
        });

        res.status(200).json({
            success: true,
            records,
            total: count,
            totalPages: Math.ceil(count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error('Error al obtener los registros de asistencia:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los registros de asistencia'
        });
    }
};

module.exports = {
    setDb,
    registerAttendance,
    updateAttendance,
    getAttendanceRecords
}; 