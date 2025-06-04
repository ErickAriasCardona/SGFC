import React, { useState, useEffect } from 'react';
import './VCalendar.css'; // Reuse styles from EditCalendar
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const times = [
  '6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
];
const days = ['Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'];

export const ViewCalendar = ({ calendarData, closeModal }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [daysWithSchedule, setDaysWithSchedule] = useState(new Set());

  useEffect(() => {
    if (calendarData) {
      console.log('Datos del calendario recibidos:', calendarData);
      setStartDate(calendarData.startDate || '');
      setEndDate(calendarData.endDate || '');
      
      // Procesar los slots seleccionados
      if (Array.isArray(calendarData.selectedSlots)) {
        console.log('Slots seleccionados (raw):', calendarData.selectedSlots);
        
        // Crear un Set con los días que tienen horarios
        const daysSet = new Set();
        const slotsSet = new Set();
        
        calendarData.selectedSlots.forEach(slot => {
          console.log('Procesando slot:', slot);
          const [day, time] = slot.split('-');
          if (day && time) {
            const normalizedDay = day.toLowerCase();
            daysSet.add(normalizedDay);
            slotsSet.add(slot);
            console.log(`Agregado día: ${normalizedDay}, horario: ${time}`);
          }
        });
        
        console.log('Set de días con horarios:', Array.from(daysSet));
        console.log('Set de slots seleccionados:', Array.from(slotsSet));
        
        setDaysWithSchedule(daysSet);
        setSelectedSlots(slotsSet);
      } else {
        console.warn('selectedSlots no es un array:', calendarData.selectedSlots);
      }
    }
  }, [calendarData]);

  // Función para verificar si un día tiene horarios seleccionados
  const hasSelectedTime = (day) => {
    const hasSchedule = daysWithSchedule.has(day.toLowerCase());
    console.log(`Verificando día ${day}:`, hasSchedule, 'días disponibles:', Array.from(daysWithSchedule));
    return hasSchedule;
  };

  // Función para verificar si un slot específico está seleccionado
  const isSlotSelected = (day, time) => {
    const slotKey = `${day}-${time}`;
    const isSelected = selectedSlots.has(slotKey);
    console.log(`Verificando slot ${slotKey}:`, isSelected, 'slots disponibles:', Array.from(selectedSlots));
    return isSelected;
  };

  // Función para obtener los horarios de un día específico
  const getDaySchedule = (day) => {
    const daySlots = Array.from(selectedSlots).filter(slot => 
      slot.toLowerCase().startsWith(day.toLowerCase())
    );
    return daySlots.map(slot => slot.split('-')[1]);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-background">
        <div className="modal-container calendar-modal centered-modal">
          <button className="close-button" onClick={closeModal}>Cerrar</button>
          <h2 className="modal-title">
            Fechas y <span className="highlight">horarios</span>
          </h2>

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

          {/* Calendario de slots */}
          <div className="calendar-container">          
            <table className="calendar-table">
              <thead>
                <tr>
                  <th></th>
                  {days.map((day) => {
                    const hasSchedule = hasSelectedTime(day);
                    console.log(`Verificando día ${day}:`, hasSchedule);
                    return (
                      <th 
                        key={day} 
                        className={hasSchedule ? 'day-with-schedule' : ''}
                      >
                        {day}
                        {hasSchedule && (
                          <span 
                            className="day-indicator" 
                            title="Día con horarios seleccionados"
                          >•</span>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {times.map((time) => (
                  <tr key={time}>
                    <td className="time-cell">{time}</td>
                    {days.map((day) => {
                      const isSelected = isSlotSelected(day, time);
                      const dayHasSchedule = hasSelectedTime(day);
                      return (
                        <td
                          key={`${day}-${time}`}
                          className={`slot-cell ${dayHasSchedule ? 'day-with-schedule' : ''} ${isSelected ? 'selected' : ''}`}
                        >
                          {isSelected && (
                            <div className="selected-slot">
                              <span className="time-range">{time}</span>
                            </div>
                          )}
                        </td>
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