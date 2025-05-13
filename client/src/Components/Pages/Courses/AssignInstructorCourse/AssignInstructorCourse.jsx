import React, { useState, useEffect } from 'react';
import './AssignInstructorCourse.css'



export const AssignInstructorCourse = () => {
    const [filteredCourses, setFilteredCourses] = useState([]); // Estado para los cursoes filtrados
    const [courses, setCourses] = useState([]); // Estado para almacenar los cursoes
    const [filter, setFilter] = useState(''); // Estado para el valor del filtro
    const [current, setCurrent] = useState(0); // Estado para el carrusel
    const [selectedState, setSelectedState] = useState({
        activo: true,
        inactivo: true,
    });
    const [selectedcurso, setSelectedcurso] = useState(null); // Estado para el curso seleccionado

    const closeModalAssigncursoCourse = () => {
        document.getElementById("modal-assingInstructorCourse").style.display = "none";
    };




    // Función para obtener los cursoes desde el backend
    const fetchCourses = async () => {
        try {
            const response = await fetch('http://localhost:3001/cursos'); // Cambia la URL según tu configuración
            if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            setCourses(data); // Guardar los datos en el estado
            setFilteredCourses(data); // Inicialmente, los cursoes filtrados son todos
        } catch (error) {
            console.error('Error al obtener los cursos:', error);
            alert('Hubo un problema al cargar los cursos. Por favor, inténtalo más tarde.');
        }
    };

    // Llamar a la función al cargar el componente
    useEffect(() => {
        fetchCourses();
    }, []);


    const next = () => setCurrent((prev) => (prev + 1) % filteredCourses.length);
    const prev = () => setCurrent((prev) => (prev - 1 + filteredCourses.length) % filteredCourses.length);


    return (
        <div id='modal-assingInstructorCourse'>
            <div className='modal-bodyAssignInstructorCourse'>

                <h2>Asignar Cursos</h2>

                <div className='containerGestionsInstructorResults'>

                    {/* Mostrar flecha izquierda solo si hay más de un resultado */}
                    {filteredCourses.length > 1 && (
                        <button className="arrow left" onClick={prev}>❮</button>
                    )}

                    <div className="carousel-container_2">
                        <div className="carousel-track">
                            {filteredCourses.length === 0 ? (
                                // Mostrar mensaje si no hay resultados
                                <p className="no-results">No hay resultados</p>
                            ) : (
                                // Mostrar una carta si hay un solo resultado
                                filteredCourses.length === 1 ? (
                                    <div className="carousel-card card-center">
                                        <img
                                            src={`http://localhost:3001${curso?.imagen || 'default-profile.png'}`}
                                            alt="curso"
                                            className="carousel-image"
                                        />
                                        <div className="carousel-card-info">
                                            <h3>{filteredCourses[0]?.nombre_curso}</h3>
                                        </div>
                                    </div>
                                ) : (
                                    // Mostrar una carta centrada con flechas si hay dos resultados
                                    filteredCourses.length === 2 ? (
                                        [0].map((offset) => {
                                            const index = (current + offset) % filteredCourses.length;
                                            const curso = filteredCourses[index];

                                            return (
                                                <div className="carousel-card card-center" key={index}>
                                                    <img
                                                        src={curso?.imagen || 'default-profile.png'} // Imagen del curso
                                                        alt="curso"
                                                        className="carousel-image"
                                                    />
                                                    <div className="carousel-card-info">
                                                        <h3>{curso?.nombre_curso}</h3>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        // Mostrar tres cartas si hay tres o más resultados
                                        [0, 1, 2].map((offset) => {
                                            const index = (current + offset) % filteredCourses.length;
                                            const curso = filteredCourses[index];

                                            let positionClass = '';
                                            if (offset === 1) {
                                                positionClass = 'card-center';
                                            } else {
                                                positionClass = 'card-side';
                                            }

                                            return (
                                                <div className={`carousel-card ${positionClass}`} key={index}>
                                                    <img
                                                        src={curso?.imagen || 'default-profile.png'} // Imagen del curso
                                                        alt="curso"
                                                        className="carousel-image"
                                                    />
                                                    <div className="carousel-card-info">
                                                        <h3>{curso?.nombre_curso}</h3>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )
                                )
                            )}
                        </div>

                        {/* Mostrar información del curso actual */}
                        {filteredCourses.length > 0 && (
                            <div className="instructor-info">
                                <h3>{filteredCourses[(current + 1) % filteredCourses.length]?.nombre_curso}</h3>
                                <button
                                    className="profile-btn"
                                // onClick={() => showModalSeeProfile(filteredCourses[(current + 1) % filteredCourses.length])}
                                >
                                    Asignar Curso
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mostrar flecha derecha solo si hay más de un resultado */}
                    {filteredCourses.length > 1 && (
                        <button className="arrow right" onClick={next}>❯</button>
                    )}
                </div>

                <div className="container_return_CreateInstructor">
                    <h5>Volver</h5>
                    <button type="button" onClick={closeModalAssigncursoCourse} className="closeModal"></button>
                </div>
            </div>

        </div>
    )
}
