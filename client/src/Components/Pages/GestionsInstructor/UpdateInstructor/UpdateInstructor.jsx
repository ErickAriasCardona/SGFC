import React, { useState, useEffect } from 'react';
import './UpdateInstructor.css';
import axiosInstance from '../../../../config/axiosInstance'; // Asegúrate de ajustar esta ruta según la estructura de tu proyecto

export const UpdateInstructor = ({ instructor }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ ...instructor });
    const [cantidadCursos, setCantidadCursos] = useState(0);

    useEffect(() => {
        const obtenerCursosAsignados = async () => {
            try {
                console.log('ID del instructor seleccionado:', instructor.ID); // 👈 Valida el ID aquí

                const response = await axiosInstance.get(`/api/courses/cursos-asignados/${instructor.ID}`);
                console.log('Cursos asignados:', response.data); // 👈 Aquí puedes ver lo que devuelve el backend

                if (Array.isArray(response.data)) {
                    setCantidadCursos(response.data.length);
                } else {
                    setCantidadCursos(0);
                }
            } catch (error) {
                console.error('Error al obtener los cursos asignados:', error);
                setCantidadCursos(0); // en caso de error, asumimos 0
            }
        };
    
        if (instructor?.ID) {
            obtenerCursosAsignados();
        }
    }, [instructor]);
    
    const closeModalUpdateInstructor = () => {
        document.getElementById("modal-overlayUpdateInstructor").style.display = "none";
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                foto_perfil: file,
            }));
        }
    };

    const handleEstadoChange = (estado) => {
        setFormData(prev => ({ ...prev, estado }));
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
                    if (key === 'foto_perfil') {
                        if (formData[key] instanceof File) {
                            formDataToSend.append(key, formData[key]);
                        }
                    } else {
                        formDataToSend.append(key, formData[key]);
                    }
                }
            }

            const response = await axiosInstance.put(`/api/users/instructores/${instructor.ID}`, {
                ...formDataToSend,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            alert(response.data.message || 'Perfil actualizado');
            setIsEditing(false);

            //Recargar la página para reflejar cambios
            window.location.reload();
            //Ocultar el modal
            document.getElementById("modal-overlayUpdateInstructor").style.display = "none";


        } catch (error) {
            console.error("Error al actualizar el perfil:", error.response?.data || error.message);
            alert("Hubo un error al actualizar el perfil.");
        }

    };

    return (
        <div id="modal-overlayUpdateInstructor" style={{ display: 'flex' }}>
            <form className="modal-bodyUpdateInstructor" onSubmit={handleButtonClick}>
                <div className="modal-left-update">
                    {['nombres', 'apellidos', 'cedula', 'titulo_profesional', 'celular', 'email'].map((field) => (
                        <label key={field}>
                            {field.charAt(0).toUpperCase() + field.slice(1).replace('_', ' ')}
                            <input
                                type={field === 'email' ? 'email' : 'text'}
                                name={field}
                                value={formData[field] || ''}
                                readOnly={!isEditing}
                                onChange={handleChange}
                                className={`form-input ${!isEditing ? 'read-only' : ''}`}
                            />

                        </label>
                    ))}
                </div>

                <div className="modal-right">
                    <input
                        type="file"
                        accept="image/*"
                        hidden={!isEditing}
                        disabled={!isEditing}
                        onChange={handleImageChange}
                        id="imageUpload"
                    />

                    <label
                        className={`upload-area-update ${!isEditing ? 'read-only-border' : ''}`}
                        htmlFor="imageUpload"
                    >                        {formData.foto_perfil instanceof File ? (
                        <img
                            src={URL.createObjectURL(formData.foto_perfil)}
                            alt="Vista previa"
                            className="preview-image"
                        />
                    ) : formData.foto_perfil ? (
                        <img
                            src={formData.foto_perfil}
                            alt="Foto de perfil"
                            className="preview-image-update"
                        />
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
                                ['Activo', 'Inactivo'].map((estado) => (
                                    <button
                                        key={estado}
                                        type="button"
                                        className={`status ${formData.estado === estado ? 'active' : ''}`}
                                        onClick={() => handleEstadoChange(estado)}
                                    >
                                        {estado}
                                    </button>
                                ))
                            ) : (
                                <button
                                    type="button"
                                    className="status active"
                                >
                                    {formData.estado}
                                </button>
                            )}
                        </div>
                    </div>
                    <p className='cursosAsignados'>Cursos Asignados: {cantidadCursos}</p>


                    <button type="submit" className="edit-button-updateInstructor">
                        {isEditing ? 'Guardar Cambios' : 'Actualizar Perfil'}
                    </button>
                </div>

                <div className="container_return_UpdateInstructor">
                    <h5>Volver</h5>
                    <button type="button" onClick={closeModalUpdateInstructor} className="closeModal"></button>
                </div>
            </form>
        </div>
    );
};
