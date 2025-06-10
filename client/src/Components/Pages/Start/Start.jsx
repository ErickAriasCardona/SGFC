import { Header } from "../../Layouts/Header/Header";
import { Main } from "../../Layouts/Main/Main";
import { Footer } from "../../Layouts/Footer/Footer";
import ilustration_01 from "../../../assets/Ilustrations/Frame01.svg";

import "./Start.css";

export const Start = ({ setShowSignIn, setShowSignUp, setShowAccountType }) => {
  return (

    <div className="start">
      <Header
        setShowSignIn={setShowSignIn}
        setShowSignUp={setShowSignUp}
        setShowAccountType={setShowAccountType}
      />
      <Main>
        <div className="container_description">
          <h1>
            Sistema de Gestión de
            <br />
            <span className="complementary">Formación Complementaria</span>
          </h1>
          <p>
            Convierte la <b>capacitación de tu equipo</b> en un proceso{" "}
            <b>ágil, claro y 100% digital</b>. Desde una sola plataforma podrás
            solicitar cursos, cargar documentos en segundos y seguir el avance
            en tiempo real. <br />
            <br />
            Conecta a tu empresa con instructores expertos del&nbsp;SENA, reduce
            los trámites manuales y obtén <b>transparencia total</b> en cada
            paso.
            <em>
              {" "}
              ¡Impulsa hoy mismo la formación que acelera tu crecimiento!
            </em>{" "}
          </p>
        </div>
        <div className="container_ilustrationStart">
          <img src={ilustration_01} alt="" />
        </div>
      </Main>
      <Footer />
    </div>

  );
};
