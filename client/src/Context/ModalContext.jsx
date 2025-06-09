import React, { createContext, useState, useContext } from 'react';

// Creación del contexto para manejar estados relacionados con modales
const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
  // Estados para controlar la visibilidad de diferentes modales y datos relacionados
  const [showSignIn, setShowSignIn] = useState(false);          // Modal de inicio de sesión
  const [showSignUp, setShowSignUp] = useState(false);          // Modal de registro
  const [showAccountType, setShowAccountType] = useState(false);// Modal para seleccionar tipo de cuenta
  const [selectedAccountType, setSelectedAccountType] = useState(""); // Tipo de cuenta seleccionada
  const [showModalCreateEmployee, setShowModalCreateEmployee] = useState(false); // Modal para crear empleado
  return (
    // Proveedor del contexto que expone los estados y funciones para manejarlos
    <ModalContext.Provider
      value={{
        showSignIn,
        setShowSignIn,
        showSignUp,
        setShowSignUp,
        showAccountType,
        setShowAccountType,
        selectedAccountType,
        setSelectedAccountType,
        showModalCreateEmployee,
        setShowModalCreateEmployee// Añadido el estado y función para el modal de crear empleado
      }}
    >
      {children} {/* Renderiza los componentes hijos que consumen este contexto */}
    </ModalContext.Provider>
  );
};

// Hook personalizado para consumir fácilmente el contexto en cualquier componente
export const useModal = () => useContext(ModalContext);
