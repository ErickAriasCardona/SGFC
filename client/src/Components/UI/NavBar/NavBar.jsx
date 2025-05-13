import React from 'react';
import './NavBar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import settings from '../../../assets/Icons/settings.png';
import notifications from '../../../assets/Icons/notifications.png';
import profile from '../../../assets/Icons/userGrey.png';

export const NavBar = ({ children }) => {
  const navigate = useNavigate();

  // Obtener la sesión del usuario desde localStorage o sessionStorage
  const userSession =
    JSON.parse(localStorage.getItem('userSession')) ||
    JSON.parse(sessionStorage.getItem('userSession'));

  const isLoggedIn = !!userSession; // Verificar si el usuario está logueado

  // Función para mostrar el modal de inicio de sesión
  const showModalSignIn = () => {
    document.getElementById('container_signIn').style.display = 'flex';
  };

    // ✅ Manejador para el click en perfil
    const handleProfileClick = () => {
      console.log('ID del usuario logueado:', userSession?.id);
      if (userSession?.id) {
        navigate('/MiPerfil', { state: { userId: userSession.id } });
      }
    };

  return (
    <div className="navBar">
      <div className="logo">Logo</div>
      {/* <img className='logo' src="" alt="Logo"/> */}

      <div className="container_options">{children}</div>

      {/* Mostrar el botón de "Iniciar sesión" solo si el usuario no está logueado */}
      {!isLoggedIn && (
        <button className="button_signIn" onClick={showModalSignIn}>
          Iniciar sesión
        </button>
      )}

      {/* Mostrar el contenedor de opciones de perfil solo si el usuario está logueado */}
      {isLoggedIn && (
        <div className="container_options_profile">
          <button>
            <img src={settings} alt="Configuración" />
          </button>

          <button>
            <img src={notifications} alt="Notificaciones" />
          </button>

          {/* ✅ Reemplazar NavLink por botón personalizado */}
          <button onClick={handleProfileClick}>
            <img src={profile} alt="Perfil" />
          </button>

        </div>
      )}
    </div>
  );
};