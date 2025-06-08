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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('todos');
    const [attendanceFilter, setAttendanceFilter] = useState('todos');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [selectedAttendance, setSelectedAttendance] = useState('');

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
    }, [selectedOption, selectedDate, selectedAttendance]);

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(`/api/courses/cursos/${courseId}/participants`);
            console.log('Respuesta completa de participantes:', response.data);
            if (response.data.success) {
                console.log('Participantes recibidos:', response.data.participants);
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
            console.log('Buscando registros para:', { courseId, date: formattedDate });

            const response = await axiosInstance.get(`/api/attendance/courses/${courseId}/get`, {
                params: {
                    startDate: formattedDate,
                    endDate: formattedDate,
                    limit: 100
                }
            });

            // Log detallado de la respuesta
            console.log('=== RESPUESTA DEL SERVIDOR ===');
            console.log('Status:', response.status);
            console.log('Headers:', response.headers);
            console.log('Data completa:', JSON.stringify(response.data, null, 2));
            console.log('Records recibidos:', response.data.records);
            if (response.data.records && response.data.records.length > 0) {
                console.log('Estructura del primer registro:', JSON.stringify(response.data.records[0], null, 2));
            }
            console.log('===========================');

            if (response.data.success) {
                const records = response.data.records || [];
                console.log('Número de registros recibidos:', records.length);
                console.log('Estructura de los registros:', records);
                
                // Crear un mapa de registros por ID de aprendiz
                const recordsMap = new Map();
                records.forEach(record => {
                    if (record.aprendiz && record.aprendiz.ID) {
                        recordsMap.set(record.aprendiz.ID, {
                            ...record,
                            estado_asistencia: record.estado_asistencia || 'Pendiente'
                        });
                    }
                });

                console.log('Mapa de registros:', Array.from(recordsMap.entries()));

                // Crear registros para todos los participantes
                const allRecords = participants.map(participant => {
                    const existingRecord = recordsMap.get(participant.aprendiz.ID);
                    console.log('Procesando participante:', {
                        id: participant.aprendiz.ID,
                        nombre: participant.aprendiz.nombres,
                        tieneRegistro: !!existingRecord,
                        registro: existingRecord
                    });

                    if (existingRecord) {
                        return existingRecord;
                    }

                    const emptyRecord = {
                        ID: null,
                        aprendiz: {
                            ID: participant.aprendiz.ID,
                            nombres: participant.aprendiz.nombres,
                            apellidos: participant.aprendiz.apellidos
                        },
                        estado_asistencia: 'Pendiente',
                        fecha: formattedDate,
                        curso_ID: courseId
                    };

                    console.log('Creando registro vacío:', emptyRecord);
                    return emptyRecord;
                });

                console.log('Todos los registros (incluyendo vacíos):', allRecords);
                setAttendanceRecords(allRecords);
                setError(null);
            } else {
                console.error('Error en la respuesta:', response.data);
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
                record => record?.aprendiz?.ID === participantId
            );

            if (existingRecord && existingRecord.ID) {
                await axiosInstance.put(`/api/attendance/courses/${courseId}/update`, {
                    attendanceId: existingRecord.ID,
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
        setTimeout(() => {
            setShowOptions(false);
            setError(null);
        }, 300);
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
        if (currentParticipantIndex < filteredParticipants.length - 1) {
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

            const formattedDate = format(parseISO(selectedDate), 'yyyy-MM-dd');

            const attendancePromises = Object.entries(tempAttendance).map(([participantId, status]) =>
                axiosInstance.post(`/api/attendance/courses/${courseId}/register`, {
                    usuario_ID: participantId,
                    estado: status,
                    fecha: formattedDate
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

    const filteredParticipants = participants.filter(participant => {
        // Buscar el registro de asistencia correspondiente
        const record = attendanceRecords.find(r => r?.aprendiz?.ID === participant.aprendiz?.ID);
        
        // Log detallado del participante
        console.log('Analizando participante:', {
            id: participant.aprendiz?.ID,
            nombre: participant.aprendiz?.nombres,
            apellido: participant.aprendiz?.apellidos,
            estadoAprendiz: record?.aprendiz?.estado,
            estructuraCompleta: participant
        });

        // Filtro por búsqueda
        const searchTermLower = searchTerm.toLowerCase();
        const matchesSearch =
            (participant.aprendiz?.nombres && participant.aprendiz.nombres.toLowerCase().includes(searchTermLower)) ||
            (participant.aprendiz?.apellidos && participant.aprendiz.apellidos.toLowerCase().includes(searchTermLower)) ||
            (participant.aprendiz?.documento && participant.aprendiz.documento.toLowerCase().includes(searchTermLower));

        // Filtro por estado del participante
        const matchesStatus = selectedStatus === '' || record?.aprendiz?.estado === selectedStatus;
        console.log('Evaluación de estado:', {
            estadoAprendiz: record?.aprendiz?.estado,
            selectedStatus,
            matchesStatus
        });

        console.log('Registro de asistencia encontrado:', {
            participanteId: participant.aprendiz?.ID,
            registro: record,
            estadoAsistencia: record?.estado_asistencia
        });

        // Si no hay filtro de asistencia seleccionado, solo aplicar búsqueda y estado
        if (selectedAttendance === '') {
            console.log('Resultado filtrado (sin asistencia):', {
                nombre: participant.aprendiz?.nombres,
                estado: record?.aprendiz?.estado,
                matchesSearch,
                matchesStatus,
                resultado: matchesSearch && matchesStatus
            });
            return matchesSearch && matchesStatus;
        }

        // Verificar si el registro de asistencia coincide con el filtro seleccionado
        const matchesAttendance = record?.estado_asistencia === selectedAttendance;
        
        console.log('Resultado filtrado completo:', {
            nombre: participant.aprendiz?.nombres,
            estadoAprendiz: record?.aprendiz?.estado,
            selectedStatus,
            selectedAttendance,
            matchesSearch,
            matchesStatus,
            matchesAttendance,
            resultado: matchesSearch && matchesStatus && matchesAttendance
        });

        // Aplicar todos los filtros
        return matchesSearch && matchesStatus && matchesAttendance;
    });

    // Efecto para monitorear los cambios en los filtros
    useEffect(() => {
        console.log('Estado actual de los filtros:', {
            searchTerm,
            selectedStatus,
            selectedAttendance,
            totalParticipants: participants.length,
            filteredCount: filteredParticipants.length,
            primerParticipante: participants[0] ? {
                id: participants[0].aprendiz?.ID,
                nombre: participants[0].aprendiz?.nombres,
                estado: attendanceRecords.find(r => r?.aprendiz?.ID === participants[0].aprendiz?.ID)?.aprendiz?.estado
            } : null
        });
    }, [searchTerm, selectedStatus, selectedAttendance, participants, filteredParticipants, attendanceRecords]);

    // Efecto para reiniciar el índice del carrusel cuando cambian los filtros
    useEffect(() => {
        setCurrentParticipantIndex(0);
    }, [searchTerm, selectedStatus, selectedAttendance]);

    if (!open) return null;

    if (showOptions) {
        return (
            <Modal_General className='modal-attendance' closeModal={onClose}>
                <p>Por favor seleccione una de las siguientes opciones</p>


                <div className='options1-add'>
                    <p>Agregar asistencia</p>
                    <button
                        className={`option-button-add ${selectedOption === 'add' ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect('add')}
                    >
                        <img src="/src/assets/Icons/agregar-archivo.png" alt="Agregar Asistencia"></img>
                    </button>
                </div>
                <div className='options2-update'>
                    <p>Actualizar asistencia</p>
                    <button
                        className={`option-button-update ${selectedOption === 'update' ? 'selected' : ''}`}
                        onClick={() => handleOptionSelect('update')}
                    >
                        <img src="/src/assets/Icons/actualizar (1).png" alt="Actualizar Asistencia"></img>
                    </button>
                </div>
                <div className='options3-view'>
                    <p>Consultar asistencias</p>
                    <button
                        className={`option-button-view ${selectedOption === 'view' ? 'selected' : ''}`}
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
        const participantStatus = tempAttendance[currentParticipant?.aprendiz?.ID] || 'Pendiente';

        return (
            <Modal_General className='modal-attendance-register' closeModal={onClose}>




                <h2>Agregar <span className='complementary'>asistencia</span></h2>
                <p> en este listado puedes agregar las asistencias del dia  {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: es })}
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
                                <img src="/src/assets/Icons/arrowLeft.png" alt="Flecha izquierda" />
                            </button>

                            <div className='carousel-track-register'>
                                {participants.map((participant, index) => {
                                    const isMain = index === currentParticipantIndex;
                                    const isVisible = Math.abs(index - currentParticipantIndex) <= 2;

                                    if (!isVisible) return null;

                                    const position = index - currentParticipantIndex;
                                    const scale = 1 - Math.abs(position) * 0.1;
                                    const opacity = 1 - Math.abs(position) * 0.2;

                                    return (
                                        <div
                                            key={participant.ID}
                                            className={`carousel-card-register ${isMain ? 'main-card' : 'side-card'}`}
                                            style={{
                                                transform: `translateX(${position * 50}%) scale(${scale})`,
                                                zIndex: 5 - Math.abs(position),
                                                opacity: opacity
                                            }}
                                        >
                                            <div className="participant-image">
                                                <img
                                                    src={participant.foto_perfil ?
                                                        participant.foto_perfil.includes('googleusercontent.com') ?
                                                            `${participant.foto_perfil}=s400-c-rw` :
                                                            participant.foto_perfil
                                                        : "/src/assets/Icons/usuario.png"}
                                                    alt={`Foto de ${participant.aprendiz?.nombres}`}
                                                    onError={(e) => {
                                                        console.log('Error cargando imagen:', e);
                                                        e.target.onerror = null;
                                                        e.target.src = "/src/assets/Icons/usuario.png";
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>



                            <button
                                className="carousel-arrow-register right"
                                onClick={handleNextParticipant}
                            >
                                <img src="/src/assets/Icons/arrowRight.png" alt="Flecha derecha" />
                            </button>
                        </div>
                        <p className="participant-name">
                            {currentParticipant?.aprendiz?.nombres} {currentParticipant?.aprendiz?.apellidos}
                        </p>



                    </div>

                ) : null}

                <div className="attendance-buttons">
                    <button
                        className={`attendance-button-asist ${participantStatus === 'Presente' ? 'active' : ''}`}
                        onClick={() => handleAttendanceStatus(currentParticipant.aprendiz.ID, 'Presente')}
                    >
                        Asistencia
                    </button>
                    <button
                        className={`attendance-button-noAsist ${participantStatus === 'Ausente' ? 'active' : ''}`}
                        onClick={() => handleAttendanceStatus(currentParticipant.aprendiz.ID, 'Ausente')}
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

    if (selectedOption === 'update') {
        return (
            <Modal_General className='modal-attendance-register' closeModal={onClose}>
                <h2>Actualizar <span className='complementary'>asistencia</span></h2>
                <p>en este listado puedes actualizar las asistencias del día {format(parseISO(selectedDate), 'dd/MM/yyyy', { locale: es })}</p>

                <div className="update-container">
                    <section className="sectionGestionsCompanyBody">
                        <section className="filterGestionsCompany">
                            <strong className="tituloFiltrar">Filtrar por:</strong>

                            <article className="filterOptionsGestionsCompany">
                                <div className="filterOptionName">
                                    <label className="labelFilterOption1">Nombre o documento de identidad</label>

                                    <div className="inputFilterOption1">
                                        <input
                                            className="inputFilterOptionText"
                                            type="text"
                                            placeholder="Escriba el nombre o documento"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="courseStatusFilte">
                                    <label
                                        className="labelFilterOption1"
                                        style={{ padding: "0 0 .5rem 0" }}
                                    >
                                    Estado del aprendiz
                                    </label>

                                    <section className="sectionStatusFilter">
                                        <button 
                                            className={`statusOption ${selectedStatus === 'inactivo' ? 'selected' : ''}`}
                                            onClick={() => setSelectedStatus(selectedStatus === 'inactivo' ? '' : 'inactivo')}
                                        >
                                            Inactivo
                                        </button>
                                        <button 
                                            className={`statusOption ${selectedStatus === 'activo' ? 'selected' : ''}`}
                                            onClick={() => setSelectedStatus(selectedStatus === 'activo' ? '' : 'activo')}
                                        >
                                            Activo
                                        </button>
                                    </section>
                                </div>

                                <div className="courseStatusFilte">
                                    <label
                                        className="labelFilterOption1"
                                        style={{ padding: "0 0 .5rem 0" }}
                                    >
                                    Tipo de asistencia
                                    </label>

                                    <section className="sectionStatusFilter">
                                        <button 
                                            className={`statusOption ${selectedAttendance === 'Ausente' ? 'selected' : ''}`}
                                            onClick={() => setSelectedAttendance(selectedAttendance === 'Ausente' ? '' : 'Ausente')}
                                        >
                                            Inasistencia
                                        </button>
                                        <button 
                                            className={`statusOption ${selectedAttendance === 'Presente' ? 'selected' : ''}`}
                                            onClick={() => setSelectedAttendance(selectedAttendance === 'Presente' ? '' : 'Presente')}
                                        >
                                            Asistencia
                                        </button>
                                    </section>
                                </div>
                            </article>
                        </section>
                    </section>

                    <div className="carousel-section">
                        {error && (
                            <p className="error-message">{error}</p>
                        )}

                        {loading ? (
                            <div className="loading-container">
                                <p>Cargando participantes...</p>
                            </div>
                        ) : filteredParticipants.length === 0 ? (
                            <div className="no-participants">
                                <p>No hay participantes que coincidan con los filtros</p>
                            </div>
                        ) : (
                            <div className="carousel-container-update">
                                <div className="carousel-wrapper-update">
                                    <button
                                        className="carousel-arrow-update left"
                                        onClick={handlePrevParticipant}
                                        disabled={currentParticipantIndex === 0}
                                    >
                                        <img src="/src/assets/Icons/arrowLeft.png" alt="Flecha izquierda" />
                                    </button>

                                    <div className='carousel-track-update'>
                                        {filteredParticipants.map((participant, index) => {
                                            const isMain = index === currentParticipantIndex;
                                            const isVisible = Math.abs(index - currentParticipantIndex) <= 1;

                                            if (!isVisible) return null;

                                            const position = index - currentParticipantIndex;
                                            const scale = 1 - Math.abs(position) * 0.1;
                                            const opacity = 1 - Math.abs(position) * 0.2;

                                            return (
                                                <div
                                                    key={participant.aprendiz.ID}
                                                    className={`carousel-card-update ${isMain ? 'main-card' : 'side-card'}`}
                                                    style={{
                                                        transform: `translateX(${position * 50}%) scale(${scale})`,
                                                        zIndex: 5 - Math.abs(position),
                                                        opacity: opacity
                                                    }}
                                                >
                                                    <div className="participant-image">
                                                        <img
                                                            src={participant.foto_perfil ?
                                                                participant.foto_perfil.includes('googleusercontent.com') ?
                                                                    `${participant.foto_perfil}=s400-c-rw` :
                                                                    participant.foto_perfil
                                                                : "/src/assets/Icons/usuario.png"}
                                                            alt={`Foto de ${participant.aprendiz?.nombres}`}
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "/src/assets/Icons/usuario.png";
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <button
                                        className="carousel-arrow-update right"
                                        onClick={handleNextParticipant}
                                        disabled={currentParticipantIndex === filteredParticipants.length - 1}
                                    >
                                        <img src="/src/assets/Icons/arrowRight.png" alt="Flecha derecha" />
                                    </button>
                                </div>
                                <p className="participant-name">
                                    {filteredParticipants[currentParticipantIndex]?.aprendiz?.nombres} {filteredParticipants[currentParticipantIndex]?.aprendiz?.apellidos}
                                </p>
                               
                            </div>
                        )}
                    </div>
                </div>

                <button
                    className="save-button-update"
                    onClick={handleSaveAttendance}
                >
                    Ver Aprendiz
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
                                        r => r.aprendiz.ID === participant.aprendiz.ID
                                    );
                                    const isReadOnly = selectedOption === 'view';

                                    return (
                                        <tr key={participant.aprendiz.ID}>
                                            <td>
                                                {participant.aprendiz.nombres} {participant.aprendiz.apellidos}
                                            </td>
                                            <td>
                                                <span className={`status-badge ${record?.estado_asistencia?.toLowerCase() || 'pendiente'}`}>
                                                    {record?.estado_asistencia || 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="action-buttons">
                                                {!isReadOnly && (
                                                    <>
                                                        <button
                                                            className={`status-button ${record?.estado_asistencia === 'Presente' ? 'active' : ''}`}
                                                            onClick={() => handleAttendanceChange(participant.aprendiz.ID, 'Presente')}
                                                        >
                                                            Presente
                                                        </button>
                                                        <button
                                                            className={`status-button ${record?.estado_asistencia === 'Ausente' ? 'active' : ''}`}
                                                            onClick={() => handleAttendanceChange(participant.aprendiz.ID, 'Ausente')}
                                                        >
                                                            Ausente
                                                        </button>
                                                        <button
                                                            className={`status-button ${record?.estado_asistencia === 'Justificado' ? 'active' : ''}`}
                                                            onClick={() => handleAttendanceChange(participant.aprendiz.ID, 'Justificado')}
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
                                    <strong>Estado:</strong> {selectedRecord.estado_asistencia}
                                </p>
                            </div>
                        </div>
                    </Modal_General>
                )}
            </div>
        </Modal_General>
    );
}; 