import React, { useEffect, useState } from 'react';
import './SeeCourse.css';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate
import { Header } from '../../../Layouts/Header/Header';
import { Footer } from '../../../Layouts/Footer/Footer';
import { Main } from '../../../Layouts/Main/Main';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../../../config/axiosInstance';
import calendar from '../../../../assets/Icons/calendar.png';

export const SeeCourse = () => {
   
    const { id } = useParams(); // Obtener el ID del curso desde la URL
    const [curso, setCurso] = useState(null); // Estado para almacenar los datos del curso
    const navigate = useNavigate(); // Hook para redirigir
  
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

                                    {/* <div className='containerInput_company'>
                                        <label htmlFor="nit_company">Empresa</label>
                                        <input
                                            id='nit_company'
                                            type="text"
                                            value={curso.empresa_NIT || "No especificado"}
                                            disabled
                                        />
                                    </div> */}
                                </div>

                                <div>
                                    <p id='p_addInstructor'> Instructor: Sin asignar
                                        {/* <button className='addInstructor'>
                                            <img src={buttonEdit} alt="" />
                                        </button> */}
                                    </p>

                                    {/* Botón para abrir el modal general */}
                                    <button className='addDate' >
                                        <img src={calendar} alt="" />
                                        Ver fechas y horarios
                                    </button>
                                </div>
                            </div>
                        </div>


                    </div>

                    <button
                        className='editCourse'
                        onClick={() => navigate(`/Cursos/ActualizarCurso/${id}`)} // Redirigir a la página de actualización
                    >
                        Editar Curso
                    </button>                </div>
            </Main>
            <Footer />
        </>
    );
};