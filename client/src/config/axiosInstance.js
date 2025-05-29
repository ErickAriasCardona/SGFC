import Axios from "axios";

const axiosInstance = Axios.create({
    baseURL: "http://localhost:3001", // Cambia esto según la URL de tu backend
    withCredentials: true, // Permitir el envío de cookies
    headers: {
        "Content-Type": "application/json", // Tipo de contenido predeterminado
    },
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        // Obtener la sesión del usuario
        const userSession = JSON.parse(localStorage.getItem('userSession')) || 
                          JSON.parse(sessionStorage.getItem('userSession'));
        
        if (userSession?.token) {
            config.headers.Authorization = `Bearer ${userSession.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;