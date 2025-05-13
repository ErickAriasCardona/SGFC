import React, { useState, useRef, useEffect } from 'react';
import { NavBar } from '../../UI/NavBar/NavBar';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

export const Header = () => {
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);
  const [showGestionesMenu, setShowGestionesMenu] = useState(false);
  const coursesMenuRef = useRef(null);
  const gestionesMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation(); // Hook para obtener la ruta actual

  const userSession =
    JSON.parse(localStorage.getItem('userSession')) ||
    JSON.parse(sessionStorage.getItem('userSession'));

  const isLoggedIn = !!userSession;
  const accountType = userSession?.accountType || null;

  const toggleCoursesMenu = () => {
    setShowCoursesMenu((prev) => !prev);
  };

  const toggleGestionesMenu = () => {
    setShowGestionesMenu((prev) => !prev);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setShowCoursesMenu(false);
    setShowGestionesMenu(false);
  };

  // Cierre automático si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (coursesMenuRef.current && !coursesMenuRef.current.contains(event.target)) &&
        (gestionesMenuRef.current && !gestionesMenuRef.current.contains(event.target))
      ) {
        setShowCoursesMenu(false);
        setShowGestionesMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Validar si la ruta actual pertenece a "Cursos"
  const isCoursesActive = ['/Cursos/MisCursos', '/Cursos/BuscarCursos', '/Cursos/CrearCurso', '/Cursos/ActualizarCurso'].includes(location.pathname);

  // Validar si la ruta actual pertenece a "Gestiones"
  const isGestionesActive = ['/Gestiones/Instructor', '/Gestiones/Empresas', '/Gestiones/Cursos', '/Gestiones/Reportes'].includes(location.pathname);

  return (
    <div className="header">
      <NavBar>
        <NavLink to="/" className={({ isActive }) => (isActive ? 'startOption active' : 'startOption')}>
          Inicio
        </NavLink>
        <NavLink className="whoWeAre" to="/QuienesSomos">
          Quienes somos
        </NavLink>

        {/* Menú de Cursos con dropdown */}
        <div className="courses-menu" ref={coursesMenuRef}>
          <button
            className={`courses ${showCoursesMenu || isCoursesActive ? 'active' : ''}`}
            onClick={toggleCoursesMenu}
          >
            Cursos
          </button>
          {showCoursesMenu && (
            <div className="dropdown-courses">
              <div className="arrow-up" />
              <button onClick={() => handleMenuClick('/Cursos/MisCursos')}>Mis cursos</button>
              <button onClick={() => handleMenuClick('/Cursos/BuscarCursos')}>Buscar curso</button>
              <button onClick={() => handleMenuClick('/Cursos/CrearCurso')}>Crear curso</button>
              <button onClick={() => handleMenuClick('/Cursos/ActualizarCurso')}>Actualizar curso</button>
            </div>
          )}
        </div>

        {/* Menú de Gestiones con dropdown */}
        {isLoggedIn && accountType === 'Administrador' && (
          <div className="gestiones-menu" ref={gestionesMenuRef}>
            <button
              className={`gestiones ${showGestionesMenu || isGestionesActive ? 'active' : ''}`}
              onClick={toggleGestionesMenu}
            >
              Gestiones
            </button>
            {showGestionesMenu && (
              <div className="dropdown-gestiones">
                <div className="arrow-up" />
                <button onClick={() => handleMenuClick('/Gestiones/Instructor')}>Gestión de Instructores</button>
                <button onClick={() => handleMenuClick('/Gestiones/Gestor')}>Gestión de Gestores</button>
                {/* <button onClick={() => handleMenuClick('/Gestiones/Cursos')}>Gestión de Cursos</button>
                <button onClick={() => handleMenuClick('/Gestiones/Reportes')}>Gestión de Reportes</button> */}
              </div>
            )}
          </div>
        )}
      </NavBar>
    </div>
  );
};