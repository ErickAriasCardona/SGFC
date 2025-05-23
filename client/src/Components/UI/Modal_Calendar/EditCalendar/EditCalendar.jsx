import React, { useState, useEffect } from 'react';
import './Calendar.css';

const times = [
  '6:00', '8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00'
];
const days = ['Lun', 'Mar', 'Mier', 'Jue', 'Vier', 'Sab'];

export const EditCalendar = ({ closeModal, onSave, initialData }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  // Store selected slots as a set of "day-time" strings
  const [selectedSlots, setSelectedSlots] = useState(new Set());

  // Initialize state from initialData when modal opens
  useEffect(() => {
    if (initialData) {
      setStartDate(initialData.startDate || '');
      setEndDate(initialData.endDate || '');
      setSelectedSlots(new Set(initialData.selectedSlots || []));
    }
  }, [initialData]);

  const toggleSlot = (day, time) => {
    const slot = `${day}-${time}`;
    const newSelected = new Set(selectedSlots);
    if (newSelected.has(slot)) {
      newSelected.delete(slot);
    } else {
      newSelected.add(slot);
    }
    setSelectedSlots(newSelected);
  };

  const handleSave = () => {
    // Pass selected data back to parent component
    if (onSave) {
      onSave({
        startDate,
        endDate,
        selectedSlots: Array.from(selectedSlots),
      });
    }
    closeModal();
  };

  const handleCancel = () => {
    // Close modal without saving changes
    closeModal();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-background">
        <div className="modal-container calendar-modal centered-modal">
          <button className="close-button" onClick={handleCancel}>Volver</button>
          <h2 className="modal-title">
            Editar Fechas y <span className="highlight">horarios</span>
          </h2>
          <div className="date-inputs organized-date-inputs">
            <label>
              Fecha inicio:
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </label>
            <label>
              Fecha fin:
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </label>
          </div>
          <div className="calendar-card-wrapper">
            <div className="calendar-card layered-card card1"></div>
            <div className="calendar-card layered-card card2"></div>
            <div className="calendar-card layered-card card3"></div>
          </div>
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
                        onClick={() => toggleSlot(day, time)}
                      >
                        <span className="plus-icon">+</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <button className="save-button organized-save-button" onClick={handleSave}>Guardar</button>
        </div>
      </div>
    </div>
  );
};
