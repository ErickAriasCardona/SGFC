import React, { useState, useEffect } from 'react';
import './VCalendar.css'; // Reuse styles from EditCalendar

const times = [
  '6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
];
const days = ['Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'];

export const ViewCalendar = ({ calendarData, closeModal }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  useEffect(() => {
    if (calendarData) {
      setStartDate(calendarData.startDate || '');
      setEndDate(calendarData.endDate || '');
      setSelectedSlots(new Set(calendarData.selectedSlots || []));
    }
  }, [calendarData]);

  return (
    <div className="modal-overlay">
      <div className="modal-background">
        <div className="modal-container calendar-modal centered-modal">
          <button className="close-button" onClick={closeModal}>Cerrar</button>
          <h2 className="modal-title">
            Fechas y <span className="highlight">horarios</span>
          </h2>
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

        </div>
      </div>
    </div>
  );
};

export default ViewCalendar;