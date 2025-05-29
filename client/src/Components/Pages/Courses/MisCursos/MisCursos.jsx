import React, { useEffect, useState, useRef } from 'react';
import './MisCursos.css';
import { Header } from '../../../Layouts/Header/Header';
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
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const userSession = JSON.parse(localStorage.getItem('userSession')) || 
                     JSON.parse(sessionStorage.getItem('userSession'));

  useEffect(() => {
    const fetchCursos = async () => {
      try {
        let response;
        
        // Obtener cursos según el tipo de cuenta
        switch (userSession?.accountType) {
          case 'Instructor':
            response = await axiosInstance.get(`/api/course/cursos-asignados/${userSession.id}`);
            // Transformar la respuesta para mantener el mismo formato que los otros endpoints
            const cursosAsignados = response.data.map(asignacion => ({
              ...asignacion.Curso,
              // Asegurar que cada curso tenga un ID único
              ID: asignacion.Curso.ID || asignacion.Curso.id || asignacion.curso_ID
            }));
            setCursos(cursosAsignados);
            setFilteredCursos(cursosAsignados);
            break;
          case 'Administrador':
          case 'Gestor':
            // Para administradores y gestores, mostrar todos los cursos
            response = await axiosInstance.get("/api/course/cursos");
            // Asegurar que cada curso tenga un ID único
            const todosLosCursos = response.data.map(curso => ({
              ...curso,
              ID: curso.ID || curso.id
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
        setErrorMessage("Error al cargar los cursos");
      }
    };

    if (userSession) {
      fetchCursos();
    } else {
      setErrorMessage("Debes iniciar sesión para ver tus cursos");
    }
  }, [userSession]);

  // Función para filtrar cursos por ficha
  const handleSearch = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    
    const filtered = cursos.filter(curso => 
      (curso.ficha || '').toLowerCase().includes(searchValue) ||
      (curso.nombre_curso || '').toLowerCase().includes(searchValue)
    );
    setFilteredCursos(filtered);
  };

  // Función para manejar el scroll del carrusel
  const scroll = (direction) => {
    const { current } = scrollRef;
    if (!current) return;

    const card = current.querySelector('.carousel-card');
    if (!card) return;

    const cardStyles = window.getComputedStyle(card);
    const cardWidth = card.offsetWidth;
    const gap = parseInt(cardStyles.marginRight || 16);

    const scrollAmount = (cardWidth + gap) * 4;

    current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
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
        <Header />
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
      <Header />
      <Main>
        <div className="container_misCursos">
          <h2>
            Cursos <span className='complementary'>Asignados</span>
          </h2>
          <p>Busca un curso por su ficha o nombre.</p>

          <div className='options_Search'>
            <input
              type="text"
              placeholder='Buscar por ficha o nombre del curso'
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <div className='lineMedium'></div>

          <div className="carousel-container">
            <h2 className="carousel-title">Resultados ({filteredCursos.length})</h2>
            <div className="carousel-wrapper">
              <button 
                className="carousel-arrow left" 
                onClick={() => scroll('left')}
                disabled={filteredCursos.length === 0}
              >
                <img src={arrowLeft} alt="Flecha izquierda" />
              </button>
              <div className="carousel-track" ref={scrollRef}>
                {filteredCursos.map((curso) => {
                  // Asegurar que cada curso tenga un ID único
                  const cursoId = curso.ID || curso.id;
                  if (!cursoId) {
                    console.warn('Curso sin ID:', curso);
                    return null;
                  }
                  
                  return (
                    <div
                      className="carousel-card"
                      key={`curso-${cursoId}`}
                      onClick={() => handleCardClick(cursoId)}
                    >
                      <img
                        src={`http://localhost:3001${curso.imagen}` || "ruta/imagen/por/defecto.jpg"}
                        alt={curso.nombre_curso || 'Curso sin nombre'}
                      />
                      <div className="card-text">
                        <h4>{curso.nombre_curso || 'Sin nombre'}</h4>
                        <p className="ficha">Ficha: {curso.ficha || 'No disponible'}</p>
                        <p className="description">{curso.descripcion || 'Sin descripción'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <button 
                className="carousel-arrow right" 
                onClick={() => scroll('right')}
                disabled={filteredCursos.length === 0}
              >
                <img src={arrowRight} alt="Flecha derecha" />
              </button>
            </div>
          </div>
        </div>
      </Main>
      <Footer />
    </>
  );
}; 