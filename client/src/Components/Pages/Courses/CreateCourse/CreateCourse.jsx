import React, { useRef, useState } from 'react';
import './CreateCourse.css';
import { Header } from '../../../Layouts/Header/Header';
import { Footer } from '../../../Layouts/Footer/Footer';
import { Main } from '../../../Layouts/Main/Main';
import { Modal_General } from '../../../UI/Modal_General/Modal_General';
import { EditCalendar } from '../../../UI/Modal_Calendar/EditCalendar/EditCalendar';
import addIMG from '../../../../assets/Icons/addImg.png';
import buttonEdit from '../../../../assets/Icons/buttonEdit.png';
import calendar from '../../../../assets/Icons/calendar.png';
import axiosInstance  from '../../../../config/axiosInstance'; 

export const CreateCourse = () => {
    const [preview, setPreview] = useState(null);
    const fileInputRef = useRef(null);
    const [selected, setSelected] = useState('Cerrada');
    const [selectedStatus, setSelectedStatus] = useState('En oferta');
    const [ficha, setFicha] = useState('');
    const [nombreCurso, setNombreCurso] = useState('');
    const [descripcion, setDescripcion] = useState('');

    // New state for calendar data
    const [calendarData, setCalendarData] = useState({
      startDate: '',
      endDate: '',
      selectedSlots: [],
    });

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    // Función para abrir el modal general
    const [isEditCalendarOpen, setIsEditCalendarOpen] = React.useState(false);

    const showModalGeneral = () => {
        setIsEditCalendarOpen(true);
    };

    // Callback to receive calendar data from EditCalendar
    const handleCalendarSave = (data) => {
      setCalendarData(data);
    };

    // Función para manejar la creación del curso
    const handleCreateCourse = async () => {
      if (!ficha || !nombreCurso || !descripcion || !selected || !selectedStatus) {
        alert("Por favor, completa todos los campos requeridos.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("ficha", ficha);
        formData.append("nombre_curso", nombreCurso);
        formData.append("descripcion", descripcion);
        formData.append("tipo_oferta", selected);
        formData.append("estado", selectedStatus);

        // Append calendar data fields if available
        if (calendarData.startDate) {
          formData.append("fecha_inicio", calendarData.startDate);
        }
        if (calendarData.endDate) {
          formData.append("fecha_fin", calendarData.endDate);
        }
        if (calendarData.selectedSlots.length > 0) {
          // For simplicity, send selectedSlots as JSON string
          formData.append("dias_formacion", JSON.stringify(calendarData.selectedSlots));
        }

        if (fileInputRef.current.files[0]) {
          formData.append("imagen", fileInputRef.current.files[0]);
        }

        const response = await axiosInstance.post("/cursos", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        alert("Curso creado con éxito");
        console.log(response.data);

        // Recargar la página o limpiar el formulario
        window.location.reload();
      } catch (error) {
        console.error("Error al crear el curso:", error);
        alert("Ocurrió un error al crear el curso");
      }
    };
    return (
        <>
            <Header />
            <Main>
                <div className='container_createCourse'>
                    <h2>
                        Crear
                        <span className='complementary'> Curso</span>
                    </h2>

                    <div className='containerInformation_CreateCourse'>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleChange}
                            hidden
                        />

                        <label
                            className='upload-area'
                            onClick={() => fileInputRef.current.click()}
                        >
                            {preview ? (
                                <img src={preview} alt="Vista previa" className="preview-image" />
                            ) : (
                                <div className='upload-placeholder'>
                                    <img src={addIMG} alt="icono agregar imagen" className="icon" />
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
                                                className={`offer-button ${selected === 'Cerrada' ? 'active' : ''}`}
                                                onClick={() => setSelected('Cerrada')}
                                            >
                                                Cerrada
                                            </button>
                                            <button
                                                className={`offer-button ${selected === 'Abierta' ? 'active' : ''}`}
                                                onClick={() => setSelected('Abierta')}
                                            >
                                                Abierta
                                            </button>
                                        </div>
                                    </div>
                                    <div className="offer-type-container">
                                        <span>Estado:</span>
                                        <div className="offer-options">
                                            <button
                                                className={`offer-button ${selectedStatus === 'Activo' ? 'active' : ''}`}
                                                onClick={() => setSelectedStatus('Activo')}
                                            >
                                                Activo
                                            </button>
                                            <button
                                                className={`offer-button ${selectedStatus === 'En oferta' ? 'active' : ''}`}
                                                onClick={() => setSelectedStatus('En oferta')}
                                            >
                                                En oferta
                                            </button>
                                        </div>
                                    </div>
                                    <div className='containerInput_company'>
                                        <label htmlFor="nit_company">Empresa</label>
                                        <input id='nit_company' type="text" placeholder='NIT de la empresa' />
                                    </div>
                                </div>

                                <div>
                                    <p id='p_addInstructor'> Instructor: Asignar instructor
                                        <button className='addInstructor'>
                                            <img src={buttonEdit} alt="" />
                                        </button>
                                    </p>

                                    {/* Botón para abrir el modal general */}
                                    <button className='addDate' onClick={showModalGeneral}>
                                        <img src={calendar} alt="" />
                                        Agregar fechas y horarios
                                    </button>
                                </div>
                            </div>

                            {/* Botón para crear el curso */}
                            <button className='buttonCreate_Course' onClick={handleCreateCourse}>
                                Crear curso
                            </button>
                        </div>
                    </div>
                </div>
            </Main>
            <Footer />

            {/* Edit Calendar Modal */}
            {isEditCalendarOpen && (
                <EditCalendar
                  closeModal={() => setIsEditCalendarOpen(false)}
                  onSave={handleCalendarSave}
                  initialData={calendarData}
                />
            )}
        </>
    );
};
