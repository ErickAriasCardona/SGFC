import React, { useState, useEffect } from "react";
import Axios from "axios";
import "./Modal_SignUp.css";
import ilustration_02 from "../../../assets/Ilustrations/SignUp.svg";
import seePassword from "../../../assets/Icons/seePassword.png";
import hidePassword from "../../../assets/Icons/hidePassword.png";
import iconGoogle from "../../../assets/Icons/google.png";
import { Modal_Successful } from "../Modal_Successful/Modal_Successful";
import axiosInstance from "../../../config/axiosInstance";

export const Modal_SignUp = ({ accountType }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordFocused, setIsPasswordFocused] = useState(false); // Estado para rastrear si el input está activo
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    number: false,
    specialChar: false
  });
  const [showPassword, setShowPassword] = useState(false); // Estado para controlar la visibilidad
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Estado para controlar la visibilidad

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
        accountType, // Tipo de cuenta seleccionado
      });
  
      // Mostrar el Modal_Successful cambiando su estilo a display: flex
      const modalSuccefull = document.getElementById("container_modalSucessfull");
      if (modalSuccefull) {
        document.getElementById("container_signUp").style.display = "none"; // Cierra el Modal_SignUp
  
        modalSuccefull.style.display = "flex"; // Cambia el display a flex para mostrar el modal
  
        // Cerrar el Modal_Successful automáticamente después de 5 segundos y recargar la página
        setTimeout(() => {
          modalSuccefull.style.display = "none";
          window.location.reload(); // Recargar la página
          
        }, 3000);
      }
    } catch (error) {
      if (error.response && error.response.data) {
        alert(error.response.data.message || "Ocurrió un error al registrar el usuario");
      } else {
        alert("Error al conectar con el servidor");
      }
    }
  };

  const closeModalSignUp = () => {
    document.getElementById("container_signUp").style.display = "none";
    document.getElementById("container_modalGeneral").style.display = "flex"; // abre el Modal_AccountType
  };

  const showModalSignIn = () => {
    document.getElementById("container_AccountType").style.display = "none";
    document.getElementById("container_signUp").style.display = "none";
    document.getElementById("container_signIn").style.display = "flex";
  };

  return (
    <>

      {/* Modal General para mostrar el mensaje de éxito */}
      <Modal_Successful closeModal={() => (document.getElementById("container_modalSucessfull").style.display = "none")}>
      <h2>Registro exitoso</h2>
      <p>"Hemos enviado un enlace de verificación a tu correo. Haz click en él para activar tu cuenta"</p>
      </Modal_Successful>

      <div id="container_signUp">
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
                <button className="button_registerGoogle">
                  <img src={iconGoogle} alt="" /> Continuar con Google
                </button>
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
            <h3>Lorem Ipsum es simplemente el texto</h3>
            <p>Lorem Ipsum es simplemente</p>
            <button className="goTo_SignIn" onClick={showModalSignIn}>
              Iniciar sesión
            </button>
            <img src={ilustration_02} alt="" />
          </div>

          <div className="container_return_signUp">
            <h5>Volver</h5>
            <button onClick={closeModalSignUp} className="closeModal"></button>
          </div>
        </div>
      </div>
    </>

  );
};
