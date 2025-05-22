import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Axios from "axios";
import { Modal_Successful } from "../../UI/Modal_Successful/Modal_Successful";
import { Modal_Failed } from "../../UI/Modal_Failed/Modal_Failed";
import axiosInstance from "../../../config/axiosInstance";
import "./EmailVerification.css";

export const EmailVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVerified, setIsVerified] = useState(false); // Estado para verificar si el correo fue validado
  const [message, setMessage] = useState(""); // Estado para manejar el mensaje del backend

  useEffect(() => {
    // Obtener el token de verificación desde la URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    if (token) {
      // Llamar al backend para validar el token
      axiosInstance.get(`/verificarCorreo?token=${token}`)
        .then((response) => {
          console.log(response.data.message);
          setIsVerified(true); // Actualizar estado a verificado
          setMessage(response.data.message); // Guardar el mensaje del backend

          // Mostrar el modal exitoso cambiando su estilo a display: flex
          const modalSuccessful = document.getElementById("container_modalSucessfull");
          if (modalSuccessful) {
            modalSuccessful.style.display = "flex";

            // Ocultar el modal automáticamente después de 5 segundos y redirigir
            setTimeout(() => {
              modalSuccessful.style.display = "none";
              navigate("/", { state: { showSuccessModal: true } });
            }, 5000);
          }
        })
        .catch((error) => {
          console.error("Error al verificar el correo:", error);
          setIsVerified(false); // Actualizar estado a no verificado
          setMessage(
            error.response?.data?.message || "El enlace de verificación no es válido o ha expirado."
          );

          // Mostrar el modal de error cambiando su estilo a display: flex
          const modalFailed = document.getElementById("container_modalFailed");
          if (modalFailed) {
            modalFailed.style.display = "flex";

            // Ocultar el modal automáticamente después de 5 segundos y redirigir
            setTimeout(() => {
              modalFailed.style.display = "none";
              navigate("/");
            }, 5000);
          }
        });
    } else {
      setIsVerified(false); // Actualizar estado a no verificado
      setMessage("No se proporcionó un token de verificación.");

      // Mostrar el modal de error cambiando su estilo a display: flex
      const modalFailed = document.getElementById("container_modalFailed");
      if (modalFailed) {
        modalFailed.style.display = "flex";

        // Ocultar el modal automáticamente después de 5 segundos y redirigir
        setTimeout(() => {
          modalFailed.style.display = "none";
          navigate("/");
        }, 5000);
      }
    }
  }, [location, navigate]);

  return (
    <div className="container_emailVerification">
      <Modal_Successful>
        <h2>{message}</h2>
      </Modal_Successful>
      <Modal_Failed>
        <h2>Error al verificar el correo</h2>
        <p>{message}</p>
      </Modal_Failed>
    </div>
  );
};