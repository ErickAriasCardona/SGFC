import React, { useState, useEffect } from 'react';
import './VCalendar.css'; // Reuse styles from EditCalendar
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const times = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
  '20:00', '21:00', '22:00'
];

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const dayAbbreviations = {
  'Lunes': 'Lun',
  'Martes': 'Mar',
  'Miércoles': 'Mié',
  'Jueves': 'Jue',
  'Viernes': 'Vie',
  'Sábado': 'Sáb'
};

export const ViewCalendar = ({ calendarData, closeModal }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [daysWithSchedule, setDaysWithSchedule] = useState([]);
  const [horaInicio, setHoraInicio] = useState('');
  const [horaFin, setHoraFin] = useState('');

  useEffect(() => {
    if (calendarData) {
      console.log('Datos del calendario recibidos:', calendarData);
      setStartDate(calendarData.startDate || '');
      setEndDate(calendarData.endDate || '');
      
      // Procesar los días de formación
      if (Array.isArray(calendarData.selectedSlots)) {
        setDaysWithSchedule(calendarData.selectedSlots);
      }

      // Crear slots basados en los días y el rango de horas
      if (calendarData.hora_inicio && calendarData.hora_fin) {
        setHoraInicio(calendarData.hora_inicio);
        setHoraFin(calendarData.hora_fin);
        
        const newSlots = new Set();
        calendarData.selectedSlots.forEach(dia => {
          times.forEach(time => {
            if (time >= calendarData.hora_inicio && time <= calendarData.hora_fin) {
              newSlots.add(`${dia}-${time}`);
            }
          });
        });
        setSelectedSlots(newSlots);
      }
    }
  }, [calendarData]);

  return (
    <div className="modal-overlay">
      <div className="modal-content calendar-modal">
        <div className="modal-header">
          <h3>Horario del Curso</h3>
          <button className="close-button" onClick={closeModal}>×</button>
        </div>

        <div className="calendar-wrapper">
          {/* Información de fechas */}
          <div className="date-inputs organized-date-inputs">
            <div className="date-display">
              <label>Fecha inicio:</label>
              <input
                type="date"
                value={startDate ? new Date(startDate).toISOString().split('T')[0] : ''}
                readOnly
                disabled
              />
            </div>
            <div className="date-display">
              <label>Fecha fin:</label>
              <input
                type="date"
                value={endDate ? new Date(endDate).toISOString().split('T')[0] : ''}
                readOnly
                disabled
              />
            </div>
          </div>
          <div className="calendar-card-wrapper">
            <div className="calendar-card layered-card card1"></div>
            <div className="calendar-card layered-card card2"></div>
            <div className="calendar-card layered-card card3"></div>
          </div>
          <div className="calendar-container">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th></th>
                  {days.map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {times.map((time) => (
                  <tr key={time}>
                    <td>{time}</td>
                    {days.map((day) => {
                      const slot = `${day}-${time}`;
                      const isSelected = selectedSlots.has(slot);
                      return (
                        <td
                          key={slot}
                          className={`slot-cell ${isSelected ? 'selected' : ''}`}
                        >
                          {isSelected ? <span className="approve-icon">✓</span> : <span className="empty-slot"></span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table> </div>

          {/* Horario del curso */}
          <div className="schedule-section">
            <h4>Horario:</h4>
            <p>De {horaInicio} a {horaFin}</p>
            
            <h4>Días de formación:</h4>
            <ul className="days-list">
              {daysWithSchedule.map((dia, index) => (
                <li key={index}>{dia}</li>
              ))}
            </ul>
          </div>

          {/* Calendario de slots */}
          <div className="calendar-container">
            <table className="calendar-table">
              <thead>
                <tr>
                  <th></th>
                  {days.map(day => (
                    <th key={day}>{dayAbbreviations[day]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {times.map(time => (
                  <tr key={time}>
                    <td className="time-cell">{time}</td>
                    {days.map(day => {
                      const slot = `${day}-${time}`;
                      const isSelected = selectedSlots.has(slot);
                      const isDayWithSchedule = daysWithSchedule.includes(day);
                      return (
                        <td
                          key={slot}
                          className={`calendar-day 
                            ${isDayWithSchedule ? 'training-day' : ''} 
                            ${isSelected ? 'selected' : ''}`}
                        />
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Leyenda */}
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot day-with-schedule"></span>
              <span>Día con horarios</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot selected"></span>
              <span>Horario seleccionado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewCalendar;