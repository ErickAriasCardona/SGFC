import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Main } from '../../../Layouts/Main/Main';
import { Footer } from '../../../Layouts/Footer/Footer';
import axiosInstance from '../../../../config/axiosInstance';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { AttendanceManagement } from '../SeeCourse/AttendanceManagement';
import { MonthlyCalendar } from '../../../UI/Modal_Calendar/ViewCalendar/MonthlyCalendar';
import './ManageAttendance.css';

export const ManageAttendance = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [curso, setCurso] = useState(null);
    const [selectedDate, setSelectedDate] = useState('');
    const [showAttendanceManagement, setShowAttendanceManagement] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCurso = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const response = await axiosInstance.get(`/api/courses/cursos/${id}`);
                console.log('Datos del curso recibidos:', response.data);
                setCurso(response.data);
            } catch (error) {
                console.error("Error al obtener el curso:", error);
                setError("Error al cargar los datos del curso. Por favor, intente nuevamente.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCurso();
    }, [id]);

    const handleDateSelect = (date) => {
        if (date) {
            setSelectedDate(date);
            setShowAttendanceManagement(true);
        }
    };

    const handleCloseAttendanceManagement = () => {
        setShowAttendanceManagement(false);
        setSelectedDate('');
    };

    const handleMonthChange = (direction) => {
        setCurrentMonth(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(prev.getMonth() - 1);
            } else {
                newDate.setMonth(prev.getMonth() + 1);
            }
            return newDate;
        });
    };

    if (isLoading) {
        return (
            <Main>
                <div className="manage-attendance-container">
                    <p>Cargando datos del curso...</p>
                </div>
            </Main>
        );
    }

    if (error) {
        return (
            <Main>
                <div className="manage-attendance-container">
                    <p className="error-message">{error}</p>
                    <button 
                        className="back-button"
                        onClick={() => navigate(`/Cursos/${id}`)}
                    >
                        Volver al curso
                    </button>
                </div>
            </Main>
        );
    }

    if (!curso) {
        return (
            <Main>
                <div className="manage-attendance-container">
                    <p>No se encontró información del curso.</p>
                    <button 
                        className="back-button"
                        onClick={() => navigate(`/Cursos/${id}`)}
                    >
                        Volver al curso
                    </button>
                </div>
            </Main>
        );
    }

    if (!curso.fecha_inicio || !curso.fecha_fin) {
        return (
            <Main>
                <div className="manage-attendance-container">
                    <p>El curso no tiene fechas definidas.</p>
                    <button 
                        className="back-button"
                        onClick={() => navigate(`/Cursos/${id}`)}
                    >
                        Volver al curso
                    </button>
                </div>
            </Main>
        );
    }

    return (
        <>
            <Main>
                <div className="manage-attendance-container">
                    <div className="attendance-header">
                        <h2>Gestión de Asistencia</h2>
                        <h3 className="course-name">{curso.nombre_curso}</h3>
                    </div>
                    
                    <div className="attendance-content">
                        <div className="calendar-section">
                            <div className="calendar-wrapper">
                                <button 
                                    className="close-button"
                                    onClick={() => navigate(`/Cursos/${id}`)}
                                >
                                    Volver
                                </button>
                                <MonthlyCalendar
                                    currentMonth={currentMonth}
                                    onMonthChange={handleMonthChange}
                                    selectedDate={selectedDate}
                                    onDateSelect={handleDateSelect}
                                    dateRange={{
                                        start: curso.fecha_inicio,
                                        end: curso.fecha_fin
                                    }}
                                />
                            </div>

                            <div className="course-info-section">
                                <div className="course-info-card">
                                    <h4>Información del Curso</h4>
                                    <div className="info-content">
                                        <div className="info-row">
                                            <span className="info-label">Ficha:</span>
                                            <span className="info-value">{curso.ficha}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Fecha de inicio:</span>
                                            <span className="info-value">
                                                {format(parseISO(curso.fecha_inicio), 'dd/MM/yyyy', { locale: es })}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Fecha de fin:</span>
                                            <span className="info-value">
                                                {format(parseISO(curso.fecha_fin), 'dd/MM/yyyy', { locale: es })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Main>
            <Footer />

            {selectedDate && (
                <AttendanceManagement
                    open={showAttendanceManagement}
                    onClose={handleCloseAttendanceManagement}
                    courseId={curso.ID}
                    selectedDate={selectedDate}
                />
            )}
        </>
    );
}; 