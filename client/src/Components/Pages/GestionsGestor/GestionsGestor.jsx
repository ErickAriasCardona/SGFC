import React, { useState, useEffect } from 'react';
import './GestionsGestor.css';
import { Header } from '../../Layouts/Header/Header';
import { Footer } from '../../Layouts/Footer/Footer';
import { Main } from '../../Layouts/Main/Main';
import { UpdateGestor } from './UpdateGestor/UpdateGestor';
import axiosInstance from '../../../config/axiosInstance';
export const GestionsGestor = () => {
    const [gestores, setGestores] = useState([]); // Estado para almacenar los instructores
    const [filteredGestor, setFilteredGestores] = useState([]); // Estado para los instructores filtrados
    const [filter, setFilter] = useState(''); // Estado para el valor del filtro
    const [current, setCurrent] = useState(0); // Estado para el carrusel
    const [selectedState, setSelectedState] = useState({
        activo: true,
        inactivo: true,
    });

    const [selectedGestor, setSelectedGestor] = useState(null); // Estado para el instructor seleccionado

    const showModalSeeProfile = (gestor) => {
        setSelectedGestor(gestor); // Establecer el instructor seleccionado
        const modalSeeProfile = document.getElementById("modal-overlayUpdateGestor");
        if (modalSeeProfile) {
            modalSeeProfile.style.display = "flex"; // Mostrar el modal
        }
    };



    // Función para obtener los gestores desde el backend
    const fetchGestor = async () => {
        try {
            const response = await axiosInstance.get('/Gestores'); // Usa la ruta relativa
            setGestores(response.data); // Guardar los datos en el estado
            setFilteredGestores(response.data); // Inicialmente, los gestores filtrados son todos
        } catch (error) {
            console.error('Error al obtener los Gestores:', error);
            alert('Hubo un problema al cargar los Gestores. Por favor, inténtalo más tarde.');
        }
    };

    // Llamar a la función al cargar el componente
    useEffect(() => {
        fetchGestor();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [selectedState, filter, gestores]);


    // Función para manejar el cambio en el input de filtro
    const handleFilterChange = (e) => {
        const value = e.target.value.toLowerCase();
        setFilter(value);

        // Filtrar los instructores según el nombre, apellidos o cédula
        const filtered = gestor.filter((gestor) =>
            gestor.nombres.toLowerCase().includes(value) ||
            gestor.apellidos.toLowerCase().includes(value) ||
            gestor.cedula.toLowerCase().includes(value)
        );

        // Aplicar también el filtro de estado
        const filteredByState = filtered.filter((gestor) => {
            if (selectedState.activo && gestor.estado.toLowerCase() === 'activo') {
                return true;
            }
            if (selectedState.inactivo && gestor.estado.toLowerCase() === 'inactivo') {
                return true;
            }
            return false;
        });

        setFilteredGestores(filteredByState);
        setCurrent(0); // Reiniciar el índice del carrusel
    };

    const applyFilters = () => {
        // Filtrar los Gestores según el nombre, apellidos o cédula
        const filtered = gestores.filter((gestor) =>
            gestor.nombres.toLowerCase().includes(filter) ||
            gestor.apellidos.toLowerCase().includes(filter) ||
            gestor.cedula.toLowerCase().includes(filter)
        );

        // Aplicar también el filtro de estado
        const filteredByState = filtered.filter((gestor) => {
            if (selectedState.activo && gestor.estado.toLowerCase() === 'activo') {
                return true;
            }
            if (selectedState.inactivo && gestor.estado.toLowerCase() === 'inactivo') {
                return true;
            }
            return false;
        });

        setFilteredGestores(filteredByState);
        setCurrent(0); // Reiniciar el índice del carrusel
    };

    const next = () => setCurrent((prev) => (prev + 1) % filteredGestor.length);
    const prev = () => setCurrent((prev) => (prev - 1 + filteredGestor.length) % filteredGestor.length);

    const showModalCreateGestor = () => {
        const modalCreateGestor = document.getElementById("modal-overlayCreateGestor");
        if (modalCreateGestor) {
            modalCreateGestor.style.display = "flex"; // Cambia el display a flex para mostrar el modal
        }
    };

    return (
        <>
            <Header />
            <Main>
                <div className="container_GestionsGestor">
                    <h2>
                        Mis <span className="complementary">Gestores</span>
                    </h2>

                    <div className="containerGestionsGestorOptions">
                        <div className="containerConsultGestor">
                            <p>Filtrar por:</p>
                            <div className="containerFiltersGestor">
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
                            <button className="btn_createGestor" onClick={showModalCreateGestor}>Agregar Gestor</button>

                        </div>

                        <div className="containerGestionsInstructorResults">
                            {/* Mostrar flecha izquierda solo si hay más de un resultado */}
                            {filteredGestor.length > 1 && (
                                <button className="arrow left" onClick={prev}>❮</button>
                            )}

                            <div className="carousel-container_2">
                                <div className="carousel-track">
                                    {filteredGestor.length === 0 ? (
                                        // Mostrar mensaje si no hay resultados
                                        <p className="no-results">No hay resultados</p>
                                    ) : (
                                        // Mostrar una carta si hay un solo resultado
                                        filteredGestor.length === 1 ? (
                                            <div className="carousel-card card-center">
                                                <img
                                                    src={filteredGestor[0]?.foto_perfil || 'default-profile.png'} // Imagen del instructor
                                                    alt="Gestor"
                                                    className="carousel-image"
                                                />
                                                <div className="carousel-card-info">
                                                    <h3>{filteredGestor[0]?.nombres} {filteredGestor[0]?.apellidos}</h3>
                                                </div>
                                            </div>
                                        ) : (
                                            // Mostrar una carta centrada con flechas si hay dos resultados
                                            filteredGestor.length === 2 ? (
                                                [0].map((offset) => {
                                                    const index = (current + offset) % filteredGestor.length;
                                                    const gestor = filteredGestor[index];

                                                    return (
                                                        <div className="carousel-card card-center" key={index}>
                                                            <img
                                                                src={gestor?.foto_perfil || 'default-profile.png'} // Imagen del instructor
                                                                alt="Gestor"
                                                                className="carousel-image"
                                                            />
                                                            <div className="carousel-card-info">
                                                                <h3>{gestor?.nombres} {gestor?.apellidos}</h3>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                // Mostrar tres cartas si hay tres o más resultados
                                                [0, 1, 2].map((offset) => {
                                                    const index = (current + offset) % filteredGestor.length;
                                                    const gestor = filteredGestor[index];

                                                    let positionClass = '';
                                                    if (offset === 1) {
                                                        positionClass = 'card-center';
                                                    } else {
                                                        positionClass = 'card-side';
                                                    }

                                                    return (
                                                        <div className={`carousel-card ${positionClass}`} key={index}>
                                                            <img
                                                                src={gestor?.foto_perfil || 'default-profile.png'} // Imagen del instructor
                                                                alt="Gestor"
                                                                className="carousel-image"
                                                            />
                                                            <div className="carousel-card-info">
                                                                <h3>{gestor?.nombres} {gestor?.apellidos}</h3>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )
                                        )
                                    )}
                                </div>

                                {/* Mostrar información del gestor actual */}
                                {filteredGestor.length > 0 && (
                                    <div className="instructor-info">
                                        <h3>{filteredGestor[(current + 1) % filteredGestor.length]?.nombres} {filteredGestor[(current + 1) % filteredGestor.length]?.apellidos}</h3>
                                        <button
                                            className="profile-btn"
                                            onClick={() => showModalSeeProfile(filteredGestor[(current + 1) % filteredGestor.length])}
                                        >
                                            Ver perfil
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mostrar flecha derecha solo si hay más de un resultado */}
                            {filteredGestor.length > 1 && (
                                <button className="arrow right" onClick={next}>❯</button>
                            )}
                        </div>
                    </div>
                </div>
            </Main>
            {selectedGestor && (
                <UpdateGestor
                    gestor={selectedGestor}
                />
            )}
            <Footer />
        </>
    );
};