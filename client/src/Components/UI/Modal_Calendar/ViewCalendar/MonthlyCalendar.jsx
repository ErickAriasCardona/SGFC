import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import './MonthlyCalendar.css';

export const MonthlyCalendar = ({ 
    currentMonth, 
    onMonthChange, 
    selectedDate, 
    onDateSelect, 
    dateRange 
}) => {
    const renderCalendar = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startDate = monthStart;
        const endDate = monthEnd;

        const startDayOfWeek = startDate.getDay();
        const blankDays = Array(startDayOfWeek).fill(null);
        const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });
        const allDays = [...blankDays, ...daysInMonth];

        const isDateInRange = (date) => {
            if (!dateRange?.start || !dateRange?.end) return false;
            const start = parseISO(dateRange.start);
            const end = parseISO(dateRange.end);
            return date >= start && date <= end;
        };

        return (
            <div className="calendar-container">
                <div className="calendar-card-wrapper">
                    <div className="calendar-card layered-card card1"></div>
                    <div className="calendar-card layered-card card2"></div>
                    <div className="calendar-card layered-card card3"></div>
                </div>
                <table className="calendar-table">
                    <thead>
                        <tr>
                            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                                <th key={day}>{day}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: Math.ceil(allDays.length / 7) }).map((_, weekIndex) => (
                            <tr key={weekIndex}>
                                {allDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                                    if (!day) {
                                        return <td key={`blank-${dayIndex}`} className="slot-cell"></td>;
                                    }

                                    const isInRange = isDateInRange(day);
                                    const isCurrentMonth = isSameMonth(day, currentMonth);
                                    const isCurrentDay = isToday(day);
                                    const isSelected = selectedDate && isSameDay(parseISO(selectedDate), day);

                                    // Permitir selección de cualquier día dentro del rango del curso
                                    const canSelect = isInRange;

                                    return (
                                        <td
                                            key={format(day, 'yyyy-MM-dd')}
                                            className={`slot-cell ${isCurrentMonth ? 'current-month' : ''} 
                                                      ${isCurrentDay ? 'today' : ''} 
                                                      ${isSelected ? 'selected' : ''}
                                                      ${isInRange ? 'in-range' : ''}
                                                      ${!canSelect ? 'disabled' : ''}`}
                                            onClick={() => canSelect && onDateSelect(format(day, 'yyyy-MM-dd'))}
                                            title={!canSelect ? 'Fuera del rango del curso' : format(day, 'dd/MM/yyyy')}
                                        >
                                            {format(day, 'd')}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="calendar-modal centered-modal">
            <div className="calendar-header">
                <div className="month-navigation">
                    <button className="nav-button" onClick={() => onMonthChange('prev')}>
                        <span className="nav-icon">&lt;</span>
                    </button>
                    <h3 className="current-month">
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h3>
                    <button className="nav-button" onClick={() => onMonthChange('next')}>
                        <span className="nav-icon">&gt;</span>
                    </button>
                </div>
            </div>
            {renderCalendar()}
        </div>
    );
}; 