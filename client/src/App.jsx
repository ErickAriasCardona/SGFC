import { Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import React, { useState } from "react";

// Importación de iconos
import companyGreen from "./assets/Icons/companyGreen.png";
import companyGrey from "./assets/Icons/companyGrey.png";
import userGreen from "./assets/Icons/userGreen.png";
import userGrey from "./assets/Icons/userGrey.png";

// Importación de páginas
import { Start } from "./Components/Pages/Start/Start";
import { Who_we_are } from "./Components/Pages/Who_we_are/Who_we_are";
import { Home } from "./Components/Pages/Home/Home";
import { EmailVerification } from "./Components/Pages/EmailVerification/EmailVerification";
import { ResetPassword } from "./Components/Pages/ResetPassword/ResetPassword";
import { ForgotPassword } from "./Components/Pages/ForgotPassword/ForgotPassword";
import { CreateCourse } from "./Components/Pages/Courses/CreateCourse/CreateCourse";
import { ConsultCourses } from "./Components/Pages/Courses/Consult/ConsultCourses";
import { SeeCourse } from "./Components/Pages/Courses/SeeCourse/SeeCourse";
import { UpdateCourse } from "./Components/Pages/Courses/UpdateCourse/UpdateCourse";
import { GestionsInstructor } from "./Components/Pages/GestionsInstructor/GestionsInstructor";
import { GestionsGestor } from "./Components/Pages/GestionsGestor/GestionsGestor";
import { SeeMyProfile } from "./Components/Pages/SeeMyProfile/SeeMyProfile";
import { GestionsCompany } from "./Components/Pages/GestionsCompany/GestionsCompany";
import { CreateEmploye } from "./Components/Pages/GestionsEmployes/CreateEmploye/CreateEmploye";
import { UpdateEmploye } from "./Components/Pages/GestionsEmployes/UpdateEmploye/UpdateEmploye";
import { SeachEmployes } from "./Components/Pages/GestionsEmployes/SeachEmployes/SeachEmployes";
import { GestionsEmployes } from "./Components/Pages/GestionsEmployes/GestionsEmployes";
// Importación de modales
import { NavBar } from "./Components/UI/NavBar/NavBar";
import { Modal_SignIn } from "./Components/UI/Modal_SignIn/Modal_SignIn";
import { Modal_General } from "./Components/UI/Modal_General/Modal_General";
import { Modal_SignUp } from "./Components/UI/Modal_SignUp/Modal_SignUp";
import { Modal_Successful } from "./Components/UI/Modal_Successful/Modal_Successful";
import { Modal_Failed } from "./Components/UI/Modal_Failed/Modal_Failed";
import { CreateInstructor } from "./Components/Pages/GestionsInstructor/CreateInstructor/CreateInstructor";
import { CreateGestor } from "./Components/Pages/GestionsGestor/CreateGestor/CreateGestor";
import { UpdateInstructor } from "./Components/Pages/GestionsInstructor/UpdateInstructor/UpdateInstructor";
// Importación de estilos
import "./App.css";
import { ProtectedRoute } from "./utils/ProtectedRoute";

function App() {
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAccountType, setShowAccountType] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [hoveredButton, setHoveredButton] = useState("");

  useEffect(() => {
    if (window.gapi) {
      window.gapi.load("auth2", () => {
        window.gapi.auth2.init({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        });
      });
    }
  }, []);

  useEffect(() => {
    const userSession = localStorage.getItem("userSession");
    if (userSession) {
      const { accountType } = JSON.parse(userSession);
      navigate("/Inicio", { state: { accountType } });
    }
  }, [navigate]);

  const handleShowSignUp = (accountType) => {
    setSelectedAccountType(accountType);
    setShowSignUp(true);
    setShowAccountType(false);
    setShowSignIn(false);
    setHoveredButton("");
  };

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <>
        {showSignIn && (
          <Modal_SignIn
            showSignIn={showSignIn}
            setShowSignIn={setShowSignIn}
            setShowSignUp={setShowSignUp}
            setShowAccountType={setShowAccountType}
            setSelectedAccountType={setSelectedAccountType}
          />
        )}

        {showAccountType && !showSignUp && (
          <Modal_General closeModal={() => setShowAccountType(false)}>
            <p>Por favor seleccione el tipo de cuenta que desea crear</p>
            <div className="option_1Account">
              <p>Empresa</p>
              <button
                className="container_AccountTypeEmpresa"
                onClick={() => handleShowSignUp("Empresa")}
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
                onClick={() => handleShowSignUp("Aprendiz")}
                onMouseEnter={() => setHoveredButton("Aprendiz")}
                onMouseLeave={() => setHoveredButton("")}
              >
                <img
                  src={hoveredButton === "Aprendiz" ? userGrey : userGreen}
                  alt="Aprendiz"
                  style={{ opacity: 1 }}
                />
              </button>
            </div>
          </Modal_General>
        )}

        {showSignUp && selectedAccountType && (
          <Modal_SignUp
            accountType={selectedAccountType}
            setShowSignUp={setShowSignUp}
            setShowSignIn={setShowSignIn}
            setShowAccountType={setShowAccountType}
          />
        )}

        <Modal_Successful />
        <Modal_Failed />
        <CreateInstructor />
        <CreateGestor />

        <Routes>
          <Route
            path="/"
            element={
              <Start
                setShowSignIn={setShowSignIn}
                setShowSignUp={setShowSignUp}
                setShowAccountType={setShowAccountType}
              />
            }
          />
          <Route path="/QuienesSomos" element={<Who_we_are />} />
          <Route
            path="/Inicio"
            element={<Home handleShowSignUp={handleShowSignUp} />}
          />
          <Route path="/verificarCorreo" element={<EmailVerification />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/Cursos/CrearCurso" element={<CreateCourse />} />
          <Route path="/Cursos/BuscarCursos" element={<ConsultCourses />} />
          <Route path="/Cursos/:id" element={<SeeCourse />} />
          <Route
            path="/Cursos/ActualizarCurso/:id"
            element={<UpdateCourse />}
          />
          <Route
            path="/Gestiones/Instructor"
            element={<GestionsInstructor />}
          />
          <Route path="/Gestiones/Gestor" element={<GestionsGestor />} />
          <Route path="/MiPerfil" element={<SeeMyProfile />} />
          <Route path="/Gestiones/Empresas" element={<GestionsCompany />} />
          <Route
            path="/Empleados/MisEmpleados"
            element={<GestionsEmployes />}
          />
          <Route path="/Empleados/CrearEmpleado" element={<CreateEmploye />} />
          <Route
            path="/Empleados/ActualizarEmpleado/:id"
            element={<UpdateEmploye />}
          />
          <Route path="/ProtectedRoute" element={<ProtectedRoute />} />
        </Routes>
      </>
    </GoogleOAuthProvider>
  );
}

export default App;
