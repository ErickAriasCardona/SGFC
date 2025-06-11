import React, { useEffect, useState, useRef, useMemo } from 'react';
import './MisCursos.css';
import { Footer } from '../../../Layouts/Footer/Footer';
import { Main } from '../../../Layouts/Main/Main';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../config/axiosInstance';
import arrowLeft from '../../../../assets/Icons/arrowLeft.png';
import arrowRight from '../../../../assets/Icons/arrowRight.png';

export const MisCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [filteredCursos, setFilteredCursos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  // Memoizar userSession para evitar cambios innecesarios
  const userSession = useMemo(() => {
    return JSON.parse(localStorage.getItem('userSession')) ||
           JSON.parse(sessionStorage.getItem('userSession'));
  }, []);

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        let response;

        if (!userSession?.ID && !userSession?.id) {
          setErrorMessage("No se pudo obtener el ID del usuario");
          return;
        }

        switch (userSession?.accountType) {
          case 'Instructor':
            const instructorId = userSession.ID || userSession.id;
            response = await axiosInstance.get(`/api/courses/cursos-asignados/${instructorId}`);
            const cursosAsignados = response.data.map(asignacion => ({
              ...asignacion.Curso,
              ID: asignacion.Curso.ID || asignacion.Curso.id || asignacion.curso_ID,
              ficha: asignacion.Curso.ficha || '',
              nombre_curso: asignacion.Curso.nombre_curso || '',
              descripcion: asignacion.Curso.descripcion || '',
              imagen: asignacion.Curso.imagen || null
            }));
            setCursos(cursosAsignados);
            setFilteredCursos(cursosAsignados);
            break;
          case 'Administrador':
          case 'Gestor':
            response = await axiosInstance.get("/api/courses/cursos");
            const todosLosCursos = response.data.map(curso => ({
              ...curso,
              ID: curso.ID || curso.id,
              ficha: curso.ficha || '',
              nombre_curso: curso.nombre_curso || '',
              descripcion: curso.descripcion || '',
              imagen: curso.imagen || null
            }));
            setCursos(todosLosCursos);
            setFilteredCursos(todosLosCursos);
            break;
          default:
            setErrorMessage("No tienes permisos para ver esta página");
            return;
        }
      } catch (error) {
        console.error("Error al obtener los cursos:", error);
        if (error.response?.status === 401) {
          localStorage.removeItem('userSession');
          sessionStorage.removeItem('userSession');
          navigate('/');
        } else if (error.response?.status === 403) {
          setErrorMessage('No tienes permisos para acceder a esta función');
        } else {
          setErrorMessage("Error al cargar los cursos");
        }
      }
    };

    if (userSession) {
      fetchCursos();
    } else {
      setErrorMessage("Debes iniciar sesión para ver tus cursos");
    }
  }, [userSession, navigate]);

  // Memoizar la función de búsqueda
  const handleSearch = useMemo(() => (e) => {
    const searchValue = e.target.value.toLowerCase().trim();
    setSearchTerm(searchValue);

    if (!searchValue) {
      setFilteredCursos(cursos);
      return;
    }

    const filtered = cursos.filter(curso => {
      const ficha = curso.ficha ? curso.ficha.toLowerCase().trim() : '';
      const nombre = curso.nombre_curso ? curso.nombre_curso.toLowerCase().trim() : '';
      
      return ficha === searchValue || nombre === searchValue;
    });

    setFilteredCursos(filtered);
  }, [cursos]);

  const handleNextCourse = () => {
    if (currentCourseIndex < filteredCursos.length - 1) {
      setCurrentCourseIndex(prev => prev + 1);
    }
  };

  const handlePrevCourse = () => {
    if (currentCourseIndex > 0) {
      setCurrentCourseIndex(prev => prev - 1);
    }
  };

  // Función para redirigir al usuario al ver un curso
  const handleCardClick = (ID) => {
    if (!ID) {
      console.error("El ID del curso es undefined o null");
      return;
    }
    navigate(`/Cursos/${ID}`);
  };

  if (errorMessage) {
    return (
      <>
        <Main>
          <div className="container_misCursos">
            <h2>Cursos Asignados</h2>
            <p className="error-message">{errorMessage}</p>
          </div>
        </Main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Main>
        <div className="container_misCursos">
          <h2>
            Cursos <span className='complementary'>Asignados</span>
          </h2>
          <p>Busca un curso por su ficha o nombre.</p>

          <div className='options_Search'>
            <div className="custom-select-container">
              <p>Filtrar por: </p>
            </div>
            <input
              type="text"
              placeholder='Buscar por ficha o nombre del curso'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className='searchCourse' onClick={handleSearch}>
              Buscar
            </button>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className='container-illustration-caruosel'>
            <div className="illustration-container-misCursos">
              <img src="/src/assets/Ilustrations/Professor-amico.svg" alt="Ilustración de gestión de asistencia" />
            </div>
            <div className='carousel-section-misCursos'>
              {filteredCursos.length === 0 ? (
                <div className="no-courses">
                  <p>No hay cursos que coincidan con la búsqueda</p>
                </div>
              ) : (
                <div className="carousel-container-misCursos">
                  <div className="carousel-wrapper-misCursos">
                    <button
                      className="carousel-arrow-misCursos left"
                      onClick={handlePrevCourse}
                      disabled={currentCourseIndex === 0}
                    >
                      <img src={arrowLeft} alt="Flecha izquierda" />
                    </button>

                    <div className="carousel-track-misCursos">
                      {filteredCursos.map((curso, index) => {
                        const isMain = index === currentCourseIndex;
                        const isVisible = Math.abs(index - currentCourseIndex) <= 1;

                        if (!isVisible) return null;

                        const position = index - currentCourseIndex;
                        const scale = 1 - Math.abs(position) * 0.1;
                        const opacity = 1 - Math.abs(position) * 0.2;

                        return (
                          <div
                            key={`curso-${curso.ID || curso.id}`}
                            className={`carousel-card-misCursos ${isMain ? 'main-card' : 'side-card'}`}
                            style={{
                              transform: `translateX(${position * 50}%) scale(${scale})`,
                              zIndex: 5 - Math.abs(position),
                              opacity: opacity
                            }}
                            onClick={() => handleCardClick(curso.ID || curso.id)}
                          >
                            <img
                              src={`http://localhost:3001${curso.imagen}` || "ruta/imagen/por/defecto.jpg"}
                              alt={curso.nombre_curso || 'Curso sin nombre'}
                            />
                            <div className="card-text-misCursos">
                              <h4>{curso.nombre_curso || 'Sin nombre'}</h4>
                              <p>Ficha: {curso.ficha || 'No disponible'}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      className="carousel-arrow-misCursos right"
                      onClick={handleNextCourse}
                      disabled={currentCourseIndex === filteredCursos.length - 1}
                    >
                      <img src={arrowRight} alt="Flecha derecha" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Main>
      <Footer />
    </>
  );
}; 