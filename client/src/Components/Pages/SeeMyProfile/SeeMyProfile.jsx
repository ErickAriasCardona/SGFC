import React, { useEffect, useState } from 'react';
import './SeeMyProfile.css';
import { useLocation } from 'react-router-dom';

import { Header } from '../../../Components/Layouts/Header/Header';
import { Footer } from '../../../Components/Layouts/Footer/Footer';
import { Main } from '../../../Components/Layouts/Main/Main';
import axiosInstance from '../../../config/axiosInstance';

export const SeeMyProfile = () => {
    const location = useLocation();
    const userId = location.state?.userId;

    const [perfil, setPerfil] = useState(null);
    const [tipoCuenta, setTipoCuenta] = useState('');
    const [editMode, setEditMode] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axiosInstance.get(`/perfil/${userId}`);
                setPerfil(response.data);
                setTipoCuenta(response.data.accountType);
            } catch (error) {
                console.error('Error al obtener el perfil:', error);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith("Empresa.")) {
            const key = name.split(".")[1];
            setPerfil((prevPerfil) => ({
                ...prevPerfil,
                Empresa: {
                    ...prevPerfil.Empresa,
                    [key]: value,
                },
            }));
        } else {
            setPerfil({ ...perfil, [name]: value });
        }
    };


    const handleSaveChanges = async () => {
        try {
            // Clonamos el perfil
            const payload = { ...perfil };

            // Si es una empresa, serializamos el objeto Empresa
            if (tipoCuenta === 'Empresa' && perfil.Empresa) {
                payload.empresa = JSON.stringify(perfil.Empresa);
            }

            await axiosInstance.put(`/perfil/actualizar/${userId}`, payload);
            alert('Perfil actualizado con éxito');
            setEditMode(false);
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            alert('Hubo un error al actualizar el perfil');
        }
    };

    return (
        <>
            <Header />
            <Main>
                <div className='container_mainSeeMyProfile'>
                    <div className='container_profile'>
                        <h3>{tipoCuenta}</h3>
                        <img src="" alt="" />
                        <h4>Datos <span>{tipoCuenta}</span></h4>

                        <p>
                            Nombres <br />
                            {editMode ? (
                                <input
                                    type="text"
                                    name="nombres"
                                    className='input_updateData'
                                    value={perfil?.nombres || ''}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                perfil?.nombres || ''
                            )}
                        </p>

                        <p>
                            Apellidos <br />
                            {editMode ? (
                                <input
                                    type="text"
                                    name="apellidos"
                                    className='input_updateData'
                                    value={perfil?.apellidos || ''}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                perfil?.apellidos || ''
                            )}
                        </p>

                        <p>
                            Email <br />
                            {editMode ? (
                                <input
                                    type="email"
                                    name="email"
                                    className='input_updateData'
                                    value={perfil?.email || ''}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                perfil?.email || ''
                            )}
                        </p>

                        <p>
                            Celular <br />
                            {editMode ? (
                                <input
                                    type="text"
                                    name="celular"
                                    className='input_updateData'
                                    value={perfil?.celular || ''}
                                    onChange={handleInputChange}
                                />
                            ) : (
                                perfil?.celular || ''
                            )}
                        </p>

                        <button className='updateProfile' onClick={() => setEditMode(!editMode)}>
                            {editMode ? 'Cancelar' : 'Actualizar Perfil'}
                        </button>

                        {editMode && (
                            <button className='updateProfile' onClick={handleSaveChanges}>
                                Guardar Cambios
                            </button>
                        )}
                        
                    </div>
                    {tipoCuenta === 'Empresa' && (
                        <div className='container_data_company'>
                            <div className='name_company'>
                                <img src="" alt="" />
                                <div>
                                    <h3>
                                        {editMode ? (
                                            <input
                                                type="text"
                                                name="Empresa.nombre_empresa"
                                                className='input_updateData'
                                                value={perfil?.Empresa?.nombre_empresa || ''}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            perfil?.Empresa?.nombre_empresa || ''
                                        )}
                                    </h3>
                                    <p>
                                        Nit: <br />
                                        {editMode ? (
                                            <input
                                                type="text"
                                                name="Empresa.NIT"
                                                className='input_updateData'
                                                value={perfil?.Empresa?.NIT || ''}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            perfil?.Empresa?.NIT || ''
                                        )}
                                    </p>
                                </div>
                            </div>

                            <div className='container_data'>
                                <div className='data_company'>
                                    <p>
                                        Dirección: <br />
                                        {editMode ? (
                                            <input
                                                type="text"
                                                name="Empresa.direccion"
                                                className='input_updateData'
                                                value={perfil?.Empresa?.direccion || ''}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            perfil?.Empresa?.direccion || ''
                                        )}

                                    </p>
                                    <p>Teléfono: <br />
                                        {editMode ? (
                                            <input
                                                type="text"
                                                name="Empresa.telefono"
                                                className='input_updateData'
                                                value={perfil?.Empresa?.telefono || ''}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            perfil?.Empresa?.telefono || ''
                                        )}
                                    </p>
                                    <p>Email: <br />
                                        {editMode ? (
                                            <input
                                                type="text"
                                                name="Empresa.email_empresa"
                                                className='input_updateData'
                                                value={perfil?.Empresa?.email_empresa || ''}
                                                onChange={handleInputChange}
                                            />
                                        ) : (
                                            perfil?.Empresa?.email_empresa || ''
                                        )}
                                    </p>
                                    <p>Ciudad: <br />
                                        {perfil?.Empresa?.Ciudad?.nombre || '-'}

                                    </p>

                                    <p>Departamento <br />
                                        {perfil?.Empresa?.Ciudad?.Departamento?.nombre || '-'}

                                    </p>
                                </div>

                                <div className='data_courses_instructor'>
                                    <div className='data_courses'>
                                        {/* Aquí puedes colocar cursos si los tienes disponibles */}
                                    </div>
                                    <div className='data_instructor'>
                                        {/* Aquí puedes colocar datos adicionales del instructor si aplica */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Main>
            <Footer />
        </>
    );
};
