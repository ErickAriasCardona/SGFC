import React, { useState, useRef, useEffect } from 'react';
import './NavBar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import settings from '../../../assets/Icons/settings.png';
import notifications from '../../../assets/Icons/notifications.png';
import profile from '../../../assets/Icons/userGrey.png';
import logout from '../../../assets/Icons/cerrar-sesion.png';
import axiosInstance from '../../../config/axiosInstance';
import noRead from '../../../assets/Icons/mensaje-no-leido.png';
import ifRead from '../../../assets/Icons/mensaje-leido.png';

// Importamos el hook del contexto de los modales
import { useModal } from '../../../Context/ModalContext';

export const NavBar = ({ children }) => {
  const navigate = useNavigate();

  // Obtenemos las funciones del contexto
  const { setShowSignIn } = useModal();

  // Obtenemos sesión del usuario
  const userSession =
    JSON.parse(localStorage.getItem('userSession')) ||
    JSON.parse(sessionStorage.getItem('userSession'));

  const isLoggedIn = !!userSession;

  const handleProfileClick = () => {
    console.log('ID del usuario logueado:', userSession?.id);
    if (userSession?.id) {
      navigate('/MiPerfil', { state: { userId: userSession.id } });
    }
  };

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/logout", {}, { withCredentials: true });
      localStorage.removeItem("userSession");
      sessionStorage.removeItem("userSession");
      navigate("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      alert("Hubo un problema al cerrar sesión.");
    }
  };

  // Función para abrir el modal de inicio de sesión
  const handleSignIn = () => {
    setShowSignIn(true);
  };

  // Estado y referencia para el menú de notificaciones
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const notificationsMenuRef = useRef(null);

  // Cerrar el menú si se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  return (
    <div className="navBar">
      <div className="logo">SGFC</div>

      <div className="container_options">{children}</div>

      {!isLoggedIn && (
        <button className="button_signIn" onClick={handleSignIn}>
          Iniciar sesión
        </button>
      )}

      {isLoggedIn && (
        <div className="container_options_profile">
          <button >
            <img src={settings} alt="Configuración" />
          </button>

          <div className="notifications-menu" ref={notificationsMenuRef}>
            <button className='btn-notifications' onClick={() => setShowNotificationsMenu((prev) => !prev)}>
              <img className='img_notifications' src={notifications} alt="Notificaciones" />
            </button>
            {showNotificationsMenu && (
              <div className="dropdown-notifications">
                <div className="arrow-up" />

                <div className="notification-item">
                  <div className='container-img-notifications'>
                    <img src={noRead} alt="" />
                  </div>
                  <div className='container-text-notifications'>
                    <p className="notification-sender">Remitente</p>
                    <span className="notification-affair">Asunto de la notificación</span>
                  </div>

                </div>

                <div className="notification-item">
                  <div className='container-img-notifications'>
                    <img src={ifRead} alt="" />
                  </div>
                  <div className='container-text-notifications'>
                    <p className="notification-sender">Remitente</p>
                    <span className="notification-affair">Asunto de la notificación</span>
                  </div>

                </div>


              </div>
            )}
          </div>

          <button id='btn_profile' onClick={handleProfileClick}>
            <img src={profile} alt="Perfil" />
          </button>

          <button onClick={handleLogout}>
            <img src={logout} alt="Cerrar sesión" />
          </button>
        </div>
      )}
    </div>
  );
};
