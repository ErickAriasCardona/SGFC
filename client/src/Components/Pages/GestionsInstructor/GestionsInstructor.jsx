import React, { useState, useEffect } from 'react';
import './GestionsInstructor.css';
import { Header } from '../../../Components/Layouts/Header/Header';
import { Footer } from '../../../Components/Layouts/Footer/Footer';
import { Main } from '../../../Components/Layouts/Main/Main';
import { UpdateInstructor } from './UpdateInstructor/UpdateInstructor';
import axiosInstance from '../../../config/axiosInstance';

export const GestionsInstructor = () => {
    const [instructors, setInstructors] = useState([]); // Estado para almacenar los instructores
    const [filteredInstructors, setFilteredInstructors] = useState([]); // Estado para los instructores filtrados
    const [filter, setFilter] = useState(''); // Estado para el valor del filtro
    const [current, setCurrent] = useState(0); // Estado para el carrusel
    const [selectedState, setSelectedState] = useState({
        activo: true,
        inactivo: true,
    });
    const [selectedInstructor, setSelectedInstructor] = useState(null); // Estado para el instructor seleccionado

    const showModalSeeProfile = (instructor) => {
        setSelectedInstructor(instructor); // Establecer el instructor seleccionado
        const modalSeeProfile = document.getElementById("modal-overlayUpdateInstructor");
        if (modalSeeProfile) {
            modalSeeProfile.style.display = "flex"; // Mostrar el modal
        }
    };


    // Función para obtener los instructores desde el backend
    const fetchInstructors = async () => {
        try {
            const response = await axiosInstance.get('/instructores');
            setInstructors(response.data); // Guardar los datos en el estado
            setFilteredInstructors(response.data); // Inicialmente, los instructores filtrados son todos
        } catch (error) {
            console.error('Error al obtener los instructores:', error);
            alert('Hubo un problema al cargar los instructores. Por favor, inténtalo más tarde.');
        }
    };

    // Llamar a la función al cargar el componente
    useEffect(() => {
        fetchInstructors();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [selectedState, filter, instructors]);

    // Función para manejar el cambio en el input de filtro
    const handleFilterChange = (e) => {
        const value = e.target.value.toLowerCase();
        setFilter(value);

        // Filtrar los instructores según el nombre, apellidos o cédula
        const filtered = instructors.filter((instructor) =>
            instructor.nombres.toLowerCase().includes(value) ||
            instructor.apellidos.toLowerCase().includes(value) ||
            instructor.cedula.toLowerCase().includes(value)
        );

        // Aplicar también el filtro de estado
        const filteredByState = filtered.filter((instructor) => {
            if (selectedState.activo && instructor.estado.toLowerCase() === 'activo') {
                return true;
            }
            if (selectedState.inactivo && instructor.estado.toLowerCase() === 'inactivo') {
                return true;
            }
            return false;
        });

        setFilteredInstructors(filteredByState);
        setCurrent(0); // Reiniciar el índice del carrusel
    };

    const applyFilters = () => {
        const filtered = instructors.filter((instructor) =>
            (instructor.nombres || '').toLowerCase().includes(filter.toLowerCase()) ||
            (instructor.apellidos || '').toLowerCase().includes(filter.toLowerCase()) ||
            (instructor.cedula || '').toLowerCase().includes(filter.toLowerCase())
        );

        const filteredByState = filtered.filter((instructor) => {
            const estado = (instructor.estado || '').toLowerCase();
            if (selectedState.activo && estado === 'activo') {
                return true;
            }
            if (selectedState.inactivo && estado === 'inactivo') {
                return true;
            }
            return false;
        });

        setFilteredInstructors(filteredByState);
        setCurrent(0);
    };



    const next = () => setCurrent((prev) => (prev + 1) % filteredInstructors.length);
    const prev = () => setCurrent((prev) => (prev - 1 + filteredInstructors.length) % filteredInstructors.length);

    const showModalCreateInstructor = () => {
        const modalCreateInstructor = document.getElementById("modal-overlayCreateInstructor");
        if (modalCreateInstructor) {
            modalCreateInstructor.style.display = "flex"; // Cambia el display a flex para mostrar el modal
        }
    };


    return (
        <>
            <Header />
            <Main>
                <div className="container_GestionsInstructor">
                    <h2>
                        Mis <span className="complementary">Instructores</span>
                    </h2>

                    <div className="containerGestionsInstructorOptions">
                        <div className="containerConsultInstructor">
                            <p>Filtrar por:</p>
                            <div className="containerFiltersInstructor">
                                <label htmlFor="inputNameCC">Nombre o Cédula</label>
                                <div className="inputSearchContainer">
                                    <input
                                        type="text"
                                        id="inputNameCC"
                                        placeholder="Escriba el nombre o la cédula"
                                        value={filter}
                                        onChange={handleFilterChange} // Manejar el cambio en el input
                                    />
                                </div>

                                <label>Estado</label>
                                <div className="statusButtons">
                                    <button
                                        className={`inactive ${selectedState.inactivo ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedState((prevState) => ({
                                                ...prevState,
                                                inactivo: !prevState.inactivo,
                                            }));
                                        }}
                                    >
                                        Inactivos
                                    </button>
                                    <button
                                        className={`active ${selectedState.activo ? 'selected' : ''}`}
                                        onClick={() => {
                                            setSelectedState((prevState) => ({
                                                ...prevState,
                                                activo: !prevState.activo,
                                            }));
                                        }}
                                    >
                                        Activos
                                    </button>
                                </div>
                            </div>
                            <button className="btn_createInstructor" onClick={showModalCreateInstructor}>Agregar Instructor</button>

                        </div>

                        <div className="containerGestionsInstructorResults">

                            {/* Mostrar flecha izquierda solo si hay más de un resultado */}
                            {filteredInstructors.length > 1 && (
                                <button className="arrow left" onClick={prev}>❮</button>
                            )}

                            <div className="carousel-container_2">
                                <div className="carousel-track">
                                    {filteredInstructors.length === 0 ? (
                                        // Mostrar mensaje si no hay resultados
                                        <p className="no-results">No hay resultados</p>
                                    ) : (
                                        // Mostrar una carta si hay un solo resultado
                                        filteredInstructors.length === 1 ? (
                                            <div className="carousel-card card-center">
                                                <img
                                                    src={filteredInstructors[0]?.foto_perfil || 'default-profile.png'} // Imagen del instructor
                                                    alt="Instructor"
                                                    className="carousel-image"
                                                />
                                                <div className="carousel-card-info">
                                                    <h3>{filteredInstructors[0]?.nombres} {filteredInstructors[0]?.apellidos}</h3>
                                                    <p>{filteredInstructors[0]?.titulo_profesional}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            // Mostrar una carta centrada con flechas si hay dos resultados
                                            filteredInstructors.length === 2 ? (
                                                [0].map((offset) => {
                                                    const index = (current + offset) % filteredInstructors.length;
                                                    const instructor = filteredInstructors[index];

                                                    return (
                                                        <div className="carousel-card card-center" key={index}>
                                                            <img
                                                                src={instructor?.foto_perfil || 'default-profile.png'} // Imagen del instructor
                                                                alt="Instructor"
                                                                className="carousel-image"
                                                            />
                                                            <div className="carousel-card-info">
                                                                <h3>{instructor?.nombres} {instructor?.apellidos}</h3>
                                                                <p>{instructor?.titulo_profesional}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                // Mostrar tres cartas si hay tres o más resultados
                                                [0, 1, 2].map((offset) => {
                                                    const index = (current + offset) % filteredInstructors.length;
                                                    const instructor = filteredInstructors[index];

                                                    let positionClass = '';
                                                    if (offset === 1) {
                                                        positionClass = 'card-center';
                                                    } else {
                                                        positionClass = 'card-side';
                                                    }

                                                    return (
                                                        <div className={`carousel-card ${positionClass}`} key={index}>
                                                            <img
                                                                src={instructor?.foto_perfil || 'default-profile.png'} // Imagen del instructor
                                                                alt="Instructor"
                                                                className="carousel-image"
                                                            />
                                                            <div className="carousel-card-info">
                                                                <h3>{instructor?.nombres} {instructor?.apellidos}</h3>
                                                                <p>{instructor?.titulo_profesional}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )
                                        )
                                    )}
                                </div>

                                {/* Mostrar información del instructor actual */}
                                {filteredInstructors.length > 0 && (
                                    <div className="instructor-info">
                                        <h3>{filteredInstructors[(current + 1) % filteredInstructors.length]?.nombres} {filteredInstructors[(current + 1) % filteredInstructors.length]?.apellidos}</h3>
                                        <p>{filteredInstructors[(current + 1) % filteredInstructors.length]?.titulo_profesional}</p>
                                        <button
                                            className="profile-btn"
                                            onClick={() => showModalSeeProfile(filteredInstructors[(current + 1) % filteredInstructors.length])}
                                        >
                                            Ver perfil
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mostrar flecha derecha solo si hay más de un resultado */}
                            {filteredInstructors.length > 1 && (
                                <button className="arrow right" onClick={next}>❯</button>
                            )}
                        </div>
                    </div>
                </div>
            </Main>
            {selectedInstructor && (
                <UpdateInstructor
                    instructor={selectedInstructor}
                />
            )}

            <Footer />
        </>
    );
};