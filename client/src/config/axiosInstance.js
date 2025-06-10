import Axios from "axios";

// Instancia para rutas que requieren autenticación
const axiosInstance = Axios.create({
    baseURL: "https://sgfc-production.up.railway.app", // Cambia esto según la URL de tu backend
    withCredentials: true, // Permitir el envío de cookies
    headers: {
        "Content-Type": "application/json", // Tipo de contenido predeterminado
    },
});

// Instancia para rutas públicas que no requieren autenticación
const publicAxiosInstance = Axios.create({
    baseURL: "http://localhost:3001",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para agregar el token a las peticiones autenticadas
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

export { axiosInstance, publicAxiosInstance };
export default axiosInstance;