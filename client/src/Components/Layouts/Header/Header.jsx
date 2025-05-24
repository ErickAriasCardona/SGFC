import React, { useState, useRef, useEffect } from 'react';
import { NavBar } from '../../UI/NavBar/NavBar';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

export const Header = ({ setShowSignIn, setShowSignUp, setShowAccountType }) => {
  const [showCoursesMenu, setShowCoursesMenu] = useState(false);
  const [showGestionesMenu, setShowGestionesMenu] = useState(false);
  const [showEmpleadosMenu, setShowEmpleadosMenu] = useState(false);
  const coursesMenuRef = useRef(null);
  const gestionesMenuRef = useRef(null);
  const empleadosMenuRef = useRef(null);
  const empleadosMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const userSession =
    JSON.parse(localStorage.getItem('userSession')) ||
    JSON.parse(sessionStorage.getItem('userSession'));

  const isLoggedIn = !!userSession;
  const accountType = userSession?.accountType || null;

  const toggleCoursesMenu = () => setShowCoursesMenu((prev) => !prev);
  const toggleGestionesMenu = () => setShowGestionesMenu((prev) => !prev);
  const toggleEmpleadosMenu = () => setShowEmpleadosMenu((prev) => !prev);
  const toggleCoursesMenu = () => setShowCoursesMenu((prev) => !prev);
  const toggleGestionesMenu = () => setShowGestionesMenu((prev) => !prev);
  const toggleEmpleadosMenu = () => setShowEmpleadosMenu((prev) => !prev);

  const handleMenuClick = (path) => {
    navigate(path);
    setShowCoursesMenu(false);
    setShowGestionesMenu(false);
    setShowEmpleadosMenu(false);
    setShowEmpleadosMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        (!coursesMenuRef.current?.contains(event.target)) &&
        (!gestionesMenuRef.current?.contains(event.target)) &&
        (!empleadosMenuRef.current?.contains(event.target))
        (!coursesMenuRef.current?.contains(event.target)) &&
        (!gestionesMenuRef.current?.contains(event.target)) &&
        (!empleadosMenuRef.current?.contains(event.target))
      ) {
        setShowCoursesMenu(false);
        setShowGestionesMenu(false);
        setShowEmpleadosMenu(false);
        setShowEmpleadosMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = (optionsCount) => optionsCount > 1;
  const showDropdown = (optionsCount) => optionsCount > 1;

  return (
    <div className="header">
      <NavBar 
        setShowSignIn={setShowSignIn}
        setShowSignUp={setShowSignUp}
        setShowAccountType={setShowAccountType}
      >
        <NavLink to="/" className={({ isActive }) => (isActive ? 'startOption active' : 'startOption')}>
          Inicio
        </NavLink>


        <NavLink className="whoWeAre" to="/QuienesSomos">
          Quienes somos
        </NavLink>

        {/* Cursos */}
        {(() => {
          let options = [];

          if (!isLoggedIn) {
            return (
              <button className="courses" onClick={() => navigate('/Cursos/BuscarCursos')}>
                Cursos
              </button>
            );
          }

          switch (accountType) {
            case 'Administrador':
              options = [
                { label: 'Mis cursos', path: '/Cursos/MisCursos' },
                { label: 'Buscar cursos', path: '/Cursos/BuscarCursos' },
                { label: 'Crear curso', path: '/Cursos/CrearCurso' },
              ];
              break;
            case 'Instructor':
              options = [
                { label: 'Mis cursos', path: '/Cursos/MisCursos' },
                { label: 'Buscar cursos', path: '/Cursos/BuscarCursos' },
                // { label: 'Asistencias', path: '/Cursos/Asistencias' },
              ];
              break;
            case 'Gestor':
              options = [
                { label: 'Mis cursos', path: '/Cursos/MisCursos' },
                { label: 'Buscar cursos', path: '/Cursos/BuscarCursos' },
                { label: 'Crear curso', path: '/Cursos/CrearCurso' },
              ];
              break;
            case 'Empresa':
              options = [
                { label: 'Mis cursos', path: '/Cursos/MisCursos' },
                { label: 'Buscar cursos', path: '/Cursos/BuscarCursos' },
                // { label: 'Solicitar curso', path: '/Cursos/SolicitarCurso' },
              ];
              break;
            default:
              return null;
          }

          return showDropdown(options.length) ? (
            <div className="courses-menu" ref={coursesMenuRef}>
              <button className={`courses ${showCoursesMenu ? 'active' : ''}`} onClick={toggleCoursesMenu}>
                Cursos
              </button>
              {showCoursesMenu && (
                <div className="dropdown-courses">
                  <div className="arrow-up" />
                  {options.map((opt, index) => (
                    <button key={index} onClick={() => handleMenuClick(opt.path)}>{opt.label}</button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button className="courses" onClick={() => handleMenuClick(options[0].path)}>
              Cursos
            </button>
          );
        })()}
        {/* Cursos */}
        {(() => {
          let options = [];

          if (!isLoggedIn) {
            return (
              <button className="courses" onClick={() => navigate('/Cursos/BuscarCursos')}>
                Cursos
              </button>
            );
          }

          switch (accountType) {
            case 'Administrador':
              options = [
                { label: 'Mis cursos', path: '/Cursos/MisCursos' },
                { label: 'Buscar cursos', path: '/Cursos/BuscarCursos' },
                { label: 'Crear curso', path: '/Cursos/CrearCurso' },
              ];
              break;
            case 'Instructor':
              options = [
                { label: 'Mis cursos', path: '/Cursos/MisCursos' },
                { label: 'Buscar cursos', path: '/Cursos/BuscarCursos' },
                // { label: 'Asistencias', path: '/Cursos/Asistencias' },
              ];
              break;
            case 'Gestor':
              options = [
                { label: 'Mis cursos', path: '/Cursos/MisCursos' },
                { label: 'Buscar cursos', path: '/Cursos/BuscarCursos' },
                { label: 'Crear curso', path: '/Cursos/CrearCurso' },
              ];
              break;
            case 'Empresa':
              options = [
                { label: 'Mis cursos', path: '/Cursos/MisCursos' },
                { label: 'Buscar cursos', path: '/Cursos/BuscarCursos' },
                // { label: 'Solicitar curso', path: '/Cursos/SolicitarCurso' },
              ];
              break;
            default:
              return null;
          }

          return showDropdown(options.length) ? (
            <div className="courses-menu" ref={coursesMenuRef}>
              <button className={`courses ${showCoursesMenu ? 'active' : ''}`} onClick={toggleCoursesMenu}>
                Cursos
              </button>
              {showCoursesMenu && (
                <div className="dropdown-courses">
                  <div className="arrow-up" />
                  {options.map((opt, index) => (
                    <button key={index} onClick={() => handleMenuClick(opt.path)}>{opt.label}</button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <button className="courses" onClick={() => handleMenuClick(options[0].path)}>
              Cursos
            </button>
          );
        })()}

        {/* Gestiones (solo Administrador) */}
        {/* Gestiones (solo Administrador) */}
        {isLoggedIn && accountType === 'Administrador' && (
          <div className="gestiones-menu" ref={gestionesMenuRef}>
            <button className={`gestiones ${showGestionesMenu ? 'active' : ''}`} onClick={toggleGestionesMenu}>
            <button className={`gestiones ${showGestionesMenu ? 'active' : ''}`} onClick={toggleGestionesMenu}>
              Gestiones
            </button>
            {showGestionesMenu && (
              <div className="dropdown-gestiones">
                <div className="arrow-up" />
                <button onClick={() => handleMenuClick('/Gestiones/Instructor')}>Gestión de Instructores</button>
                <button onClick={() => handleMenuClick('/Gestiones/Gestor')}>Gestión de Gestores</button>
              </div>
            )}
          </div>
        )}

        {/* Empresas (solo Administrador) */}
        {isLoggedIn && accountType === 'Administrador' && (
          <button className="empresas" onClick={() => navigate('/Gestiones/Empresas')}>
            Empresas
          </button>
        )}

        {/* Empleados (solo Empresa) */}
        {isLoggedIn && accountType === 'Empresa' && (
          <div className="empleados-menu" ref={empleadosMenuRef}>
            <button className={`empleados ${showEmpleadosMenu ? 'active' : ''}`} onClick={toggleEmpleadosMenu}>
              Empleados
            </button>
            {showEmpleadosMenu && (
              <div className="dropdown-empleados">
                <div className="arrow-up" />
                <button onClick={() => handleMenuClick('/Empleados/MisEmpleados')}>Mis empleados</button>
                <button onClick={() => handleMenuClick('/Empleados/CrearEmpleado')}>Crear empleados</button>
                <button onClick={() => handleMenuClick('/Empleados/CrearVariosEmpleados')}>Crear varios empleados</button>
              </div>
            )}
          </div>
        )}

        {/* Empresas (solo Administrador) */}
        {isLoggedIn && accountType === 'Administrador' && (
          <button className="empresas" onClick={() => navigate('/Gestiones/Empresas')}>
            Empresas
          </button>
        )}

        {/* Empleados (solo Empresa) */}
        {isLoggedIn && accountType === 'Empresa' && (
          <div className="empleados-menu" ref={empleadosMenuRef}>
            <button className={`empleados ${showEmpleadosMenu ? 'active' : ''}`} onClick={toggleEmpleadosMenu}>
              Empleados
            </button>
            {showEmpleadosMenu && (
              <div className="dropdown-empleados">
                <div className="arrow-up" />
                <button onClick={() => handleMenuClick('/Empleados/MisEmpleados')}>Mis empleados</button>
                <button onClick={() => handleMenuClick('/Empleados/CrearEmpleado')}>Crear empleados</button>
                <button onClick={() => handleMenuClick('/Empleados/CrearVariosEmpleados')}>Crear varios empleados</button>
              </div>
            )}
          </div>
        )}
      </NavBar>
    </div>
  );
};

