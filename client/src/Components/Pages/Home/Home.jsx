import React from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Importar useNavigate para redirigir
import "./Home.css";
import { Modal_SignUp } from "../../UI/Modal_SignUp/Modal_SignUp";

export const Home = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook para redirigir al usuario
  const accountType = location.state?.accountType || "Desconocido"; // Obtén el tipo de cuenta
  const accountTypeInstructor = "Instructor"; // Define el tipo de cuenta del instructor
  const handleLogout = () => {
    // Eliminar la información de la sesión del usuario
    localStorage.removeItem("userSession"); // Si usas localStorage
    sessionStorage.removeItem("userSession"); // Si usas sessionStorage

    // Redirigir al usuario a la página de inicio de sesión
    navigate("/");
  };

  const showModalSignUp = () => {
    const modalGeneral = document.getElementById("container_signUp");
    if (modalGeneral) {

      modalGeneral.style.display = "flex"; // Cambia el display a flex para mostrar el modal
    }
  };

  return (
    <div>
      Bienvenido a tu cuenta de formación complementaria de tipo: <strong>{accountType}</strong>
      <button className="close_session" onClick={handleLogout}>
        Cerrar sesión
      </button>
      {/* Mostrar el botón solo si el usuario es Administrador */}
      <button
        className="createInstructor"
        style={{ display: accountType === "Administrador" ? "block" : "none" }}
        onClick={showModalSignUp}
      >
        Crear Instructor
      </button>

      <Modal_SignUp accountType={accountTypeInstructor} />

    </div>
  );
};