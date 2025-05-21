import { Header } from "../../Layouts/Header/Header";
import { Footer } from "../../Layouts/Footer/Footer";
import { Main } from "../../Layouts/Main/Main";
import ilustration_01 from "../../../assets/Ilustrations/Frame01.svg";
import "./Who_we_are.css";

export const Who_we_are = () => {
  return (
    <div className="who_we_are">
      <Header />
      <Main>
        <picture className="ilustration_who">
          <img
            className="image_who"
            src={ilustration_01}
            alt="ilustration 01"
          />
        </picture>
        <section className="container_description_who">
          <h1 className="title_who">
            ¿Quiénes <span className="span_somos">somos</span>?
          </h1>
          <p className="description_who">
            Lorem Ipsum es simplemente el texto de relleno de las imprentas y
            archivos de texto. Lorem Ipsum ha sido el texto de relleno estándar
            de las industrias desde el año 1500, cuando un impresor (N. del T.
            persona que se dedica a la imprenta) desconocido usó una galería de
            textos y los mezcló de tal manera que logró hacer un libro de
            textosespecimen.
          </p>
        </section>
      </Main>
      <Footer />
    </div>
  );
};
