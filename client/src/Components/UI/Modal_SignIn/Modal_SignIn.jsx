import "./Modal_SignIn.css";
import React, { useState, useEffect } from "react";
import seePassword from "../../../assets/Icons/seePassword.png";
import hidePassword from "../../../assets/Icons/hidePassword.png";
import ilustration_03 from "../../../assets/Ilustrations/ilusatration_03.svg";
import companyGreen from "../../../assets/Icons/companyGreen.png";
import companyGrey from "../../../assets/Icons/companyGrey.png";
import userGreen from "../../../assets/Icons/userGreen.png";
import userGrey from "../../../assets/Icons/userGrey.png";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';
import axiosInstance from "../../../config/axiosInstance";

export const Modal_SignIn = ({ 
  showSignIn,
  setShowSignIn,
  setShowSignUp,
  setShowAccountType,
  setSelectedAccountType 
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  const navigate = useNavigate();
  
  const closeModalSignIn = () => setShowSignIn(false);

  const showModalAccountType = () => {
    setShowSignIn(false);
    setShowAccountType(true);
  };

  const handleAccountTypeSelection = (accountType) => {
    setSelectedAccountType(accountType);
    setShowSignUp(true);
    setShowSignIn(false);
    setShowAccountType(false);
  };

  const login = (event) => {
    event.preventDefault();

    axiosInstance.post("/login", {
      email,
      password,
      email,
      password,
    })
      .then((response) => {
        alert(response.data.message);
        sessionStorage.setItem("userSession", JSON.stringify({
          accountType: response.data.accountType,
          email: email,
          id: response.data.id
        }));

        closeModalSignIn();
        navigate("/", {
          state: { accountType: response.data.accountType },
        });
      })
      .catch((error) => {
        if (error.response && error.response.status === 400) {
          alert("Usuario o contraseña incorrectos");
        } else if (error.response && error.response.status === 403) {
          alert("Por favor verifica tu correo antes de iniciar sesión");
        } else {
          alert("Ocurrió un error al iniciar sesión");
        }
      });
  };

  const handleGoogleResponse = async (response) => {
    const idToken = response.credential;


    try {
      const res = await fetch("http://localhost:3001/auth/googleSignIn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();
      const data = await res.json();

      if (res.ok && data.success) {
      if (res.ok && data.success) {
        console.log("Respuesta del backend Google", data);
        const accountType = data.user.accountType;

        sessionStorage.setItem("userSession", JSON.stringify({
          googleId: data.user.googleId,
          accountType: accountType,
          accountType: accountType,
          email: data.user.email,
        }));
        closeModalSignIn();
        navigate('/', { state: { accountType } });
      } else if (data.message === "Correo no registrado") {
        alert("El correo no está registrado. Por favor, regístrese primero.");
      } else {
        console.error('Error en el inicio de sesión con Google (backend):', data.message);
        alert(data.message || 'Error en el inicio de sesión con Google');
        alert(data.message || 'Error en el inicio de sesión con Google');
      }
    } catch (error) {
      console.error('Error de red al enviar el token de Google:', error);
      alert('Error de red al intentar iniciar sesión.');
      alert('Error de red al intentar iniciar sesión.');
    }
  };

  if (!showSignIn) return null;

  return (
    <div id="container_signIn">
      <div className="modalSignIn">
        <div className="option_signUp">
          <div className="logo">Logo</div>
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
            <NavLink to={"/forgotPassword"} className={"forgetPassword"}>
              ¿Olvidó su contraseña?
            </NavLink>
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