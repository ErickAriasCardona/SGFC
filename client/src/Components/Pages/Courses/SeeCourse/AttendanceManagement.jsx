import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../../config/axiosInstance';
import { format, parseISO, startOfDay, endOfDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { Modal_General } from '../../../UI/Modal_General/Modal_General';
import { useNavigate } from 'react-router-dom';
import './AttendanceManagement.css';

export const AttendanceManagement = ({ open, onClose, courseId, selectedDate }) => {
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showOptions, setShowOptions] = useState(true);
    const [selectedOption, setSelectedOption] = useState(null);
    const [currentParticipantIndex, setCurrentParticipantIndex] = useState(0);
    const [tempAttendance, setTempAttendance] = useState({});

    useEffect(() => {
        if (open) {
            setShowOptions(true);
            setSelectedOption(null);
            fetchParticipants();
        }
    }, [open, courseId]);

    useEffect(() => {
        if (selectedOption === 'view' || selectedOption === 'update') {
            fetchAttendanceRecords();
        }
    }, [selectedOption, selectedDate]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/api/courses/cursos/${courseId}/participants`);
            if (response.data.success) {
                setParticipants(response.data.participants);
            } else {
                setError('Error al cargar los participantes');
            }
        } catch (error) {
            console.error('Error al obtener participantes:', error);
            if (error.response?.status === 401) {
                localStorage.removeItem('userSession');
                sessionStorage.removeItem('userSession');
                navigate('/');
            } else if (error.response?.status === 403) {
                setError('No tienes permisos para acceder a esta función');
            } else {
                setError('Error al cargar los participantes');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchAttendanceRecords = async () => {
        try {
            setLoading(true);
            const selectedDateObj = parseISO(selectedDate);
            const today = startOfDay(new Date());

            if (selectedDateObj > today) {
                setError('No se pueden consultar registros de fechas futuras');
                setLoading(false);
                return;
            }

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
                await axiosInstance.put(`/api/attendance/attendance/${existingRecord.ID}`, {
                    status
                });
            } else {
                const response = await axiosInstance.post(`/api/attendance/courses/${courseId}/register`, {
                    attendanceData: [{
                        userId: participantId,
                        status: status
                    }],
                    selectedDate
                });
                
                if (response.data.success) {
                    fetchAttendanceRecords();
                }
            }
        } catch (error) {
            console.error('Error al actualizar asistencia:', error);
            if (error.response?.status === 404) {
                setError('No hay una sesión programada para esta fecha');
            } else {
                setError('Error al actualizar la asistencia');
            }
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

    const handleOptionSelect = (option) => {
        setSelectedOption(option);
        setShowOptions(false);
        setError(null);
    };

    const handleBack = () => {
        setSelectedOption(null);
        setShowOptions(true);
        setError(null);
    };

    const handleAttendanceStatus = (participantId, status) => {
        setTempAttendance(prev => ({
            ...prev,
            [participantId]: status
        }));
    };

    const handleNextParticipant = () => {
        if (currentParticipantIndex < participants.length - 1) {
            setCurrentParticipantIndex(prev => prev + 1);
        }
    };

    const handlePrevParticipant = () => {
        if (currentParticipantIndex > 0) {
            setCurrentParticipantIndex(prev => prev - 1);
        }
    };

    const handleSaveAttendance = async () => {
        try {
            setLoading(true);
            setError(null);

            const attendanceData = Object.entries(tempAttendance).map(([participantId, status]) => ({
                userId: participantId,
                status: status
            }));

            const response = await axiosInstance.post(`/api/attendance/courses/${courseId}/register`, {
                attendanceData,
                selectedDate
            });

            if (response.data.success) {
                setTempAttendance({});
                setCurrentParticipantIndex(0);
                setSelectedOption(null);
                setShowOptions(true);
                alert('Asistencias registradas exitosamente');
            }
        } catch (error) {
            console.error('Error al guardar las asistencias:', error);
            if (error.response?.status === 404) {
                setError('No hay una sesión programada para esta fecha');
            } else {
                setError('Error al guardar las asistencias');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    if (showOptions) {
        return (
            <Modal_General closeModal={onClose}>
                <div className="attendance-options">
                    <h2>Gestión de Asistencia</h2>
                    <p className="attendance-date">
                        {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: es })}
                    </p>
                    <div className="options-container">
                        <button 
                            className="option-button"
                            onClick={() => handleOptionSelect('add')}
                        >
                            Agregar Asistencia
                        </button>
                        <button 
                            className="option-button"
                            onClick={() => handleOptionSelect('update')}
                        >
                            Actualizar Asistencia
                        </button>
                        <button 
                            className="option-button"
                            onClick={() => handleOptionSelect('view')}
                        >
                            Consultar Asistencias
                        </button>
                    </div>
                </div>
            </Modal_General>
        );
    }

    if (selectedOption === 'add') {
        const currentParticipant = participants[currentParticipantIndex];
        const participantStatus = tempAttendance[currentParticipant?.ID] || 'Pendiente';

        return (
            <Modal_General closeModal={onClose}>
                <div className="attendance-carousel">
                    <div className="carousel-header">
                        <button className="back-button" onClick={handleBack}>
                            ← Volver
                        </button>
                        <h2>Registrar Asistencia</h2>
                        <p className="attendance-date">
                            {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: es })}
                        </p>
                    </div>

                    {error && (
                        <p className="error-message">{error}</p>
                    )}

                    {loading ? (
                        <div className="loading-container">
                            <p>Cargando participantes...</p>
                        </div>
                    ) : participants.length === 0 ? (
                        <div className="no-participants">
                            <p>No hay participantes inscritos en este curso</p>
                        </div>
                    ) : currentParticipant ? (
                        <div className="carousel-content">
                            <div className="participant-info">
                                <h3>Participante {currentParticipantIndex + 1} de {participants.length}</h3>
                                <p className="participant-name">
                                    {currentParticipant.nombres} {currentParticipant.apellidos}
                                </p>
                                <p className="participant-document">
                                    Documento: {currentParticipant.documento}
                                </p>
                            </div>

                            <div className="attendance-buttons">
                                <button
                                    className={`attendance-button ${participantStatus === 'Presente' ? 'active' : ''}`}
                                    onClick={() => handleAttendanceStatus(currentParticipant.ID, 'Presente')}
                                >
                                    Asistencia
                                </button>
                                <button
                                    className={`attendance-button ${participantStatus === 'Ausente' ? 'active' : ''}`}
                                    onClick={() => handleAttendanceStatus(currentParticipant.ID, 'Ausente')}
                                >
                                    Inasistencia
                                </button>
                            </div>

                            <div className="carousel-navigation">
                                <button 
                                    className="nav-button"
                                    onClick={handlePrevParticipant}
                                    disabled={currentParticipantIndex === 0}
                                >
                                    ← Anterior
                                </button>
                                <button 
                                    className="nav-button"
                                    onClick={handleNextParticipant}
                                    disabled={currentParticipantIndex === participants.length - 1}
                                >
                                    Siguiente →
                                </button>
                            </div>

                            <div className="save-section">
                                <button 
                                    className="save-button"
                                    onClick={handleSaveAttendance}
                                    disabled={Object.keys(tempAttendance).length === 0}
                                >
                                    Guardar Reporte
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>
            </Modal_General>
        );
    }

    return (
        <Modal_General closeModal={onClose}>
            <div className="attendance-management">
                <div className="attendance-header">
                    <button className="back-button" onClick={handleBack}>
                        ← Volver
                    </button>
                    <h2>
                        {selectedOption === 'add' && 'Agregar Asistencia'}
                        {selectedOption === 'update' && 'Actualizar Asistencia'}
                        {selectedOption === 'view' && 'Consultar Asistencias'}
                    </h2>
                    <p className="attendance-date">
                        {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: es })}
                    </p>
                </div>

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
                                    const isReadOnly = selectedOption === 'view';
                                    
                                    return (
                                        <tr key={participant.ID}>
                                            <td>
                                                {participant.aprendiz.nombre} {participant.aprendiz.apellido}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${record?.estado?.toLowerCase() || 'pendiente'}`}>
                                                    {record?.estado || 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="action-buttons">
                                                {!isReadOnly && (
                                                    <>
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
                                                    </>
                                                )}
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
                                    <strong>Participante:</strong> {selectedRecord.aprendiz.nombre} {selectedRecord.aprendiz.apellido}
                                </p>
                                <p>
                                    <strong>Curso:</strong> {selectedRecord.Sesion?.Curso?.nombre_curso}
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