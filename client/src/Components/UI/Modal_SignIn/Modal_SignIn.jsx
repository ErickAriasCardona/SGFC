import "./Modal_SignIn.css";
import React, { useState, useEffect } from "react";

import seePassword from "../../../assets/Icons/seePassword.png";
import hidePassword from "../../../assets/Icons/hidePassword.png";
import ilustration_03 from "../../../assets/Ilustrations/ilusatration_03.svg";
import iconGoogle from "../../../assets/Icons/google.png";
import companyGreen from "../../../assets/Icons/companyGreen.png";
import companyGrey from "../../../assets/Icons/companyGrey.png";
import userGreen from "../../../assets/Icons/userGreen.png";
import userGrey from "../../../assets/Icons/userGrey.png";
import { Modal_General } from "../Modal_General/Modal_General";
import { Modal_SignUp } from "../Modal_SignUp/Modal_SignUp";
import { NavLink, useNavigate } from "react-router-dom";
import { GoogleLogin } from '@react-oauth/google';

import axiosInstance from "../../../config/axiosInstance";

export const Modal_SignIn = ({ showSignIn,
  setShowSignIn,
  setShowSignUp,
  setShowAccountType, }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  const [hoveredButton, setHoveredButton] = useState("");
  const [selectedAccountType, setSelectedAccountType] = useState(""); // Estado para guardar el tipo de cuenta seleccionado
  const navigate = useNavigate();
  const closeModalSignIn = () => setShowSignIn(false);


  const showModalAccountType = () => {
    const modalGeneral = document.getElementById("container_modalGeneral");
    if (modalGeneral) {
      document.getElementById("container_signIn").style.display = "none";

      modalGeneral.style.display = "flex"; // Cambia el display a flex para mostrar el modal
    }
  };

  const handleAccountTypeSelection = (accountType) => {
    setSelectedAccountType(accountType); // Guarda el tipo de cuenta seleccionado
    document.getElementById("container_signUp").style.display = "flex";
  };

  const login = (event) => {
    event.preventDefault();

    axiosInstance.post("/login", {
      email,
      password,
    })
      .then((response) => {
        alert(response.data.message);

        // Guardar información del usuario en sessionStorage
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
      const response = await fetch("http://localhost:3001/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log("Respuesta del backend Google", data);
        const accountType = data.accountType;

        // Guardar información del usuario en sessionStorage
        sessionStorage.setItem("userSession", JSON.stringify({
          googleId: data.user.googleId,
          accountType: data.user.accountType,
          email: data.user.email,
        }));
        closeModalSignIn();
        // Redirige al Home con el tipo de cuenta
        navigate('/', { state: { accountType } });
      } else {
        console.error('Error en el inicio de sesión con Google (backend):', data.message);

      }
    } catch (error) {
      console.error('Error de red al enviar el token de Google:', error);
    }
  };

  return (
    <>
      {/* Modal General para seleccionar el tipo de cuenta */}
      <Modal_General closeModal={() => (document.getElementById("container_modalGeneral").style.display = "none")}>
        <p>Por favor seleccione el tipo de cuenta que desea crear</p>

        <div className="option_1Account">
          <p>Empresa</p>
          <button
            className="container_AccountTypeEmpresa"
            onClick={() => handleAccountTypeSelection("Empresa")}
            onMouseEnter={() => setHoveredButton("Empresa")}
            onMouseLeave={() => setHoveredButton("")}
          >
            <img
              src={hoveredButton === "Empresa" ? companyGrey : companyGreen}
              alt="Empresa"
            />
          </button>
        </div>

        <div className="option_2Account">
          <p>Aprendiz</p>
          <button
            className="container_AccountTypeAprendiz"
            onClick={() => handleAccountTypeSelection("Aprendiz")}
            onMouseEnter={() => setHoveredButton("Aprendiz")}
            onMouseLeave={() => setHoveredButton("")}
          >
            <img
              src={hoveredButton === "Aprendiz" ? userGrey : userGreen}
              alt="Aprendiz"
            />
          </button>
        </div>
      </Modal_General>

      {/* Modal SignUp para el registro */}
      <Modal_SignUp
        accountType={selectedAccountType}
        setShowSignUp={setShowSignUp}
        setShowSignIn={setShowSignIn}
        setShowAccountType={setShowAccountType}
      />
      {showSignIn && (
        <div id="container_signIn">
          <div className="modalSignIn">
            <div className="option_signUp">
              <div className="logo">Logo</div>
              <h3>Lorem Ipsum es simplemente el texto</h3>
              <p>Lorem Ipsum es simplemente</p>
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
      )}
    </>
  );
};