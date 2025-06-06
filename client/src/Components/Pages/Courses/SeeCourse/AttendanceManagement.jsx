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
                await axiosInstance.put(`/api/attendance/${existingRecord.ID}`, {
                    status
                });
            } else {
                await axiosInstance.post(`/api/attendance/courses/${courseId}/register`, {
                    usuario_ID: participantId,
                    estado: status
                });
            }

            await fetchAttendanceRecords();
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

            const attendancePromises = Object.entries(tempAttendance).map(([participantId, status]) =>
                axiosInstance.post(`/api/attendance/courses/${courseId}/register`, {
                    usuario_ID: participantId,
                    estado: status
                })
            );

            await Promise.all(attendancePromises);

            setTempAttendance({});
            setCurrentParticipantIndex(0);
            setSelectedOption(null);
            setShowOptions(true);
            alert('Asistencias registradas exitosamente');
        } catch (error) {
            console.error('Error al guardar asistencias:', error);
            setError('Error al guardar las asistencias');
        } finally {
            setLoading(false);
        }
    };

    if (!open) return null;

    if (showOptions) {
        return (
            <Modal_General className='modal-attendance' closeModal={onClose}>
                <p>Por favor seleccione una de las siguientes opciones</p>

                {/*  <p className="attendance-date">
                    {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: es })}
                </p> */}
                <div className='options1-add'>
                    <p>Agregar asistencia</p>
                    <button
                        className="option-button-add"
                        onClick={() => handleOptionSelect('add')}
                    >
                        <img src="/src/assets/Icons/agregar-archivo.png" alt="Agregar Asistencia"></img>
                    </button>
                </div>
                <div className='options2-update'>
                    <p>Actualizar asistencia</p>
                    <button
                        className="option-button-update"
                        onClick={() => handleOptionSelect('update')}
                    >
                        <img src="/src/assets/Icons/actualizar (1).png" alt="Actualizar Asistencia"></img>
                    </button>
                </div>
                <div className='options3-view'>
                    <p>Consultar asistencias</p>
                    <button
                        className="option-button-view"
                        onClick={() => handleOptionSelect('view')}
                    >
                        <img src="/src/assets/Icons/archivos.png" alt="Consultar Asistencias"></img>
                    </button>
                </div>

            </Modal_General>
        );
    }

    if (selectedOption === 'add') {
        const currentParticipant = participants[currentParticipantIndex];
        const participantStatus = tempAttendance[currentParticipant?.ID] || 'Pendiente';

        return (
            <Modal_General className='modal-attendance-register' closeModal={onClose}>




                <h2>Agregar <span className='complementary'>asistencia</span></h2>
                <p> en este listado puedes agregar las asistencias del dia
                    {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: es })}
                </p>


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
                    <div className="carousel-container-register">
                        <div className="carousel-wrapper-register">
                            <button
                                className="carousel-arrow-register left"
                                onClick={handlePrevParticipant}>
                                <img src="/src/assets/Icons/arrowLeft.png" alt="Flecha izquierda"/>
                            </button>

                            <div className='carousel-track-register'>
                                <div className="carouse-card-register">
                                    <div className="participant-info">
                                        <div className="participant-image">
                                            <img
                                                src={currentParticipant.foto_perfil || "/src/assets/Icons/user-default.png"}
                                                alt={`Foto de ${currentParticipant.nombres}`}
                                            />
                                        </div>
                                        <h3>Participante {currentParticipantIndex + 1} de {participants.length}</h3>
                                        <p className="participant-name">
                                            {currentParticipant.nombres} {currentParticipant.apellidos}
                                        </p>
                                        <p className="participant-document">
                                            Documento: {currentParticipant.documento}
                                        </p>
                                    </div>




                                </div>

                            </div>



                            <button
                                className="carousel-arrow-register right"
                                onClick={handleNextParticipant}
                            >
                                <img src="/src/assets/Icons/arrowRight.png" alt="Flecha derecha" />
                            </button>


                        </div>
                    </div>

                ) : null}

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

                <button
                    className="save-button-register"
                    onClick={handleSaveAttendance}
                >
                    Guardar reporte
                </button>
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