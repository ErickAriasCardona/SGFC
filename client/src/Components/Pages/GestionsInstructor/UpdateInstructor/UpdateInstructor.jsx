import React, { useState, useEffect } from "react";
import "./UpdateInstructor.css";
import axiosInstance from "../../../../config/axiosInstance"; // Asegúrate de ajustar esta ruta según la estructura de tu proyecto
import { Main } from "../../../Layouts/Main/Main";

export const UpdateInstructor = ({ instructor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ ...instructor });
  const [cantidadCursos, setCantidadCursos] = useState(0);

  useEffect(() => {
    const obtenerCursosAsignados = async () => {
      try {
        console.log("ID del instructor seleccionado:", instructor.ID); // 👈 Valida el ID aquí

        const response = await axiosInstance.get(
          `/cursos-asignados/${instructor.ID}`
        );
        console.log("Cursos asignados:", response.data); // 👈 Aquí puedes ver lo que devuelve el backend

        if (Array.isArray(response.data)) {
          setCantidadCursos(response.data.length);
        } else {
          setCantidadCursos(0);
        }
      } catch (error) {
        console.error("Error al obtener los cursos asignados:", error);
        setCantidadCursos(0); // en caso de error, asumimos 0
      }
    };

    if (instructor?.ID) {
      obtenerCursosAsignados();
    }
  }, [instructor]);

  const closeModalUpdateInstructor = () => {
    document.getElementById("modal-overlayUpdateInstructor").style.display =
      "none";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        foto_perfil: file,
      }));
    }
  };

  const handleEstadoChange = (estado) => {
    setFormData((prev) => ({ ...prev, estado }));
  };

  const handleButtonClick = async (e) => {
    e.preventDefault();

    if (!isEditing) {
      // Activar edición
      setIsEditing(true);
      return;
    }

    // Guardar cambios
    try {
      const formDataToSend = new FormData();
      for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
          if (key === "foto_perfil") {
            if (formData[key] instanceof File) {
              formDataToSend.append(key, formData[key]);
            }
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
      }

      const response = await axiosInstance.put(
        `/perfil/actualizar/${formData.ID}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert(response.data.message || "Perfil actualizado");
      setIsEditing(false);

      //Recargar la página para reflejar cambios
      window.location.reload();
      //Ocultar el modal
      document.getElementById("modal-overlayUpdateInstructor").style.display =
        "none";
    } catch (error) {
      console.error(
        "Error al actualizar el perfil:",
        error.response?.data || error.message
      );
      alert("Hubo un error al actualizar el perfil.");
    }
  };

  return (
    <Main>
      <div id="modal-overlayUpdateInstructor" style={{ display: "flex" }}>
        <form
          className="modal-bodyUpdateInstructor"
          onSubmit={handleButtonClick}
        >
          <div className="modal-left-update1">
            {/* Título principal */}
            <div className="titulo-instructor">
              <span className="titulo-blanco">Datos del </span>
              <span className="titulo-verde">Instructor</span>
            </div>

            <div className="dato-instructor">
              <span className="dato-label">Nombre:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="nombres"
                  value={formData.nombres || ""}
                  onChange={handleChange}
                  className="form-input"
                  readOnly={!isEditing}
                />
              ) : (
                <span className="dato-valor"> {formData.nombres || ""}</span>
              )}
            </div>

            <div className="dato-instructor">
              <span className="dato-label">apellidos:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="apellidos"
                  value={formData.apellidos || ""}
                  onChange={handleChange}
                  className="form-input"
                  readOnly={!isEditing}
                />
              ) : (
                <span className="dato-valor"> {formData.apellidos || ""}</span>
              )}
            </div>

            {/* Cedula */}
            <div className="dato-instructor">
              <span className="dato-label">Cédula:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="cedula"
                  value={formData.cedula || ""}
                  onChange={handleChange}
                  className="form-input"
                  readOnly={!isEditing}
                />
              ) : (
                <span className="dato-valor"> {formData.cedula || ""}</span>
              )}
            </div>

            {/* Estado */}
            <div className="dato-instructor">
              <span className="dato-label">Estado:</span>
              <span
                className={`dato-valor ${
                  formData.estado === "Activo" ? "dato-rojo" : "dato-verde"
                }`}
              >
                {formData.estado}
              </span>
            </div>

            {/* Celular */}
            <div className="dato-instructor">
              <span className="dato-label">Celular:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="celular"
                  value={formData.celular || ""}
                  onChange={handleChange}
                  className="form-input"
                />
              ) : (
                <span className="dato-valor"> {formData.celular || ""}</span>
              )}
            </div>

            {/* Email */}
            <div className="dato-instructor">
              <span className="dato-label">Email:</span>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  className="form-input"
                />
              ) : (
                <span className="dato-valor"> {formData.email || ""}</span>
              )}
            </div>

            {/* Cursos asignados */}
            <div className="dato-instructor">
              <span className="dato-label">Cursos asignados:</span>
              <span className="dato-valor dato-verde"> {cantidadCursos} </span>
              <span className="icono-ojo" role="img" aria-label="ver"></span>
            </div>

            {/* Título profesional */}
            <div className="dato-instructor">
              <span className="dato-label">Título:</span>
              {isEditing ? (
                <input
                  type="text"
                  name="titulo_profesional"
                  value={formData.titulo_profesional || ""}
                  onChange={handleChange}
                  className="form-input"
                />
              ) : (
                <span className="dato-valor">
                  {" "}
                  {formData.titulo_profesional || ""}
                </span>
              )}
            </div>

            {/* <button type="submit" className="edit-button-updateInstructor">
            {isEditing ? "Guardar Cambios" : "Editar Perfil"}
          </button> */}
          </div>

          <div className="modal-right12">
            <input
              type="file"
              accept="image/*"
              hidden={!isEditing}
              disabled={!isEditing}
              onChange={handleImageChange}
              id="imageUpload"
            />

            <label
              className={`upload-area-update ${
                !isEditing ? "read-only-border" : ""
              }`}
              htmlFor="imageUpload"
            >
              {" "}
              {formData.foto_perfil instanceof File ? (
                <img
                  src={URL.createObjectURL(formData.foto_perfil)}
                  alt="Vista previa"
                  className="preview-image"
                />
              ) : formData.foto_perfil ? (
                <>
                  <div className="rotacion"></div>
                  <div className="rotacion2"></div>
                  <img
                    src={formData.foto_perfil}
                    alt="Foto de perfil"
                    className="preview-image-update"
                  />
                </>
              ) : (
                <div className="upload-placeholder">
                  <p>Sin imagen disponible</p>
                </div>
              )}
            </label>

            <div className="status-container">
              <span>Estado:</span>
              <div className="status-buttons">
                {isEditing ? (
                  ["Activo", "Inactivo"].map((estado) => (
                    <button
                      key={estado}
                      type="button"
                      className={`status ${
                        formData.estado === estado ? "active" : ""
                      }`}
                      onClick={() => handleEstadoChange(estado)}
                    >
                      {estado}
                    </button>
                  ))
                ) : (
                  <button type="button" className="status active">
                    {formData.estado}
                  </button>
                )}
              </div>
            </div>

            <button type="submit" className="edit-button-updateInstructor">
              {isEditing ? "Guardar Cambios" : "Actualizar Perfil"}
            </button>
          </div>

          <div className="container_return_UpdateInstructor">
            <h5>Volver</h5>
            <button
              type="button"
              onClick={closeModalUpdateInstructor}
              className="closeModal1"
            ></button>
          </div>
        </form>
      </div>
    </Main>
  );
};
