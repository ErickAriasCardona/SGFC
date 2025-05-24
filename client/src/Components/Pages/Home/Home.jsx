import React from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Importar useNavigate para redirigir
import "./Home.css";
import { Modal_SignUp } from "../../UI/Modal_SignUp/Modal_SignUp";

export const Home = ({ handleShowSignUp }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook para redirigir al usuario
  const accountType = location.state?.accountType || "Desconocido"; // Obtén el tipo de cuenta
  const accountTypeInstructor = "Instructor"; // Define el tipo de cuenta del instructor
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAccountType, setShowAccountType] = useState(false);

  const handleLogout = () => {
    // Eliminar la información de la sesión del usuario
    localStorage.removeItem("userSession"); // Si usas localStorage
    sessionStorage.removeItem("userSession"); // Si usas sessionStorage

    // Redirigir al usuario a la página de inicio de sesión
    navigate("/");
  };

  const showModalSignUp = () => {
    setShowSignUp(true);
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
        onClick={() => handleShowSignUp(accountTypeInstructor)}
      >
        Crear Instructor
      </button>

      {showSignUp && (
        <Modal_SignUp 
          accountType={accountTypeInstructor}
          setShowSignUp={setShowSignUp}
          setShowAccountType={setShowAccountType}
          setShowSignIn={() => {}}
        />
      )}
    </div>
  );
};