import React, { useEffect, useRef, useState } from "react";
import "./UpdateCourse.css";
import { Header } from "../../../Layouts/Header/Header";
import { Footer } from "../../../Layouts/Footer/Footer";
import { Main } from "../../../Layouts/Main/Main";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../../config/axiosInstance";
import addIMG from "../../../../assets/Icons/addImg.png";
import EditCalendar from "../../../UI/Modal_Calendar/EditCalendar/EditCalendar";
import calendar from '../../../../assets/Icons/calendar.png';

export const UpdateCourse = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [curso, setCurso] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [isEditCalendarOpen, setIsEditCalendarOpen] = useState(false);
  const [calendarData, setCalendarData] = useState({
    startDate: "",
    endDate: "",
    selectedSlots: [],
  });
  const [empresa, setEmpresa] = useState(""); // Nuevo estado para empresa

  // Obtener los datos del curso al cargar la página
  useEffect(() => {
    const fetchCurso = async () => {
      try {
        const response = await axiosInstance.get(`/api/courses/cursos/${id}`);
        setCurso(response.data);
        setPreview(response.data.imagen ? `sgfc.railway.internal${response.data.imagen}` : null);

        // Inicializar calendarData con los datos del curso si existen
        setCalendarData({
          startDate: response.data.fecha_inicio ? response.data.fecha_inicio.split("T")[0] : "",
          endDate: response.data.fecha_fin ? response.data.fecha_fin.split("T")[0] : "",
          selectedSlots: response.data.slots_formacion
            ? JSON.parse(response.data.slots_formacion)
            : [],
        });

        // Si hay empresa asociada, inicialízala
        if (response.data.empresa_NIT) {
          setEmpresa(response.data.empresa_NIT);
        }
      } catch (error) {
        console.error("Error al obtener el curso:", error);
      }
    };

    fetchCurso();
  }, [id]);

  // Callback para guardar los datos del calendario
  const handleCalendarSave = (data) => {
    setCalendarData(data);
    setIsEditCalendarOpen(false);
  };

  // Manejar la actualización del curso
  const handleUpdateCourse = async () => {
    try {
      // Procesar los slots para obtener horarios y días
      const slotsByDay = {};
      calendarData.selectedSlots.forEach(slot => {
        const [dia, hora] = slot.split('-');
        if (!slotsByDay[dia]) {
          slotsByDay[dia] = [];
        }
        slotsByDay[dia].push(hora);
      });

      // Obtener la primera hora de inicio y la última hora de fin
      let horaInicio = '23:59';
      let horaFin = '00:00';
      Object.values(slotsByDay).flat().forEach(hora => {
        if (hora < horaInicio) horaInicio = hora;
        if (hora > horaFin) horaFin = hora;
      });

      horaInicio = horaInicio.padStart(5, '0');
      horaFin = horaFin.padStart(5, '0');

      // Obtener los días únicos y asegurarse de que estén en formato completo
      const diasMapping = {
        'Lun': 'Lunes',
        'Mar': 'Martes',
        'Mié': 'Miércoles',
        'Jue': 'Jueves',
        'Vie': 'Viernes',
        'Sáb': 'Sábado'
      };
      const diasSemana = Object.keys(slotsByDay).map(dia => diasMapping[dia] || dia);

      const updatedCurso = {
        ficha: curso.ficha,
        nombre_curso: curso.nombre_curso,
        descripcion: curso.descripcion,
        tipo_oferta: curso.tipo_oferta,
        estado: curso.estado,
        fecha_inicio: calendarData.startDate,
        fecha_fin: calendarData.endDate,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        dias_formacion: JSON.stringify(diasSemana),
        lugar_formacion: curso.lugar_formacion || "",
        slots_formacion: JSON.stringify(calendarData.selectedSlots),
        empresa_NIT: curso.tipo_oferta === "Cerrada" ? empresa : null,
      };

      const response = await axiosInstance.put(`/api/courses/cursos/${id}`, updatedCurso, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        alert("Curso actualizado con éxito");
        navigate(`/Cursos/${id}`);
      } else {
        alert("Ocurrió un error al actualizar el curso");
      }
    } catch (error) {
      console.error("Error al actualizar el curso:", error);
      alert("Ocurrió un error al actualizar el curso");
    }
  };

  if (!curso) {
    return <p>Cargando...</p>;
  }

  return (
    <>
      <Header />
      <Main>
        <div className="container_createCourse">
          <h2>
            Actualizar
            <span className="complementary"> Curso</span>
          </h2>

          <div className="containerInformation_CreateCourse">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => setPreview(reader.result);
                  reader.readAsDataURL(file);
                }
              }}
              hidden
            />

            <label
              className="upload-area"
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Vista previa"
                  className="preview-image"
                />
              ) : (
                <div className="upload-placeholder">
                  <img
                    src={addIMG}
                    alt="icono agregar imagen"
                    className="icon"
                  />
                  <p>Arrastra o sube la foto del curso aquí.</p>
                </div>
              )}
            </label>

            <div className="containerDetails_course">
              <div id="containerInput_ficha">
                <label htmlFor="fichaCourse">Ficha: </label>
                <input
                  id="fichaCourse"
                  type="text"
                  value={curso.ficha || ""}
                  onChange={(e) =>
                    setCurso({ ...curso, ficha: e.target.value })
                  }
                />
              </div>
              <input
                className="addName"
                type="text"
                value={curso.nombre_curso || ""}
                onChange={(e) => {
                  setCurso({ ...curso, nombre_curso: e.target.value });
                }}
              />
              <input
                className="addDetails"
                type="text"
                value={curso.descripcion || ""}
                onChange={(e) =>
                  setCurso({ ...curso, descripcion: e.target.value })
                }
              />

              <div className="containerDetails_course2">
                <div>
                 <div className="offer-type-container">
  <span>Tipo de oferta:</span>
  <div className="offer-options">
    <button
      className={`offer-button ${curso.tipo_oferta?.toLowerCase() === "cerrada" ? "active" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        setCurso({ ...curso, tipo_oferta: "Cerrada" });
      }}
      type="button"
    >
      Cerrada
    </button>
    <button
      className={`offer-button ${curso.tipo_oferta?.toLowerCase() === "abierta" ? "active" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        setCurso({ ...curso, tipo_oferta: "Abierta" });
      }}
      type="button"
    >
      Abierta
    </button>
  </div>
</div>
<div className="offer-type-container">
  <span>Estado:</span>
  <div className="offer-options">
    <button
      className={`offer-button ${curso.estado?.toLowerCase() === "activo" ? "active" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        setCurso({ ...curso, estado: "Activo" });
      }}
      type="button"
    >
      Activo
    </button>
    <button
      className={`offer-button ${curso.estado?.toLowerCase() === "en oferta" ? "active" : ""}`}
      onClick={(e) => {
        e.preventDefault();
        setCurso({ ...curso, estado: "En oferta" });
      }}
      type="button"
    >
      En oferta
    </button>
  </div>
</div>
                  {/* Mostrar campo empresa solo si la oferta es Cerrada */}
                  {curso.tipo_oferta === "Cerrada" && (
                    <div className='containerInput_company'>
                      <label htmlFor="nit_company">Empresa</label>
                      <input
                        id='nit_company'
                        type="text"
                        placeholder='NIT de la empresa'
                        value={empresa}
                        onChange={e => setEmpresa(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <button
                    className="addDate"
                    type="button"
                    onClick={() => setIsEditCalendarOpen(true)}
                  >
                    <img src={calendar} alt="" />
                    Editar fechas y horarios
                  </button>
                </div>
              </div>

              <button
                className="buttonCreate_Course"
                onClick={handleUpdateCourse}
              >
                Actualizar curso
              </button>
            </div>
          </div>
        </div>
      </Main>
      <Footer />
      {isEditCalendarOpen && (
        <EditCalendar
          show={isEditCalendarOpen}
          closeModal={() => setIsEditCalendarOpen(false)}
          onSave={handleCalendarSave}
          initialData={calendarData}
        />
      )}
    </>
  );
};