import React, { useState, useRef, useEffect } from 'react';
import './NavBar.css';
import { useNavigate } from 'react-router-dom';
import settings from '../../../assets/Icons/settings.png';
import notifications from '../../../assets/Icons/notifications.png';
import profile from '../../../assets/Icons/userGrey.png';
import logout from '../../../assets/Icons/cerrar-sesion.png';
import axiosInstance from '../../../config/axiosInstance';
import noRead from '../../../assets/Icons/mensaje-no-leido.png';
import ifRead from '../../../assets/Icons/mensaje-leido.png';
import { useModal } from '../../../Context/ModalContext';

export const NavBar = ({ children }) => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { setShowSignIn } = useModal();
  const [notificationsList, setNotificationsList] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const userSession =
    JSON.parse(localStorage.getItem('userSession')) ||
    JSON.parse(sessionStorage.getItem('userSession'));

  const isLoggedIn = !!userSession;

  const handleProfileClick = () => {
    if (userSession?.id) {
      navigate('/MiPerfil', { state: { userId: userSession.id } });
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/api/users/logout", {}, {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        localStorage.removeItem("userSession");
        sessionStorage.removeItem("userSession");
        navigate("/");
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      // Si hay un error, aún así intentamos limpiar la sesión local
      localStorage.removeItem("userSession");
      sessionStorage.removeItem("userSession");
      navigate("/");
    }
  };

  const handleSignIn = () => {
    setShowSignIn(true);
  };

  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const notificationsMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsMenuRef.current && !notificationsMenuRef.current.contains(event.target)) {
        setShowNotificationsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    if (!isLoggedIn) return;
    if (!showNotificationsMenu) return;

    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const res = await axiosInstance.get('/api/notifications?limit=5');
        setNotificationsList(res.data.notifications || []);
      } catch (err) {
        setNotificationsList([]);
      }
      setLoadingNotifications(false);
    };

    fetchNotifications();
  }, [showNotificationsMenu, isLoggedIn]);

  const { setShowModalGeneral, setModalGeneralContent } = useModal();

  const handleNotificationClick = (notif) => {
    setModalGeneralContent(
      <div className='notification-modal'>
        <h2>{notif.titulo}</h2>
        <p><b>De:</b> {notif.remitente?.nombres ? `${notif.remitente.nombres} ${notif.remitente.apellidos}` : 'SGFC'}</p>
        <p><b>Mensaje:</b></p>
        <div className='notification-message' dangerouslySetInnerHTML={{ __html: notif.mensaje }} />
        {notif.archivo && (
          <div className='notification-attachment'>
            <a
              href={`http://localhost:3001/uploads/solicitudes/${notif.archivo}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#007bff', textDecoration: 'underline' }}
            >
              Ver PDF adjunto
            </a>
          </div>
        )}
      </div>
    );
    setShowModalGeneral(true);
  };

  return (
    <div className="navBar">
      <div className="logo">SGFC</div>

      <button className="hamburger-btn" onClick={() => setIsMobileMenuOpen(prev => !prev)}>
        ☰
      </button>

      {/* Contenido móvil */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : 'closed'}`}>
        <div className="container_options">
          {children}
        </div>

        {!isLoggedIn && (
          <button className="button_signIn" onClick={handleSignIn}>
            Iniciar sesión
          </button>
        )}

        {isLoggedIn && (
          <div className="container_options_profile">
            <button className="mobile-profile-btn">
              <span className="mobile-label">Configuración</span>
              <img className="desktop-icon" src={settings} alt="Configuración" />
            </button>

            <button className="mobile-profile-btn" onClick={() => setShowNotificationsMenu((prev) => !prev)}>
              <span className="mobile-label">Notificaciones</span>
              <img className="desktop-icon" src={notifications} alt="Notificaciones" />
            </button>

            <button className="mobile-profile-btn" id='btn_profile' onClick={handleProfileClick}>
              <span className="mobile-label">Perfil</span>
              <img className="desktop-icon" src={profile} alt="Perfil" />
            </button>

            <button className="mobile-profile-btn" onClick={handleLogout}>
              <span className="mobile-label">Cerrar sesión</span>
              <img className="desktop-icon" src={logout} alt="Cerrar sesión" />
            </button>
          </div>
        )}
      </div>

      {/* Contenido escritorio */}
      <div className="desktop-options">
        <div className="container_options">
          {children}
        </div>

        {!isLoggedIn && (
          <button className="button_signIn" onClick={handleSignIn}>
            Iniciar sesión
          </button>
        )}

        {isLoggedIn && (
          <div className="container_options_profile">
            <button>
              <img src={settings} alt="Configuración" />
            </button>

            <div className="notifications-menu" ref={notificationsMenuRef}>
              <button
                className='btn-notifications'
                onClick={() => setShowNotificationsMenu((prev) => !prev)}
              >
                <img className='img_notifications' src={notifications} alt="Notificaciones" />
              </button>
              {showNotificationsMenu && (
                <div className="dropdown-notifications">
                  <div className="arrow-up" />
                  {loadingNotifications ? (
                    <div className="notification-item">Cargando...</div>
                  ) : notificationsList.length === 0 ? (
                    <div className="notification-item">Sin notificaciones</div>
                  ) : (
                    notificationsList.map((notif) => (
                      <div
                        className="notification-item"
                        key={notif.ID}
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleNotificationClick(notif)}
                      >
                        <div className='container-img-notifications'>
                          <img src={notif.estado === 'sin_leer' ? noRead : ifRead} alt="" />
                        </div>
                        <div className='container-text-notifications'>
                          <p className="notification-sender">
                            {notif.remitente?.nombres
                              ? `${notif.remitente.nombres} ${notif.remitente.apellidos}`
                              : 'SGFC'}
                          </p>
                          <span className="notification-affair">{notif.titulo}</span>
                        </div>
                      </div>
                    ))
                  )}
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
    </div>
  );
};