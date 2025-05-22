import { Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

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
import {UpdateCourse} from './Components/Pages/Courses/UpdateCourse/UpdateCourse';
import { GestionsInstructor } from './Components/Pages/GestionsInstructor/GestionsInstructor';
import { GestionsGestor } from './Components/Pages/GestionsGestor/GestionsGestor';
import { SeeMyProfile } from './Components/Pages/SeeMyProfile/SeeMyProfile';
import { GestionsCompany } from './Components/Pages/GestionsCompany/GestionsCompany';
import { ConsultEmployes } from './Components/Pages/GestionsEmployes/ConsultEmployes/ConsultEmployes';
import { CreateEmploye } from './Components/Pages/GestionsEmployes/CreateEmploye/CreateEmploye';
import { UpdateEmploye } from './Components/Pages/GestionsEmployes/UpdateEmploye/UpdateEmploye';
import { SeachEmployes } from './Components/Pages/GestionsEmployes/SeachEmployes/SeachEmployes';

// Importación de modales
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

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Verifica si hay una sesión guardada en localStorage
    const userSession = localStorage.getItem('userSession');
    if (userSession) {
      const { accountType } = JSON.parse(userSession);
      // Redirige automáticamente a /Inicio con el tipo de cuenta
      navigate('/Inicio', { state: { accountType } });
    }
  }, [navigate]);

  return (
    <>
      {/* Modales globales */}
      <Modal_SignIn />
      <Modal_General />
      <Modal_SignUp />
      <Modal_Successful />
      <Modal_Failed />
      <CreateInstructor />
      <CreateGestor />


      {/* Rutas */}
      <Routes>
        <Route path="/" element={<Start />} />
        <Route path="/QuienesSomos" element={<Who_we_are />} />
        <Route path="/Inicio" element={<Home />} />
        <Route path="/verificarCorreo" element={<EmailVerification />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword" element={<ResetPassword />} />
        <Route path="/Cursos/CrearCurso" element={<CreateCourse />} />
        <Route path="/Cursos/BuscarCursos" element={<ConsultCourses />} />
        <Route path="/Cursos/:id" element={<SeeCourse />} />
        <Route path="/Cursos/ActualizarCurso/:id" element={<UpdateCourse />} />
        <Route path="/Gestiones/Instructor" element={<GestionsInstructor />} />
        <Route path="/Gestiones/Gestor" element={<GestionsGestor />} />
        <Route path="/MiPerfil" element={<SeeMyProfile />} />
        <Route path="/Gestiones/Empresas" element={<GestionsCompany />} />
        <Route path="/Empleados/MisEmpleados" element={<ConsultEmployes />} />
        <Route path="/Empleados/CrearEmpleado" element={<CreateEmploye />} />
        <Route path="/Empleados/ActualizarEmpleado/:id" element={<UpdateEmploye />} />
        <Route path="/Empleados/BuscarEmpleado" element={<SeachEmployes />} />
        {/* <Route path="/Cursos/AsignarInstructores" element={<AssignInstructorCourse />} /> */}
        
      
      
      </Routes>
    </>
  );
}

export default App;