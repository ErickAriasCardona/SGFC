import React, { useState, useEffect } from "react";
import "./Modal_SignUp.css";
import ilustration_02 from "../../../assets/Ilustrations/SignUp.svg";
import seePassword from "../../../assets/Icons/seePassword.png";
import hidePassword from "../../../assets/Icons/hidePassword.png";
import { Modal_Successful } from "../Modal_Successful/Modal_Successful";
import axiosInstance from "../../../config/axiosInstance";
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from "react-router-dom";

export const Modal_SignUp = ({ 
  accountType, 
  setShowSignUp,
  setShowSignIn,
  setShowAccountType 
}) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 🔄 Limpia los campos cada vez que se seleccione un nuevo tipo de cuenta
  useEffect(() => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  }, [accountType]);

  // Actualiza los requisitos de la contraseña en tiempo real
  useEffect(() => {
    setPasswordRequirements({
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[@$!%*?&]/.test(password)
    });
  }, [password]);

  const registerUser = async (event) => {
    event.preventDefault();

    // Validar que todos los requisitos de la contraseña se cumplan
    if (
      !passwordRequirements.length ||
      !passwordRequirements.uppercase ||
      !passwordRequirements.number ||
      !passwordRequirements.specialChar
    ) {
      alert(
        "La contraseña debe cumplir con todos los requisitos: al menos 8 caracteres, una letra mayúscula, un número y un carácter especial."
      );
      return;
    }

    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      setPassword("");
      setConfirmPassword("");
      return;
    }

    // Enviar datos al backend
    try {
      const response = await axiosInstance.post("/createUser", {
        email,
        password,
        accountType,
      });

      setShowSignUp(false);
      setShowAccountType(false);
      setShowSuccessModal(true);

      setTimeout(() => {
        setShowSuccessModal(false);
        navigate('/', { state: { accountType } });
      }, 3000);

    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.message || "Ocurrió un error al registrar el usuario");
      } else {
        alert("Error al conectar con el servidor");
      }
    }
  };

  const closeModalSignUp = () => {
    console.log('Closing SignUp Modal'); // Para debugging
    if (typeof setShowSignUp === 'function') {
      setShowSignUp(false);
      if (typeof setShowAccountType === 'function') {
        setShowAccountType(true);
      }
    } else {
      console.error('setShowSignUp is not a function:', setShowSignUp);
    }
  };

  const showModalSignIn = () => {
    if (typeof setShowSignUp === 'function' && typeof setShowSignIn === 'function') {
      setShowSignUp(false);
      setShowAccountType(false);
      setShowSignIn(true);
    }
  };

  const handleGoogleResponse = async (response) => {
    const idToken = response.credential;

    try {
      const res = await fetch("https://sgfc-production.up.railway.app/auth/googleSignUp", { // Cambia la ruta a googleSignUp
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }), // Asegúrate de enviar el idToken
      });

      const data = await res.json();

      if (res.ok && data.success) {
        // Guardar información del usuario en sessionStorage
        sessionStorage.setItem("userSession", JSON.stringify({
          googleId: data.user.googleId,
          accountType: data.user.accountType,
          email: data.user.email,
        }));

        // Mostrar el Modal_Successful
        const modalSuccefull = document.getElementById("container_modalSucessfull");
        const modalSignUp = document.getElementById("container_signUp");

        if (modalSuccefull && modalSignUp) {
          modalSignUp.style.display = "none";

          modalSuccefull.style.display = "flex";

          // Usar navigate en lugar de window.location.reload
          setTimeout(() => {
            modalSuccefull.style.display = "none";
            navigate('/', { state: { accountType: data.user.accountType } });
          }, 3000);
        }
      } else if (data.message === "El correo ya está registrado") { // Verifica si el correo ya está registrado
        alert("El correo ya está registrado. Por favor, inicie sesión.");
      } else {
        console.error('Error en el registro con Google (backend):', data.message);
        alert(data.message || 'Error en el registro con Google');
      }
    } catch (error) {
      console.error('Error de red al enviar el token de Google:', error);
      alert('Error al conectar con el servidor');
    }
  };

  return (
    <>
      {showSuccessModal && (
        <Modal_Successful closeModal={() => setShowSuccessModal(false)}>
          <h2>Registro exitoso</h2>
          <p>"Hemos enviado un enlace de verificación a tu correo. Haz click en él para activar tu cuenta"</p>
        </Modal_Successful>
      )}

      <div id="container_signUp" style={{ display: 'flex' }}>
        <div className="modalSignUp">
          <div className="container_form_register">
            <div className="container_triangles_01_register">
              <div className="triangle_01"></div>
              <div className="triangle_02"></div>
              <div className="triangle_03"></div>
            </div>

            <div className="content_createAccount">
              <h2>
                Crear<span className="title2_register"> Cuenta</span>
              </h2>
              <p className="accountType">{accountType}</p>{" "}
              {/* Muestra el tipo de cuenta */}
              <form className="form_register">
                <input
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  type="email"
                  placeholder="Correo electrónico"
                />
                <div className="password-container">
                  <input
                    value={password}
                    onChange={event => setPassword(event.target.value)}
                    type={showPassword ? "text" : "password"} // Alternar entre "text" y "password"                  placeholder="Contraseña"
                    placeholder="Contraseña"
                    onFocus={() => setIsPasswordFocused(true)} // Activa el estado al enfocar
                    onBlur={() => setIsPasswordFocused(false)} // Desactiva el estado al desenfocar
                  />
                  <img
                    src={showPassword ? seePassword : hidePassword} // Cambia el icono
                    alt="Toggle Password"
                    className="password-icon"
                    onClick={() => setShowPassword(!showPassword)} // Alterna la visibilidad
                  />
                </div>
                <div className="confirmPassword-container">
                  <input
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    type={showConfirmPassword ? "text" : "password"} // Alternar entre "text" y "password"                  placeholder="Contraseña"
                    placeholder="Confirmar Contraseña"
                  />
                  <img
                    src={showConfirmPassword ? seePassword : hidePassword} // Cambia el icono
                    alt="Toggle Password"
                    className="password-icon"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)} // Alterna la visibilidad
                  />
                </div>
                {/* Muestra los requisitos solo si el input está activo */}
                {isPasswordFocused && (
                  <ul className="password-requirements">
                    <li
                      className={
                        passwordRequirements.length ? "valid" : "invalid"
                      }
                    >
                      Al menos 8 caracteres
                    </li>
                    <li
                      className={
                        passwordRequirements.uppercase ? "valid" : "invalid"
                      }
                    >
                      Al menos una letra mayúscula
                    </li>
                    <li
                      className={
                        passwordRequirements.number ? "valid" : "invalid"
                      }
                    >
                      Al menos un número
                    </li>
                    <li
                      className={
                        passwordRequirements.specialChar ? "valid" : "invalid"
                      }
                    >
                      Al menos un carácter especial (@$!%*?&)
                    </li>
                  </ul>
                )}

                <button className="button_register" onClick={registerUser}>
                  Registrarse
                </button>
                <p className="otherOption">o</p>
                <div className="google-login-container">
                  <GoogleLogin
                    onSuccess={handleGoogleResponse}
                    onError={() => alert('Error al registrarse con Google')}
                    theme="filled_black"
                    size="large"
                    text="signup_with"
                    shape="rectangular"
                    width="270"
                    locale="es"
                  />
                </div>
              </form>
            </div>

            <div className="container_triangles_02_register">
              <div className="triangle_01"></div>
              <div className="triangle_02"></div>
              <div className="triangle_03"></div>
            </div>
          </div>

          <div className="option_signIn">
            <div className="logo">Logo</div>
            <h3>Lorem Ipsum es simplemente el texto</h3>
            <p>Lorem Ipsum es simplemente</p>
            <button className="goTo_SignIn" onClick={showModalSignIn}>
              Iniciar sesión
            </button>
            <img src={ilustration_02} alt="" />
          </div>

          <div className="container_return_signUp">
            <h5 onClick={closeModalSignUp} style={{ cursor: "pointer" }}>Volver</h5>
            <button onClick={closeModalSignUp} className="closeModal"></button>
          </div>
        </div>
      </div>
    </>
  );
};