import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import React, { useState } from "react";

// Importación de iconos
import companyGreen from './assets/Icons/companyGreen.png';
import companyGrey from './assets/Icons/companyGrey.png';
import userGreen from './assets/Icons/userGreen.png';
import userGrey from './assets/Icons/userGrey.png';

// Importación de páginas
import { Start } from './Components/Pages/Start/Start';
import { Who_we_are } from './Components/Pages/Who_we_are/Who_we_are';
import { Home } from './Components/Pages/Home/Home';
import { EmailVerification } from './Components/Pages/EmailVerification/EmailVerification';
import { ResetPassword } from './Components/Pages/ResetPassword/ResetPassword';
import { ForgotPassword } from './Components/Pages/ForgotPassword/ForgotPassword';
import { CreateCourse } from './Components/Pages/Courses/CreateCourse/CreateCourse';
import { ConsultCourses } from './Components/Pages/Courses/Consult/ConsultCourses';
import { SeeCourse } from './Components/Pages/Courses/SeeCourse/SeeCourse';
import { UpdateCourse } from './Components/Pages/Courses/UpdateCourse/UpdateCourse';
import { MisCursos } from './Components/Pages/Courses/MisCursos/MisCursos';
import { GestionsInstructor } from './Components/Pages/GestionsInstructor/GestionsInstructor';
import { GestionsGestor } from './Components/Pages/GestionsGestor/GestionsGestor';
import { SeeMyProfile } from './Components/Pages/SeeMyProfile/SeeMyProfile';
import { GestionsCompany } from './Components/Pages/GestionsCompany/GestionsCompany';
import { CreateEmploye } from './Components/Pages/GestionsEmployes/CreateEmploye/CreateEmploye';
import { UpdateEmploye } from './Components/Pages/GestionsEmployes/UpdateEmploye/UpdateEmploye';
import { SeachEmployes } from './Components/Pages/GestionsEmployes/SeachEmployes/SeachEmployes';
import { GestionsEmployes } from './Components/Pages/GestionsEmployes/GestionsEmployes';
import { AttendanceRecords } from './components/Pages/AttendanceRecords/AttendanceRecords';
import { ManageAttendance } from './Components/Pages/Courses/ManageAttendance/ManageAttendance';
// Importación de modales
import { NavBar } from './Components/UI/NavBar/NavBar';
import { Modal_SignIn } from './Components/UI/Modal_SignIn/Modal_SignIn';
import { Modal_General } from './Components/UI/Modal_General/Modal_General';
import { Modal_SignUp } from './Components/UI/Modal_SignUp/Modal_SignUp';
import { Modal_Successful } from './Components/UI/Modal_Successful/Modal_Successful';
import { Modal_Failed } from './Components/UI/Modal_Failed/Modal_Failed';
import { CreateInstructor } from './Components/Pages/GestionsInstructor/CreateInstructor/CreateInstructor';
import { CreateGestor } from './Components/Pages/GestionsGestor/CreateGestor/CreateGestor';
import { UpdateInstructor } from './Components/Pages/GestionsInstructor/UpdateInstructor/UpdateInstructor';
// Importación de estilos
import './App.css';
import { Header } from './Components/Layouts/Header/Header';

// Crear un componente Layout que envuelva las páginas con Header y Footer
const Layout = ({ children, setShowSignIn, setShowSignUp, setShowAccountType }) => {
  return (
    <>
      <Header 
        setShowSignIn={setShowSignIn}
        setShowSignUp={setShowSignUp}
        setShowAccountType={setShowAccountType}
      />
      {children}
    </>
  );
};

function App() {
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showAccountType, setShowAccountType] = useState(false);
  const [selectedAccountType, setSelectedAccountType] = useState("");
  const [hoveredButton, setHoveredButton] = useState("");

  useEffect(() => {
    if (window.gapi) {
      window.gapi.load('auth2', () => {
        window.gapi.auth2.init({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID
        });
      });
    }
  }, []);

  useEffect(() => {
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const { accountType } = JSON.parse(userSession);
      navigate('/Inicio', { state: { accountType } });
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
          <Route path="/" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <Start 
                setShowSignIn={setShowSignIn}
                setShowSignUp={setShowSignUp}
                setShowAccountType={setShowAccountType}
              />
            </Layout>
          } />
          <Route path="/QuienesSomos" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <Who_we_are />
            </Layout>
          } />
          <Route path="/Inicio" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <Home handleShowSignUp={handleShowSignUp} />
            </Layout>
          } />
          <Route path="/verificarCorreo" element={<EmailVerification />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/resetPassword" element={<ResetPassword />} />
          <Route path="/Cursos/CrearCurso" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <CreateCourse />
            </Layout>
          } />
          <Route path="/Cursos/BuscarCursos" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <ConsultCourses />
            </Layout>
          } />
          <Route path="/Cursos/MisCursos" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <MisCursos />
            </Layout>
          } />
          <Route path="/Cursos/:id" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <SeeCourse />
            </Layout>
          } />
          <Route path="/Cursos/:id/gestionar-asistencia" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <ManageAttendance />
            </Layout>
          } />
          <Route path="/Cursos/ActualizarCurso/:id" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <UpdateCourse />
            </Layout>
          } />
          <Route path="/Gestiones/Instructor" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <GestionsInstructor />
            </Layout>
          } />
          <Route path="/Gestiones/Gestor" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <GestionsGestor />
            </Layout>
          } />
          <Route path="/MiPerfil" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <SeeMyProfile />
            </Layout>
          } />
          <Route path="/Gestiones/Empresas" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <GestionsCompany />
            </Layout>
          } />
          <Route path="/Empleados/MisEmpleados" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <GestionsEmployes />
            </Layout>
          } />
          <Route path="/Empleados/CrearEmpleado" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <CreateEmploye />
            </Layout>
          } />
          <Route path="/Empleados/ActualizarEmpleado/:id" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <UpdateEmploye />
            </Layout>
          } />
          <Route path="/Asistencias" element={
            <Layout 
              setShowSignIn={setShowSignIn}
              setShowSignUp={setShowSignUp}
              setShowAccountType={setShowAccountType}
            >
              <AttendanceRecords />
            </Layout>
          } />
        </Routes>
      </>
    </GoogleOAuthProvider>
  );
}

export default App;