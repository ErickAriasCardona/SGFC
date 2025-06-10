import React, { useState, useEffect } from "react";
import "./AssignInstructorCourse.css";
import axiosInstance from "../../../../config/axiosInstance";
import { Routes, Route, useNavigate } from "react-router-dom";

export const AssignInstructorCourse = ({ curso_ID, onClose }) => {
  const navigate = useNavigate();

  // Validación de sesión de usuario y rol de administrador
  const userSessionString = sessionStorage.getItem("userSession");
  const userSession = userSessionString ? JSON.parse(userSessionString) : null;
  const acces_granted =
    userSessionString &&
    (userSession.accountType === "Administrador" ||
      userSession.accountType === "Gestor");

  const [filteredInstructors, setFilteredInstructors] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [filter, setFilter] = useState("");
  const [current, setCurrent] = useState(0);
  const [selectedState, setSelectedState] = useState({
    activo: true,
    inactivo: true,
  });

  // Obtener instructores del backend
  const fetchInstructors = async () => {
    try {
        const response = await axiosInstance.get('/api/users/instructores');
        setInstructors(response.data);
        setFilteredInstructors(response.data);
    } catch (error) {
        console.error('Error al obtener los instructores:', error);
        alert('Hubo un problema al cargar los instructores. Por favor, inténtalo más tarde.');
    }
};

  useEffect(() => {
    fetchInstructors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedState, filter, instructors]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const applyFilters = () => {
    const value = filter.toLowerCase();
    const filtered = instructors.filter(
      (instructor) =>
        (instructor.nombres || "").toLowerCase().includes(value) ||
        (instructor.apellidos || "").toLowerCase().includes(value) ||
        (instructor.cedula || "").toLowerCase().includes(value)
    );

    const filteredByState = filtered.filter((instructor) => {
      const estado = (instructor.estado || "").toLowerCase();
      if (selectedState.activo && estado === "activo") return true;
      if (selectedState.inactivo && estado === "inactivo") return true;
      return false;
    });

    setFilteredInstructors(filteredByState);
    setCurrent(0);
  };

  const next = () =>
    setCurrent((prev) => (prev + 1) % filteredInstructors.length);
  const prev = () =>
    setCurrent(
      (prev) =>
        (prev - 1 + filteredInstructors.length) % filteredInstructors.length
    );

  const asignarInstructor = async (instructor_ID) => {
    try {
      // Busca primero en localStorage, luego en sessionStorage
      let userSessionString = localStorage.getItem("userSession");
      if (!userSessionString) {
        userSessionString = sessionStorage.getItem("userSession");
      }
      if (!userSessionString) {
        alert("No se encontró la sesión de usuario.");
        return;
      }
      const user = JSON.parse(userSessionString);
      const gestor_ID = user?.id;
      // Mostrar en consola los datos que se enviarán
      console.log({
        gestor_ID,
        instructor_ID,
        curso_ID,
        fecha_asignacion: new Date(),
        estado: "aceptada",
      });

      const response = await axiosInstance.post("/asignaciones", {
        gestor_ID,
        instructor_ID,
        curso_ID,
        fecha_asignacion: new Date(),
        estado: "aceptada",
      });

      alert(response.data.mensaje || "Instructor asignado correctamente");
      if (onClose) onClose();
    } catch (error) {
      alert(
        error.response?.data?.mensaje ||
          "Error al asignar el instructor. Intenta de nuevo."
      );
    }
  };
  if (acces_granted) {
    return (
      <div id="modal-assingInstructorCourse">
        <div className="modal-bodyAssignInstructorCourse">
          <h2>Asignar Instructor</h2>

          <div className="containerGestionsInstructorResults">
            {filteredInstructors.length > 1 && (
              <button className="arrow left" onClick={prev}>
                ❮
              </button>
            )}

            <div className="carousel-container_2">
              <div className="carousel-track">
                {filteredInstructors.length === 0 ? (
                  <p className="no-results">No hay resultados</p>
                ) : filteredInstructors.length === 1 ? (
                  <div className="carousel-card card-center">
                    <img
                      src={
                        filteredInstructors[0]?.foto_perfil ||
                        "default-profile.png"
                      }
                      alt="Instructor"
                      className="carousel-image"
                    />
                    <div className="carousel-card-info">
                      <h3>
                        {filteredInstructors[0]?.nombres}{" "}
                        {filteredInstructors[0]?.apellidos}
                      </h3>
                      <p>{filteredInstructors[0]?.titulo_profesional}</p>
                    </div>
                  </div>
                ) : filteredInstructors.length === 2 ? (
                  [0].map((offset) => {
                    const index =
                      (current + offset) % filteredInstructors.length;
                    const instructor = filteredInstructors[index];
                    return (
                      <div className="carousel-card card-center" key={index}>
                        <img
                          src={instructor?.foto_perfil || "default-profile.png"}
                          alt="Instructor"
                          className="carousel-image"
                        />
                        <div className="carousel-card-info">
                          <h3>
                            {instructor?.nombres} {instructor?.apellidos}
                          </h3>
                          <p>{instructor?.titulo_profesional}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  [0, 1, 2].map((offset) => {
                    const index =
                      (current + offset) % filteredInstructors.length;
                    const instructor = filteredInstructors[index];
                    let positionClass =
                      offset === 1 ? "card-center" : "card-side";
                    return (
                      <div
                        className={`carousel-card ${positionClass}`}
                        key={index}
                      >
                        <img
                          src={instructor?.foto_perfil || "default-profile.png"}
                          alt="Instructor"
                          className="carousel-image"
                        />
                        <div className="carousel-card-info">
                          <h3>
                            {instructor?.nombres} {instructor?.apellidos}
                          </h3>
                          <p>{instructor?.titulo_profesional}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {filteredInstructors.length > 0 && (
                <div className="instructor-info">
                  <h3>
                    {
                      filteredInstructors[
                        (current + 1) % filteredInstructors.length
                      ]?.nombres
                    }{" "}
                    {
                      filteredInstructors[
                        (current + 1) % filteredInstructors.length
                      ]?.apellidos
                    }
                  </h3>
                  <p>
                    {
                      filteredInstructors[
                        (current + 1) % filteredInstructors.length
                      ]?.titulo_profesional
                    }
                  </p>
                  <button
                    className="profile-btn"
                    onClick={() =>
                      asignarInstructor(
                        filteredInstructors[
                          (current + 1) % filteredInstructors.length
                        ]?.ID
                      )
                    }
                  >
                    Asignar Instructor
                  </button>
                </div>
              )}
            </div>

            {filteredInstructors.length > 1 && (
              <button className="arrow right" onClick={next}>
                ❯
              </button>
            )}
          </div>

          <div className="container_return_CreateInstructor">
            <h5>Volver</h5>
            <button
              type="button"
              onClick={onClose}
              className="closeModal"
            ></button>
          </div>
        </div>
      </div>
    );
  } else {
    navigate("/ProtectedRoute"); // Redirigir a la página de inicio si no es administrador
  }
};
