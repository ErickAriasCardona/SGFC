import React, { useEffect, useState, useRef } from 'react';
import './ConsultCourses.css';
import { Header } from '../../../Layouts/Header/Header';
import { Footer } from '../../../Layouts/Footer/Footer';
import { Main } from '../../../Layouts/Main/Main';
import axiosInstance from '../../../../config/axiosInstance';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirigir

import arrowLeft from '../../../../assets/Icons/arrowLeft.png';
import arrowRight from '../../../../assets/Icons/arrowRight.png';

export const ConsultCourses = () => {
  const [cursos, setCursos] = useState([]); // Estado para almacenar los cursos
  const [searchTerm, setSearchTerm] = useState(""); // Estado para el término de búsqueda
  const [errorMessage, setErrorMessage] = useState(""); // Estado para el mensaje de error
  const scrollRef = useRef(null);
  const navigate = useNavigate(); // Hook para redirigir

  // Función para obtener todos los cursos al cargar la página
  useEffect(() => {
    const fetchCursos = async () => {
      try {
        const response = await axiosInstance.get("/cursos"); // Solicitud al endpoint de cursos
        console.log("Datos recibidos del backend:", response.data); // Log para depuración
        setCursos(response.data); // Guardar los cursos en el estado
      } catch (error) {
        console.error("Error al obtener los cursos:", error);
      }
    };

    fetchCursos();
  }, []);

  // Función para manejar el scroll del carrusel
  const scroll = (direction) => {
    const { current } = scrollRef;
    if (!current) return;

    // Tomamos una tarjeta como referencia
    const card = current.querySelector('.carousel-card');
    if (!card) return;

    const cardStyles = window.getComputedStyle(card);
    const cardWidth = card.offsetWidth;
    const gap = parseInt(cardStyles.marginRight || 16); // fallback de 16px

    const scrollAmount = (cardWidth + gap) * 4;

    current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Función para buscar un curso por ID
  const handleSearch = async () => {
    if (!searchTerm) {
      setErrorMessage("Por favor, ingresa un ID para buscar.");
      return;
    }

    try {
      const response = await axiosInstance.get(`/cursos/${searchTerm}`); // Solicitud al endpoint de búsqueda por ID
      setCursos([response.data]); // Mostrar solo el curso encontrado
      setErrorMessage(""); // Limpiar el mensaje de error
    } catch (error) {
      console.error("Error al buscar el curso:", error);
      setCursos([]); // Limpiar los cursos mostrados
      setErrorMessage("No se encontraron resultados."); // Mostrar mensaje de error
    }
  };

  // Función para redirigir al usuario al ver un curso
  const handleCardClick = (ID) => {
    if (!ID) {
      console.error("El ID del curso es undefined o null");
      return;
    }
    navigate(`/Cursos/${ID}`); // Redirigir a la página del curso seleccionado
  };

  return (
    <>
      <Header />
      <Main>
        <div className="container_consultCourse">
          <h2>
            Buscar <span className='complementary'>Cursos</span>
          </h2>
          <p>Busca un curso por su ID.</p>

          <div className='options_Search'>

          <div className="custom-select-container">
              <select className="custom-select" defaultValue="">
                <option value="" disabled hidden>Categoría</option>
                <option value="desarrollo">Desarrollo</option>
                <option value="diseño">Diseño</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>
            <input
              type="text"
              placeholder='ID del curso'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} // Actualizar el término de búsqueda
            />
            <button className='searchCourse' onClick={handleSearch}>
              Buscar
            </button>
          </div>

          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Mostrar mensaje de error */}

          <div className='lineMedium'></div>

          <div className="carousel-container">
            <h2 className="carousel-title">Resultados</h2>
            <div className="carousel-wrapper">
              <button className="carousel-arrow left" onClick={() => scroll('left')}>
                <img src={arrowLeft} alt="Flecha izquierda" />
              </button>
              <div className="carousel-track" ref={scrollRef}>
                {cursos.map((curso) => (
                  <div
                    className="carousel-card"
                    key={curso.ID} // Usar el campo ID en mayúsculas
                    onClick={() => handleCardClick(curso.ID)} // Usar el campo ID en mayúsculas
                  >
                    <img
                      src={`http://localhost:3001${curso.imagen}` || "ruta/imagen/por/defecto.jpg"} // Construir la URL completa
                      alt={curso.nombre_curso}
                    />
                    <div className="card-text">
                      <h4>{curso.nombre_curso}</h4>
                      <p>{curso.descripcion}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button className="carousel-arrow right" onClick={() => scroll('right')}>
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