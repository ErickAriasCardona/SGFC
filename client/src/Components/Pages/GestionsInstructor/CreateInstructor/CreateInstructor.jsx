import React, { useRef, useState } from 'react';
import './CreateInstructor.css';
import addIMG from '../../../../assets/Icons/addImg.png';
import axiosInstance from '../../../../config/axiosInstance';
export const CreateInstructor = ({ onClose }) => {
    const fileInputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [formData, setFormData] = useState({
        nombres: '',
        apellidos: '',
        cedula: '',
        titulo_profesional: '',
        celular: '',
        email: '',
        estado: 'Inactivo', // Valor predeterminado
    });
    const [file, setFile] = useState(null);

    // Manejar cambios en los campos del formulario
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Manejar la selección de archivo
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        const reader = new FileReader();
        reader.onload = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
    };

    const closeModalCreateInstructor = () => {
        document.getElementById("modal-overlayCreateInstructor").style.display = "none";
    };

    // Enviar datos al backend
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Crear un objeto FormData
        const data = new FormData();
        data.append('foto_perfil', file);
        data.append('nombres', formData.nombres);
        data.append('apellidos', formData.apellidos);
        data.append('cedula', formData.cedula);
        data.append('titulo_profesional', formData.titulo_profesional);
        data.append('celular', formData.celular);
        data.append('email', formData.email);
        data.append('estado', formData.estado);

        try {
            const response = await axiosInstance.post('/crearInstructor', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            alert('Instructor creado con éxito');
            console.log(response.data);

            // Cerrar el modal y recargar la página
            document.getElementById("modal-overlayCreateInstructor").style.display = "none";
            window.location.reload();
        } catch (error) {
            console.error('Error al crear el instructor:', error);
            const errorMsg = error.response?.data?.message || 'Hubo un problema al crear el instructor.';
            alert(`Error: ${errorMsg}`);
        }
    };

    return (
        <div id="modal-overlayCreateInstructor">
            <form className="modal-bodyCreateInstructor" onSubmit={handleSubmit}>
                <div className="modal-left">
                    <label>
                        Nombres
                        <input
                            type="text"
                            name="nombres"
                            value={formData.nombres}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        Apellidos
                        <input
                            type="text"
                            name="apellidos"
                            value={formData.apellidos}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        Cédula
                        <input
                            type="text"
                            name="cedula"
                            value={formData.cedula}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        Título
                        <input
                            type="text"
                            name="titulo_profesional"
                            value={formData.titulo_profesional}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        Celular
                        <input
                            type="text"
                            name="celular"
                            value={formData.celular}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                    <label>
                        Email
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </label>
                </div>

                <div className="modal-right">
                    <input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        hidden
                    />

                    <label
                        className="upload-area"
                        onClick={() => fileInputRef.current.click()}
                    >
                        {preview ? (
                            <img src={preview} alt="Vista previa" className="preview-image" />
                        ) : (
                            <div className="upload-placeholder">
                                <img src={addIMG} alt="icono agregar imagen" className="icon" />
                                <p>Arrastra o sube la foto del curso aquí.</p>
                            </div>
                        )}
                    </label>

                    <div className="status-container">
                        <span>Estado:</span>
                        <div className="status-buttons">
                            <button
                                type="button"
                                className={`status ${formData.estado === 'Activo' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, estado: 'Activo' })}
                            >
                                Activo
                            </button>
                            <button
                                type="button"
                                className={`status ${formData.estado === 'Inactivo' ? 'active' : ''}`}
                                onClick={() => setFormData({ ...formData, estado: 'Inactivo' })}
                            >
                                Inactivo
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="save-button">
                        Guardar
                    </button>
                </div>

                <div className="container_return_CreateInstructor">
                    <h5>Volver</h5>
                    <button type="button" onClick={closeModalCreateInstructor} className="closeModal"></button>
                </div>
            </form>
        </div>
    );
};