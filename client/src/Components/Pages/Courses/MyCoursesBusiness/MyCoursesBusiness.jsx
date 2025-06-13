import React, { useState, useEffect } from "react";
import "./MyCourses.css";
import { Header } from "../../../Layouts/Header/Header";
import { Footer } from "../../../Layouts/Footer/Footer";
import { Main } from "../../../Layouts/Main/Main";
import { useNavigate } from "react-router-dom";

export const MyCourses = () => {
  

  return (
    <>
      <Header />
      <Main>
        <div className="container_myCourses">
          <h2>
            Mis <span className="complementary">Cursos</span>
          </h2>
          <div className="containerMyCoursesAdminOptions">

          </div>
          <div className="illustration-container-myCourses">
            <img src="/src/assets/Ilustrations/woman-business.svg" alt="Ilustración de mujer mis cursos admin" />
            <img src="/src/assets/Ilustrations/man-business.svg" alt="Ilustración de hombre mis cursos admin" />
          </div>
        </div>
      </Main>
      
      <Footer />
    </>
  );
};