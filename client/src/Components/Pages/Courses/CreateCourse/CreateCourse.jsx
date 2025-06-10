import React, { useRef, useState, useEffect } from 'react';
import './CreateCourse.css';
import { Footer } from '../../../Layouts/Footer/Footer';
import { Main } from '../../../Layouts/Main/Main';
import { Header } from '../../../Layouts/Header/Header';
import { Modal_General } from '../../../UI/Modal_General/Modal_General';
import EditCalendar from '../../../UI/Modal_Calendar/EditCalendar/EditCalendar';
import addIMG from '../../../../assets/Icons/addImg.png';
import buttonEdit from '../../../../assets/Icons/buttonEdit.png';
import calendar from '../../../../assets/Icons/calendar.png';
import axiosInstance from '../../../../config/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { AssignInstructorCourse } from '../AssignInstructorCourse/AssignInstructorCourse';

export const CreateCourse = () => {
  const navigate = useNavigate();
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [selected, setSelected] = useState('cerrada');
  const [selectedStatus, setSelectedStatus] = useState('en oferta');
  const [ficha, setFicha] = useState('');
  const [nombreCurso, setNombreCurso] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [instructor_ID, setInstructor_ID] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isEditCalendarOpen, setIsEditCalendarOpen] = useState(false);
  const [calendarData, setCalendarData] = useState({
    startDate: "",
    endDate: "",
    selectedSlots: [],
  });

  // Validación de sesión de usuario y rol de administrador
  const userSessionString = sessionStorage.getItem("userSession");
  const userSession = userSessionString ? JSON.parse(userSessionString) : null;
  const acces_granted = userSessionString && (userSession.accountType === "Administrador" || userSession.accountType === "Instructor");

  useEffect(() => {
    if (!acces_granted) {
      navigate("/ProtectedRoute");
    }
  }, [acces_granted, navigate]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const showModalGeneral = () => {
    setIsEditCalendarOpen(true);
  };

  const handleCalendarSave = (data) => {
    setCalendarData(data);
  };

  const handleAssignInstructor = (instructorId) => {
    setInstructor_ID(instructorId);
    setShowAssignModal(false);
  };

  const handleCreateCourse = async () => {
    if (!ficha || !nombreCurso || !descripcion || !selected || !selectedStatus) {
      alert("Por favor, completa todos los campos requeridos.");
      return;
    }

    if (!calendarData.startDate || !calendarData.endDate || calendarData.selectedSlots.length === 0) {
      alert("Por favor, selecciona las fechas y horarios del curso.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("ficha", ficha);
      formData.append("nombre_curso", nombreCurso);
      formData.append("descripcion", descripcion);
      formData.append("tipo_oferta", selected);
      formData.append("estado", selectedStatus);
      formData.append("fecha_inicio", calendarData.startDate);
      formData.append("fecha_fin", calendarData.endDate);

      const slotsByDay = {};
      calendarData.selectedSlots.forEach(slot => {
        const [dia, hora] = slot.split('-');
        if (!slotsByDay[dia]) {
          slotsByDay[dia] = [];
        }
        slotsByDay[dia].push(hora);
      });

      let horaInicio = '23:59';
      let horaFin = '00:00';
      Object.values(slotsByDay).flat().forEach(hora => {
        if (hora < horaInicio) horaInicio = hora;
        if (hora > horaFin) horaFin = hora;
      });

      horaInicio = horaInicio.padStart(5, '0');
      horaFin = horaFin.padStart(5, '0');

      formData.append("hora_inicio", horaInicio);
      formData.append("hora_fin", horaFin);

      const diasMapping = {
        'Lun': 'Lunes',
        'Mar': 'Martes',
        'Mié': 'Miércoles',
        'Jue': 'Jueves',
        'Vie': 'Viernes',
        'Sáb': 'Sábado'
      };
      const diasSemana = Object.keys(slotsByDay).map(dia => diasMapping[dia] || dia);
      formData.append("dias_formacion", JSON.stringify(diasSemana));

      if (fileInputRef.current.files[0]) {
        formData.append("imagen", fileInputRef.current.files[0]);
      }

      if (instructor_ID) {
        formData.append("instructor_ID", instructor_ID);
      }

      console.log("Datos a enviar:", {
        ficha,
        nombre_curso: nombreCurso,
        descripcion,
        tipo_oferta: selected,
        estado: selectedStatus,
        fecha_inicio: calendarData.startDate,
        fecha_fin: calendarData.endDate,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        dias_formacion: diasSemana
      });

      const response = await axiosInstance.post("/api/courses/cursos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Curso creado con éxito");
      console.log(response.data);

      if (response.data.curso && response.data.curso.ID) {
        navigate(`/Cursos/${response.data.curso.ID}`);
      } else {
        console.error("No se pudo obtener el ID del curso creado");
        navigate('/Cursos/MisCursos');
      }
    } catch (error) {
      console.error("Error al crear el curso:", error);
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.message).join('\n');
        alert(`Errores de validación:\n${errorMessages}`);
      } else if (error.response?.data?.message) {
        alert(`Error: ${error.response.data.message}`);
      } else {
        alert("Ocurrió un error al crear el curso");
      }
    }
  };

  if (!acces_granted) {
    return null;
  }

  return (
    <>
      <Header />
      <Main>
        <div className="container_createCourse">
          <h2>
            Crear
            <span className="complementary"> Curso</span>
          </h2>

          <div className="containerInformation_CreateCourse">
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleChange}
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

            <div className='containerDetails_course'>
              <div id='containerInput_ficha'>
                <label htmlFor="fichaCourse">Ficha: </label>
                <input
                  id='fichaCourse'
                  type="text"
                  placeholder='N° ficha'
                  value={ficha}
                  onChange={(e) => setFicha(e.target.value)}
                />
              </div>
              <input
                className='addName'
                type="text"
                placeholder='Agregar nombre del curso'
                value={nombreCurso}
                onChange={(e) => setNombreCurso(e.target.value)}
              />
              <input
                className='addDetails'
                type="text"
                placeholder='Agregar descripción del curso'
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />

              <div className='containerDetails_course2'>
                <div>
                  <div className="offer-type-container">
                    <span>Tipo de oferta:</span>
                    <div className="offer-options">
                      <button
                        className={`offer-button ${selected === 'cerrada' ? 'active' : ''}`}
                        onClick={() => setSelected('cerrada')}
                      >
                        Cerrada
                      </button>
                      <button
                        className={`offer-button ${selected === 'abierta' ? 'active' : ''}`}
                        onClick={() => setSelected('abierta')}
                      >
                        Abierta
                      </button>
                    </div>
                  </div>
                  <div className="offer-type-container">
                    <span>Estado:</span>
                    <div className="offer-options">
                      <button
                        className={`offer-button ${selectedStatus === 'activo' ? 'active' : ''}`}
                        onClick={() => setSelectedStatus('activo')}
                      >
                        Activo
                      </button>
                      <button
                        className={`offer-button ${selectedStatus === 'en oferta' ? 'active' : ''}`}
                        onClick={() => setSelectedStatus('en oferta')}
                      >
                        En oferta
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <p id='p_addInstructor'>
                    Instructor: {instructor_ID ? "Asignado (ID: " + instructor_ID + ")" : "Asignar instructor"}
                    <button className='addInstructor' onClick={() => setShowAssignModal(true)}>
                      <img src={buttonEdit} alt="" />
                    </button>
                  </p>

                  <button className='addDate' onClick={showModalGeneral}>
                    <img src={calendar} alt="" />
                    Agregar fechas y horarios
                  </button>
                </div>
              </div>

              <button className='buttonCreate_Course' onClick={handleCreateCourse}>
                Crear curso
              </button>
            </div>
          </div>
        </div>
      </Main>
      <Footer />
      {showAssignModal && (
        <AssignInstructorCourse
          curso_ID={null}
          onClose={() => setShowAssignModal(false)}
          onAssign={handleAssignInstructor}
        />
      )}
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
