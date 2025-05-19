import React from 'react';
import './NavBar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import settings from '../../../assets/Icons/settings.png';
import notifications from '../../../assets/Icons/notifications.png';
import profile from '../../../assets/Icons/userGrey.png';
import logout from '../../../assets/Icons/cerrar-sesion.png'
import axiosInstance from '../../../config/axiosInstance'


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
  //cerrar sesion
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout", {}, { withCredentials: true });

      // Eliminar también cualquier información en localStorage o sessionStorage
      localStorage.removeItem("userSession");
      sessionStorage.removeItem("userSession");

      // Redirigir al usuario
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión.");
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

          <button id='btn_profile' onClick={handleProfileClick}>
            <img src={profile} alt="Perfil" />
          </button>

          <button onClick={handleLogout}>
            <img src={logout} alt="" />
          </button>

        </div>
      )}
    </div>
  );
};