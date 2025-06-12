import "./Modal_SignIn.css";
import React, { useState } from "react";
import seePassword from "../../../assets/Icons/seePassword.png";
import hidePassword from "../../../assets/Icons/hidePassword.png";
import ilustration_03 from "../../../assets/Ilustrations/ilusatration_03.svg";
import companyGreen from "../../../assets/Icons/companyGreen.png";
import companyGrey from "../../../assets/Icons/companyGrey.png";
import userGreen from "../../../assets/Icons/userGreen.png";
import userGrey from "../../../assets/Icons/userGrey.png";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import { useModal } from "../../../Context/ModalContext";
import { ForgotPassword } from "../../Pages/ForgotPassword/ForgotPassword";
export const Modal_SignIn = () => {
  const {
    showSignIn,
    setShowSignIn,
    setShowSignUp,
    setShowModalGeneral,
    setModalGeneralContent,
    setSelectedAccountType,
  } = useModal();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  const [hoveredButton, setHoveredButton] = useState("");
  const navigate = useNavigate();

  const closeModalSignIn = () => setShowSignIn(false);

  const handleShowSignUp = (accountType) => {
    setSelectedAccountType(accountType);
    setShowSignUp(true);
    setShowModalGeneral(false);
    setShowSignIn(false);
    setHoveredButton("");
  };

  const showModalAccountType = () => {
    setShowSignIn(false);
    setShowModalGeneral(true);
    setModalGeneralContent(
      <>
        <p>Por favor seleccione el tipo de cuenta que desea crear</p>

        <div className="option_1Account">
          <p>Empresa</p>
          <button
            className={`container_AccountTypeEmpresa ${hoveredButton === "Empresa" ? "hovered" : ""}`}
            onClick={() => handleShowSignUp("Empresa")}
            onMouseEnter={() => setHoveredButton("Empresa")}
            onMouseLeave={() => setHoveredButton("")}
          >
            <img
              key={hoveredButton === "Empresa" ? "companyGrey" : "companyGreen"}
              src={hoveredButton === "Empresa" ? companyGrey : companyGreen}
              alt="Empresa"
            />

          </button>
        </div>

        <div className="option_2Account">
          <p>Aprendiz</p>
          <button
            className={`container_AccountTypeAprendiz ${hoveredButton === "Aprendiz" ? "hovered" : ""}`}
            onClick={() => handleShowSignUp("Aprendiz")}
            onMouseEnter={() => setHoveredButton("Aprendiz")}
            onMouseLeave={() => setHoveredButton("")}
          >
            <img
              src={hoveredButton === "Aprendiz" ? userGrey : userGreen}
              alt="Aprendiz"
            />
          </button>
        </div>
      </>
    );
  };

  const showModalForgotPassword = () => {
    setShowSignIn(false);
    setShowModalGeneral(true);
    setModalGeneralContent(<ForgotPassword />);
  };

  const login = (event) => {
    event.preventDefault();

    fetch("http://localhost:3001/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (!data.token) throw new Error("No se recibió el token de autenticación");

        const sessionData = {
          accountType: data.accountType,
          email: data.email,
          id: data.id,
          token: data.token,
        };

        if (rememberSession) {
          localStorage.setItem("userSession", JSON.stringify(sessionData));
        } else {
          sessionStorage.setItem("userSession", JSON.stringify(sessionData));
        }

        alert(data.message || "Inicio de sesión exitoso");
        closeModalSignIn();
        navigate("/", { state: { accountType: data.accountType } });
      })
      .catch((error) => {
        if (error.message === "No se recibió el token de autenticación") {
          alert("Error en la autenticación: No se recibió el token");
        } else {
          alert("Ocurrió un error al iniciar sesión");
        }
      });
  };

  const handleGoogleResponse = async (response) => {
    const idToken = response.credential;

    try {
      const res = await fetch("http://localhost:3001/api/users/auth/googleSignIn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        sessionStorage.setItem("userSession", JSON.stringify({
          googleId: data.user.googleId,
          accountType: data.user.accountType,
          email: data.user.email,
        }));
        closeModalSignIn();
        navigate('/', { state: { accountType: data.user.accountType } });
      } else {
        alert(data.message || 'Error en el inicio de sesión con Google');
      }
    } catch (error) {
      alert('Error de red al intentar iniciar sesión.');
    }
  };

  if (!showSignIn) return null;

  return (
    <div id="container_signIn">
      <div className="modalSignIn">
        <div className="option_signUp">
          <div className="logo">SGFC</div>
          <h3>Lorem Ipsum es simplemente el texto</h3>
          <p>Lorem Ipsum es simplemente</p>
          <button className="goTo_register" onClick={showModalAccountType}>
            Registrarse
          </button>
          <img src={ilustration_03} alt="" />
        </div>

        <div className="container_form_signIn">
          <div className="container_triangles_01_login">
            <div className="triangle_01"></div>
            <div className="triangle_02"></div>
            <div className="triangle_03"></div>
          </div>

          <div className="content_createAccount">
            <h2 className="title_signIn">
              Iniciar<span className="title2_signIn"> Sesión</span>
            </h2>
            <form className="form_register">
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="Correo electrónico"
              />
              <div className="password-container">
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type={showPassword ? "text" : "password"}
                  placeholder="Contraseña"
                />
                <img
                  src={showPassword ? seePassword : hidePassword}
                  alt="Toggle Password"
                  className="password-icon"
                  onClick={() => setShowPassword(!showPassword)}
                />
              </div>

              <div className="remember-session">
                <input
                  type="checkbox"
                  id="rememberSession"
                  checked={rememberSession}
                  onChange={(event) => setRememberSession(event.target.checked)}
                />
                <label htmlFor="rememberSession">Recordar sesión</label>
              </div>

              <button className="button_register" onClick={login}>
                Iniciar sesión
              </button>
              <p className="otherOption">o</p>
              <div className="google-login-container">
                <GoogleLogin
                  onSuccess={handleGoogleResponse}
                  onError={() => alert('Error al iniciar sesión con Google')}
                  theme="filled_black"
                  size="large"
                  text="signin_with"
                  shape="rectangular"
                  width="270"
                  locale="es"
                />
              </div>
            </form>
            <button
              type="button"
              className="forgetPassword"
              style={{ background: "none", border: "none", color: "#00843e", cursor: "pointer", padding: 0 }}
              onClick={showModalForgotPassword}
            >
              ¿Olvidó su contraseña?
            </button>
          </div>

          <div className="container_triangles_02_login">
            <div className="triangle_01"></div>
            <div className="triangle_02"></div>
            <div className="triangle_03"></div>
          </div>
        </div>

        <div className="container_return_signIn">
          <h5 onClick={closeModalSignIn} style={{ cursor: "pointer" }}>Volver</h5>
          <button onClick={closeModalSignIn} className="closeModal"></button>
        </div>
      </div>
    </div>
  );
};
