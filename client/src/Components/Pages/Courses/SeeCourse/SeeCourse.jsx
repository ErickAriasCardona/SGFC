import React, { useEffect, useState } from 'react';
import './SeeCourse.css';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { Footer } from '../../../Layouts/Footer/Footer';
import { Main } from '../../../Layouts/Main/Main';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../../config/axiosInstance';
import calendar from '../../../../assets/Icons/calendar.png';
import buttonEdit from '../../../../assets/Icons/buttonEdit.png';
import { AssignInstructorCourse } from '../AssignInstructorCourse/AssignInstructorCourse';
import { ViewCalendar } from '../../../UI/Modal_Calendar/ViewCalendar/Calendar';
import { AttendanceManagement } from './AttendanceManagement';
import { Modal_General } from '../../../UI/Modal_General/Modal_General';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const SeeCourse = () => {

    const { id } = useParams(); // Obtener el ID del curso desde la URL
    const [curso, setCurso] = useState(null); // Estado para almacenar los datos del curso
    const [isViewCalendarOpen, setIsViewCalendarOpen] = useState(false);
    const [showAttendanceDatePicker, setShowAttendanceDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');
    const [showAttendanceManagement, setShowAttendanceManagement] = useState(false);
    const navigate = useNavigate(); // Hook para redirigir
    const [showModal, setShowModal] = useState(false);


    const showModalAssignInstructor = () => {
        console.log("Mostrando modal con ID:", curso?.ID);
        setShowModal(true);
    };

    const userSession =
        JSON.parse(localStorage.getItem('userSession')) ||
        JSON.parse(sessionStorage.getItem('userSession'));



    // Obtener los datos del curso al cargar la página
    useEffect(() => {
        const fetchCurso = async () => {
            try {
                const response = await axiosInstance.get(`/api/courses/cursos/${id}`); // Corregir la ruta
                setCurso(response.data); // Guardar los datos del curso en el estado
            } catch (error) {
                console.error("Error al obtener el curso:", error);
            }
        };

        fetchCurso();
    }, [id]);

    if (!curso) {
        return <p>Cargando...</p>; // Mostrar un mensaje mientras se cargan los datos
    }

    console.log('DÍAS DE FORMACIÓN:', curso.dias_formacion);

    // Prepare calendar data for ViewCalendar component
    const calendarData = {
        startDate: curso.fecha_inicio ? curso.fecha_inicio.split('T')[0] : '',
        endDate: curso.fecha_fin ? curso.fecha_fin.split('T')[0] : '',
        selectedSlots: curso.dias_formacion ? JSON.parse(curso.dias_formacion) : [],
        hora_inicio: curso.hora_inicio || '',
        hora_fin: curso.hora_fin || ''
    };

    // Función para redirigir a la página de gestión de asistencia
    const handleAttendanceClick = () => {
        navigate(`/Cursos/${id}/gestionar-asistencia`);
    };

    const handleDateSelect = (e) => {
        const date = e.target.value;
        if (date) {
            setSelectedDate(date);
            setShowAttendanceDatePicker(false);
            setShowAttendanceManagement(true);
        }
    };

    const handleCloseAttendanceManagement = () => {
        setShowAttendanceManagement(false);
        setSelectedDate('');
    };

    return (
        <>
            <Main>
                <div className='container_createCourse'>
                    <h2>
                        {curso.nombre_curso}
                    </h2>

                    <div className='containerInformation_CreateCourse'>
                        <label className='upload-area'>
                            {curso.imagen ? (
                                <img
                                    src={`http://localhost:3001${curso.imagen}`}
                                    alt="Imagen del curso"
                                    className="preview-image"
                                />
                            ) : (
                                <div className='upload-placeholder'>
                                    <p>No hay imagen disponible</p>
                                </div>
                            )}
                        </label>

                        <div className='containerDetails_course'>
                            <div id='containerInput_ficha'>
                                <label htmlFor="fichaCourse">Ficha: {curso.ficha} </label>

                            </div>

                            <p>Descripción: {curso.descripcion}  </p>

                            <div className='containerDetails_course2'>
                                <div>
                                    <div className="offer-type-container">
                                        <span>Tipo de oferta: {curso.tipo_oferta} </span>

                                    </div>
                                    <div className="offer-type-container">
                                        <span>Estado: {curso.estado} </span>

                                    </div>
                                </div>

                                <div>
                                    <p id='p_addInstructor'> Instructor: Sin asignar
                                        {userSession && (userSession.accountType === 'Administrador' || userSession.accountType === 'Gestor') && (
                                            <button className='addInstructor' onClick={showModalAssignInstructor}>
                                                <img src={buttonEdit} alt="" />
                                            </button>
                                        )}
                                    </p>

                                    <button className='addDate' onClick={() => setIsViewCalendarOpen(true)}>
                                        <img src={calendar} alt="" />
                                        Ver fechas y horarios
                                    </button>

                                    {/* Botón de gestión de asistencia (solo para instructores) */}
                                    {userSession?.accountType === 'Instructor' && (
                                        <button 
                                            className="manageAttendance"
                                            onClick={handleAttendanceClick}
                                        >
                                            Gestionar Asistencia
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mostrar botón solo si el usuario es Administrador o Gestor */}
                    {userSession && (userSession.accountType === 'Administrador' || userSession.accountType === 'Gestor') && (
                        <button
                            className='editCourse'
                            onClick={() => navigate(`/Cursos/ActualizarCurso/${id}`)}
                        >
                            Editar Curso
                        </button>
                    )}
                </div>

            </Main>
            <Footer />
            {showModal && curso && (
                <AssignInstructorCourse
                    curso_ID={curso.ID}
                    onClose={() => setShowModal(false)}
                />
            )}
            {isViewCalendarOpen && (
                <ViewCalendar
                    calendarData={calendarData}
                    closeModal={() => setIsViewCalendarOpen(false)}
                />
            )}

            {/* Modal de selección de fecha para asistencia */}
            {showAttendanceDatePicker && (
                <Modal_General closeModal={() => setShowAttendanceDatePicker(false)}>
                    <div className="attendance-date-picker">
                        <h3>Seleccionar Fecha para Gestionar Asistencia</h3>
                        <div className="date-input-container">
                            <label htmlFor="attendanceDate">Fecha:</label>
                            <input
                                type="date"
                                id="attendanceDate"
                                value={selectedDate}
                                onChange={handleDateSelect}
                                min={curso?.fecha_inicio?.split('T')[0]}
                                max={curso?.fecha_fin?.split('T')[0]}
                            />
                        </div>
                        <div className="modal-buttons">
                            <button 
                                className="cancel-button"
                                onClick={() => setShowAttendanceDatePicker(false)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </Modal_General>
            )}

            {/* Modal de gestión de asistencia */}
            {selectedDate && (
                <AttendanceManagement
                    open={showAttendanceManagement}
                    onClose={handleCloseAttendanceManagement}
                    courseId={curso.ID}
                    selectedDate={selectedDate}
                />
            )}
        </>
    );
};

