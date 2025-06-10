import Axios from "axios";

// Instancia para rutas que requieren autenticación
const axiosInstance = Axios.create({
    baseURL: "http://localhost:3001", // Using local development server
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
        
        console.log("Datos de sesión encontrados:", userSession);
        
        if (!userSession) {
            console.error("No se encontró la sesión del usuario");
            return Promise.reject(new Error("No se encontró la sesión del usuario"));
        }

        if (!userSession.token) {
            console.error("No se encontró el token en la sesión del usuario");
            return Promise.reject(new Error("No se encontró el token de autenticación"));
        }

        config.headers.Authorization = `Bearer ${userSession.token}`;
        console.log("Headers de la petición:", config.headers);
        return config;
    },
    (error) => {
        console.error("Error en el interceptor de axios:", error);
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error("Error en la respuesta:", error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
            console.log("Error 401: Token inválido o expirado");
            // Limpiar la sesión si el token no es válido
            localStorage.removeItem('userSession');
            sessionStorage.removeItem('userSession');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

export { axiosInstance, publicAxiosInstance };
export default axiosInstance;