import React, { useEffect, useState } from 'react';
import './SeeMyProfile.css'
import { useLocation } from 'react-router-dom';

import { Header } from '../../../Components/Layouts/Header/Header';
import { Footer } from '../../../Components/Layouts/Footer/Footer';
import { Main } from '../../../Components/Layouts/Main/Main';
import axios from 'axios';

export const SeeMyProfile = () => {

    const location = useLocation();
    const userId = location.state?.userId;

    const [perfil, setPerfil] = useState(null);
    const [tipoCuenta, setTipoCuenta] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/perfil/${userId}`);
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

    return (

        <>
            <Header />
            <Main>
                <div className='container_mainSeeMyProfile'>
                    <div className='container_profile'>
                        <h3>{tipoCuenta}</h3>
                        <img src="" alt="" />
                        <h4>Datos <span>{tipoCuenta}</span></h4>
                        <p>Nombres <br />{perfil?.nombres || ''}</p>
                        <p>Apellidos <br /> {perfil?.apellidos || ''}</p>
                        <p>Email <br />{perfil?.email || ''}</p>
                        <p>Celular <br /> {perfil?.celular || ''}</p>
                    </div>

                    <div className='container_data_company'>
                        <div className='name_company'>
                            <img src="" alt="" />
                            <div>
                                <h3>{perfil?.Sena?.nombre_sede || '-'} </h3>
                                <p>Nit: {perfil?.Sena?.NIT || 'NIT SENA'}</p>
                            </div>
                        </div>
                        <div className='container_data'>
                            <div className='data_company'>
                                <p>Dirección: <br />{perfil?.Sena?.direccion || '-'}</p>
                                <p>Teléfono: <br />{perfil?.Sena?.telefono || '-'}</p>
                                <p>Email: <br />{perfil?.Sena?.email_sena || '-'}</p>
                                <p>Ciudad: <br />{perfil?.Sena?.Ciudad?.nombre || '-'}</p>
                                <p> Departamento <br />{perfil?.Sena?.Ciudad?.Departamento?.nombre || '-'}</p>
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
                </div>

            </Main >
            <Footer />
        </>

    )
}
