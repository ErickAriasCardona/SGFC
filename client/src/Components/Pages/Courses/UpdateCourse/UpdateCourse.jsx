import React, { useEffect, useRef, useState } from 'react';
import './UpdateCourse.css';
import { Footer } from '../../../Layouts/Footer/Footer';
import { Main } from '../../../Layouts/Main/Main';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../../../config/axiosInstance';
import addIMG from '../../../../assets/Icons/addImg.png';

export const UpdateCourse = () => {
    const { id } = useParams(); // Obtener el ID del curso desde la URL
    const navigate = useNavigate(); // Hook para redirigir
    const [curso, setCurso] = useState(null); // Estado para almacenar los datos del curso
    const [preview, setPreview] = useState(null); // Vista previa de la imagen
    const fileInputRef = useRef(null);

    // Obtener los datos del curso al cargar la página
    useEffect(() => {
        const fetchCurso = async () => {
            try {
                const response = await axiosInstance.get(`/api/courses/cursos/${id}`); // Obtener los datos del curso
                setCurso(response.data);
                setPreview(response.data.imagen ? `http://localhost:3001${response.data.imagen}` : null);
            } catch (error) {
                console.error("Error al obtener el curso:", error);
            }
        };

        fetchCurso();
    }, [id]);

    // Manejar la actualización del curso
    const handleUpdateCourse = async () => {
        try {
          // Crear el objeto con los datos del curso
          const updatedCurso = {
            ficha: curso.ficha,
            nombre_curso: curso.nombre_curso,
            descripcion: curso.descripcion,
            tipo_oferta: curso.tipo_oferta,
            estado: curso.estado,
            fecha_inicio: curso.fecha_inicio || "",
            fecha_fin: curso.fecha_fin || "",
            hora_inicio: curso.hora_inicio || "",
            hora_fin: curso.hora_fin || "",
            dias_formacion: curso.dias_formacion || "",
            lugar_formacion: curso.lugar_formacion || "",
          };
      
          // Verificar los datos antes de enviarlos
          console.log("Datos enviados al backend:", updatedCurso);
      
          // Enviar la solicitud PUT al backend
          const response = await axiosInstance.put(`/api/courses/cursos/${id}`, updatedCurso, {
            headers: {
              "Content-Type": "application/json",
            },
          });
      
          // Verificar la respuesta del backend
          console.log("Respuesta del backend:", response.data);
      
          if (response.status === 200) {
            alert("Curso actualizado con éxito");
            navigate(`/Cursos/${id}`); // Redirigir a la página del curso
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
            <Main>
                <div className='container_createCourse'>
                    <h2>
                        Actualizar
                        <span className='complementary'> Curso</span>
                    </h2>

                    <div className='containerInformation_CreateCourse'>
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
                                    value={curso.ficha || ""}
                                    onChange={(e) => setCurso({ ...curso, ficha: e.target.value })}
                                />
                            </div>
                            <input
                                className='addName'
                                type="text"
                                value={curso.nombre_curso || ""}
                                onChange={(e) => {
                                    setCurso({ ...curso, nombre_curso: e.target.value });
                                    console.log("Nuevo nombre del curso:", e.target.value);
                                }}
                            />
                            <input
                                className='addDetails'
                                type="text"
                                value={curso.descripcion || ""}
                                onChange={(e) => setCurso({ ...curso, descripcion: e.target.value })}
                            />

                            <div className='containerDetails_course2'>
                                <div>
                                    <div className="offer-type-container">
                                        <span>Tipo de oferta:</span>
                                        <div className="offer-options">
                                            <button
                                                className={`offer-button ${curso.tipo_oferta === 'Cerrada' ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurso({ ...curso, tipo_oferta: 'Cerrada' });
                                                }}
                                            >
                                                Cerrada
                                            </button>
                                            <button
                                                className={`offer-button ${curso.tipo_oferta === 'Abierta' ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurso({ ...curso, tipo_oferta: 'Abierta' });
                                                }}
                                            >
                                                Abierta
                                            </button>
                                        </div>
                                    </div>
                                    <div className="offer-type-container">
                                        <span>Estado:</span>
                                        <div className="offer-options">
                                            <button
                                                className={`offer-button ${curso.estado === 'Activo' ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurso({ ...curso, estado: 'Activo' });
                                                }}
                                            >
                                                Activo
                                            </button>
                                            <button
                                                className={`offer-button ${curso.estado === 'En oferta' ? 'active' : ''}`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setCurso({ ...curso, estado: 'En oferta' });
                                                }}
                                            >
                                                En oferta
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className='buttonCreate_Course' onClick={handleUpdateCourse}>
                                Actualizar curso
                            </button>
                        </div>
                    </div>
                </div>
            </Main>
            <Footer />
        </>
    );
};