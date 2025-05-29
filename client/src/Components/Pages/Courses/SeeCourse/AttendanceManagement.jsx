import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../config/axiosInstance';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal_General } from '../../../UI/Modal_General/Modal_General';
import './AttendanceManagement.css';

export const AttendanceManagement = ({ open, onClose, courseId, selectedDate }) => {
    const [participants, setParticipants] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        if (open) {
            fetchParticipants();
            fetchAttendanceRecords();
        }
    }, [open, courseId, selectedDate]);

    const fetchParticipants = async () => {
        try {
            const response = await axiosInstance.get(`/api/cursos/${courseId}/participants`);
            setParticipants(response.data);
        } catch (error) {
            console.error('Error al obtener participantes:', error);
            setError('Error al cargar los participantes');
        }
    };

    const fetchAttendanceRecords = async () => {
        try {
            // Convertir la fecha seleccionada a objeto Date y ajustar a la zona horaria local
            const selectedDateObj = parseISO(selectedDate);
            const today = startOfDay(new Date());

            // Comparar solo las fechas (sin horas)
            if (selectedDateObj > today) {
                setError('No se pueden consultar registros de fechas futuras');
                setLoading(false);
                return;
            }

            // Formatear la fecha para la API asegurando que sea en la zona horaria local
            const formattedDate = format(selectedDateObj, 'yyyy-MM-dd');

            const response = await axiosInstance.get(`/api/attendance/records`, {
                params: {
                    courseId,
                    date: formattedDate
                }
            });

            if (response.data.success) {
                setAttendanceRecords(response.data.records);
                setError(null);
            } else {
                setError(response.data.message || 'Error al cargar los registros de asistencia');
            }
            setLoading(false);
        } catch (error) {
            console.error('Error al obtener registros de asistencia:', error);
            setError(error.response?.data?.message || 'Error al cargar los registros de asistencia');
            setLoading(false);
        }
    };

    const handleAttendanceChange = async (participantId, status) => {
        try {
            const existingRecord = attendanceRecords.find(
                record => record.aprendiz.ID === participantId
            );

            if (existingRecord) {
                await axiosInstance.put(`/api/attendance/${existingRecord.ID}`, {
                    estado: status
                });
            } else {
                await axiosInstance.post(`/api/attendance/register`, {
                    sesionId: courseId,
                    aprendizId: participantId,
                    estado: status,
                    fecha: selectedDate
                });
            }

            fetchAttendanceRecords();
        } catch (error) {
            console.error('Error al actualizar asistencia:', error);
            setError('Error al actualizar la asistencia');
        }
    };

    const handleViewDetails = (record) => {
        setSelectedRecord(record);
        setShowDetails(true);
    };

    const handleCloseDetails = () => {
        setShowDetails(false);
        setSelectedRecord(null);
    };

    if (!open) return null;

    return (
        <Modal_General closeModal={onClose}>
            <div className="attendance-management">
                <h2>Gestión de Asistencia</h2>
                <p className="attendance-date">
                    {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: es })}
                </p>

                {error && (
                    <p className="error-message">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p>Cargando...</p>
                ) : !error ? (
                    <div className="attendance-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Participante</th>
                                    <th>Estado</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {participants.map(participant => {
                                    const record = attendanceRecords.find(
                                        r => r.aprendiz.ID === participant.ID
                                    );
                                    return (
                                        <tr key={participant.ID}>
                                            <td>
                                                {participant.nombres} {participant.apellidos}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${record?.estado?.toLowerCase() || 'pendiente'}`}>
                                                    {record?.estado || 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="action-buttons">
                                                <button
                                                    className={`status-button ${record?.estado === 'Presente' ? 'active' : ''}`}
                                                    onClick={() => handleAttendanceChange(participant.ID, 'Presente')}
                                                >
                                                    Presente
                                                </button>
                                                <button
                                                    className={`status-button ${record?.estado === 'Ausente' ? 'active' : ''}`}
                                                    onClick={() => handleAttendanceChange(participant.ID, 'Ausente')}
                                                >
                                                    Ausente
                                                </button>
                                                <button
                                                    className={`status-button ${record?.estado === 'Justificado' ? 'active' : ''}`}
                                                    onClick={() => handleAttendanceChange(participant.ID, 'Justificado')}
                                                >
                                                    Justificado
                                                </button>
                                                {record && (
                                                    <button
                                                        className="details-button"
                                                        onClick={() => handleViewDetails(record)}
                                                    >
                                                        Ver Detalles
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : null}

                {showDetails && selectedRecord && (
                    <Modal_General closeModal={handleCloseDetails}>
                        <div className="attendance-details">
                            <h3>Detalles de Asistencia</h3>
                            <div className="details-content">
                                <p>
                                    <strong>Participante:</strong> {selectedRecord.aprendiz.nombres} {selectedRecord.aprendiz.apellidos}
                                </p>
                                <p>
                                    <strong>Curso:</strong> {selectedRecord.Sesion.Curso.nombre_curso}
                                </p>
                                <p>
                                    <strong>Fecha:</strong> {format(new Date(selectedRecord.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </p>
                                <p>
                                    <strong>Estado:</strong> {selectedRecord.estado}
                                </p>
                            </div>
                        </div>
                    </Modal_General>
                )}
            </div>
        </Modal_General>
    );
}; 