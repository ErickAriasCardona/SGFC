import React, { useState, useEffect } from 'react';
import './GestionsEmployes.css';
import { Footer } from '../../../Components/Layouts/Footer/Footer';
import { Main } from '../../../Components/Layouts/Main/Main';
import { UpdateEmploye } from './UpdateEmploye/UpdateEmploye';
import axiosInstance from '../../../config/axiosInstance';

export const GestionsEmployes = () => {
  const [employes, setEmployes] = useState([]); // Estado para almacenar los empleados
      const [filteredEmployes, setFilteredEmployes] = useState([]); // Estado para los empleados filtrados
      const [filter, setFilter] = useState(''); // Estado para el valor del filtro
      const [current, setCurrent] = useState(0); // Estado para el carrusel
      const [selectedState, setSelectedState] = useState({
          activo: true,
          inactivo: true,
      });
      const [selectedEmploye, setSelectedEmploye] = useState(null); // Estado para el Employe seleccionado
  
      const showModalSeeProfile = (employe) => {
          setSelectedEmploye(employe); // Establecer el Employe seleccionado
          const modalSeeProfile = document.getElementById("modal-overlayUpdateEmploye");
          if (modalSeeProfile) {
              modalSeeProfile.style.display = "flex"; // Mostrar el modal
          }
      };


    // Función para obtener los empleados desde el backend
const fetchEmployes = async () => {
    try {
        // Buscar primero en localStorage, luego en sessionStorage
        let userSessionString = localStorage.getItem('userSession');
        if (!userSessionString) {
            userSessionString = sessionStorage.getItem('userSession');
        }
        if (!userSessionString) {
            alert('No se encontró la sesión de usuario.');
            return;
        }
        const userSession = JSON.parse(userSessionString);
        if (!userSession || !userSession.id) {
            alert('No se encontró el ID de la empresa en la sesión.');
            return;
        }
        // Hacer la petición con el ID de la empresa
        const response = await axiosInstance.get(`/api/users/empresa/empleados/${userSession.ID}`);
        setEmployes(response.data);
        setFilteredEmployes(response.data);
    } catch (error) {
        console.error('Error al obtener los empleados:', error);
        alert('Hubo un problema al cargar los empleados. Por favor, inténtalo más tarde.');
    }
};

    // Llamar a la función al cargar el componente
        useEffect(() => {
            fetchEmployes();
        }, []);
    
        useEffect(() => {
            applyFilters();
        }, [selectedState, filter, employes]);
    
        // Función para manejar el cambio en el input de filtro
        const handleFilterChange = (e) => {
            const value = e.target.value.toLowerCase();
            setFilter(value);
    
            // Filtrar los Employees según el nombre, apellidos o cédula
            const filtered = employes.filter((employe) =>
                employe.nombres.toLowerCase().includes(value) ||
                employe.apellidos.toLowerCase().includes(value) ||
                employe.cedula.toLowerCase().includes(value)
            );
    
            // Aplicar también el filtro de estado
            const filteredByState = filtered.filter((employe) => {
                if (selectedState.activo && employe.estado.toLowerCase() === 'activo') {
                    return true;
                }
                if (selectedState.inactivo && employe.estado.toLowerCase() === 'inactivo') {
                    return true;
                }
                return false;
            });
    
            setFilteredEmployes(filteredByState);
            setCurrent(0); // Reiniciar el índice del carrusel
        };

    const applyFilters = () => {
        const filtered = employes.filter((employe) =>
            (employe.nombres || '').toLowerCase().includes(filter.toLowerCase()) ||
            (employe.apellidos || '').toLowerCase().includes(filter.toLowerCase()) ||
            (employe.cedula || '').toLowerCase().includes(filter.toLowerCase())
        );

        const filteredByState = filtered.filter((employe) => {
            const estado = (employe.estado || '').toLowerCase();
            if (selectedState.activo && estado === 'activo') {
                return true;
            }
            if (selectedState.inactivo && estado === 'inactivo') {
                return true;
            }
            return false;
        });

        setFilteredEmployes(filteredByState);
        setCurrent(0);
    };

    const next = () => setCurrent((prev) => (prev + 1) % filteredEmployes.length);
    const prev = () => setCurrent((prev) => (prev - 1 + filteredEmployes.length) % filteredEmployes.length);

    const showModalCreateEmploye = () => {
        const modalCreateEmploye = document.getElementById("modal-overlayCreateEmploye");
        if (modalCreateEmploye) {
            modalCreateEmploye.style.display = "flex"; // Cambia el display a flex para mostrar el modal
        }
    };


  return (
            <>
            <Main>
                <div className="container_GestionsEmploye">
                    <h2>
                        Mis <span className="complementary">Empleados</span>
                    </h2>

                    <div className="containerGestionsEmployeOptions">
                        <div className="containerConsultEmploye">
                            <p>Filtrar por:</p>
                            <div className="containerFiltersEmploye">
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
                            <button className="btn_createEmploye" onClick={showModalCreateEmploye}>Agregar Empleado</button>

                        </div>

                        <div className="containerGestionsEmployeResults">

                            {/* Mostrar flecha izquierda solo si hay más de un resultado */}
                            {filteredEmployes.length > 1 && (
                                <button className="arrow left" onClick={prev}>❮</button>
                            )}

                            <div className="carousel-container_2">
                                <div className="carousel-track">
                                    {filteredEmployes.length === 0 ? (
                                        // Mostrar mensaje si no hay resultados
                                        <p className="no-results">No hay resultados</p>
                                    ) : (
                                        // Mostrar una carta si hay un solo resultado
                                        filteredEmployes.length === 1 ? (
                                            <div className="carousel-card card-center">
                                                <img
                                                    src={filteredEmployes[0]?.foto_perfil || 'default-profile.png'} // Imagen del Employe
                                                    alt="Employe"
                                                    className="carousel-image"
                                                />
                                                <div className="carousel-card-info">
                                                    <h3>{filteredEmployes[0]?.nombres} {filteredEmployes[0]?.apellidos}</h3>
                                                    <p>{filteredEmployes[0]?.titulo_profesional}</p>
                                                </div>
                                            </div>
                                        ) : (
                                            // Mostrar una carta centrada con flechas si hay dos resultados
                                            filteredEmployes.length === 2 ? (
                                                [0].map((offset) => {
                                                    const index = (current + offset) % filteredEmployes.length;
                                                    const Employe = filteredEmployes[index];

                                                    return (
                                                        <div className="carousel-card card-center" key={index}>
                                                            <img
                                                                src={Employe?.foto_perfil || 'default-profile.png'} // Imagen del Employe
                                                                alt="Employe"
                                                                className="carousel-image"
                                                            />
                                                            <div className="carousel-card-info">
                                                                <h3>{Employe?.nombres} {Employe?.apellidos}</h3>
                                                                <p>{Employe?.titulo_profesional}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                // Mostrar tres cartas si hay tres o más resultados
                                                [0, 1, 2].map((offset) => {
                                                    const index = (current + offset) % filteredEmployes.length;
                                                    const Employe = filteredEmployes[index];

                                                    let positionClass = '';
                                                    if (offset === 1) {
                                                        positionClass = 'card-center';
                                                    } else {
                                                        positionClass = 'card-side';
                                                    }

                                                    return (
                                                        <div className={`carousel-card ${positionClass}`} key={index}>
                                                            <img
                                                                src={Employe?.foto_perfil || 'default-profile.png'} // Imagen del Employe
                                                                alt="Employe"
                                                                className="carousel-image"
                                                            />
                                                            <div className="carousel-card-info">
                                                                <h3>{Employe?.nombres} {Employe?.apellidos}</h3>
                                                                <p>{Employe?.titulo_profesional}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )
                                        )
                                    )}
                                </div>

                                {/* Mostrar información del Employe actual */}
                                {filteredEmployes.length > 0 && (
                                    <div className="Employe-info">
                                        <h3>{filteredEmployes[(current + 1) % filteredEmployes.length]?.nombres} {filteredEmployes[(current + 1) % filteredEmployes.length]?.apellidos}</h3>
                                        <p>{filteredEmployes[(current + 1) % filteredEmployes.length]?.titulo_profesional}</p>
                                        <button
                                            className="profile-btn"
                                            onClick={() => showModalSeeProfile(filteredEmployes[(current + 1) % filteredEmployes.length])}
                                        >
                                            Ver perfil
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Mostrar flecha derecha solo si hay más de un resultado */}
                            {filteredEmployes.length > 1 && (
                                <button className="arrow right" onClick={next}>❯</button>
                            )}
                        </div>
                    </div>
                </div>
            </Main>
            {selectedEmploye && (
                <UpdateEmploye
                    Employe={selectedEmploye}
                />
            )}

            <Footer />
        </>
  )
}
