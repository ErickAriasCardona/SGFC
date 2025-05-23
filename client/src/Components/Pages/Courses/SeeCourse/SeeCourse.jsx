import React, { useEffect, useState } from 'react';
import './SeeCourse.css';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { Header } from '../../../Layouts/Header/Header';
import { Footer } from '../../../Layouts/Footer/Footer';
import { Main } from '../../../Layouts/Main/Main';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../../config/axiosInstance';
import calendar from '../../../../assets/Icons/calendar.png';
import buttonEdit from '../../../../assets/Icons/buttonEdit.png';
import { AssignInstructorCourse } from '../AssignInstructorCourse/AssignInstructorCourse';
import { ViewCalendar } from '../../../UI/Modal_Calendar/ViewCalendar/Calendar';
import buttonEdit from '../../../../assets/Icons/buttonEdit.png';
import { AssignInstructorCourse } from '../AssignInstructorCourse/AssignInstructorCourse';
import { ViewCalendar } from '../../../UI/Modal_Calendar/ViewCalendar/Calendar';

export const SeeCourse = () => {


    const { id } = useParams(); // Obtener el ID del curso desde la URL
    const [curso, setCurso] = useState(null); // Estado para almacenar los datos del curso
    const [isViewCalendarOpen, setIsViewCalendarOpen] = useState(false);
    const [isViewCalendarOpen, setIsViewCalendarOpen] = useState(false);
    const navigate = useNavigate(); // Hook para redirigir
    const [showModal, setShowModal] = useState(false);


    const showModalAssignInstructor = () => {
        console.log("Mostrando modal con ID:", curso?.ID);
        setShowModal(true);
    };

    const userSession =
        JSON.parse(localStorage.getItem('userSession')) ||
        JSON.parse(sessionStorage.getItem('userSession'));



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
                const response = await axiosInstance.get(`/cursos/${id}`); // Solicitud al endpoint de obtener curso por ID
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

    // Prepare calendar data for ViewCalendar component
    const calendarData = {
        startDate: curso.fecha_inicio ? curso.fecha_inicio.split('T')[0] : '',
        endDate: curso.fecha_fin ? curso.fecha_fin.split('T')[0] : '',
        selectedSlots: curso.dias_formacion ? JSON.parse(curso.dias_formacion) : [],
        startDate: curso.fecha_inicio ? curso.fecha_inicio.split('T')[0] : '',
        endDate: curso.fecha_fin ? curso.fecha_fin.split('T')[0] : '',
        selectedSlots: curso.dias_formacion ? JSON.parse(curso.dias_formacion) : [],
    };

    return (
        <>
            <Header />
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
                                        {userSession && (userSession.accountType === 'Administrador' || userSession.accountType === 'Gestor') && (
                                            <button className='addInstructor' onClick={showModalAssignInstructor}>
                                                <img src={buttonEdit} alt="" />
                                            </button>
                                        )}
                                    </p>

                                    {/* Botón para abrir el modal general */}
                                    <button className='addDate' onClick={() => setIsViewCalendarOpen(true)}>
                                    <button className='addDate' onClick={() => setIsViewCalendarOpen(true)}>
                                        <img src={calendar} alt="" />
                                        Ver fechas y horarios
                                    </button>
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
                    onClose={() => setShowModal(false)} // Para poder cerrarlo desde dentro
                />

            )}
            {isViewCalendarOpen && (
                <ViewCalendar
                    calendarData={calendarData}
                    closeModal={() => setIsViewCalendarOpen(false)}
                />
            )}

        </>
    );
};



