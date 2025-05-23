// controllers/auth.controller.js
const { OAuth2Client } = require('google-auth-library');
const generalConfig = require('../config/general'); // Importa tu nueva configuración general
const jwt = require('jsonwebtoken');
let dbInstance; // Variable para almacenar la instancia de la base de datos y los modelos

// Esta función se llamará desde app.js para inyectar la instancia de db
// así el controlador no tiene que llamar a initializeDatabase() por sí mismo
const setDb = (databaseInstance) => {
    dbInstance  = databaseInstance;
};

const client = new OAuth2Client(generalConfig.googleClientId);

/**
 * Maneja el inicio de sesión/registro con Google.
 * Recibe el ID Token del frontend, lo verifica y procesa el usuario.
 */
const googleSignIn = async (req, res) => {
    if (!dbInstance || !dbInstance.Usuario) {
        // Esto debería prevenir errores si el controlador se usa antes de que la DB esté lista
        console.error('Error: La instancia de la base de datos o el modelo Usuario no están disponibles.');
        return res.status(500).json({ success: false, message: 'El servidor no está completamente inicializado.' });
    }

    const { idToken } = req.body; // El ID Token enviado desde el frontend

    if (!idToken) {
        return res.status(400).json({ success: false, message: 'No se proporcionó token de Google.' });
    }

    try {
        //Verificar el ID Token de Google
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: generalConfig.googleClientId, // Usa el ID de cliente de la configuración general
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub']; // ID único de Google para el usuario
        const email = payload['email'];
        const nombres = payload['given_name'] || payload['name']; // Nombre de pila o nombre completo
        const apellidos = payload['family_name'] || ''; // Apellidos (puede que no siempre estén disponibles)
        const foto_perfil = payload['picture']; // URL de la foto de perfil
        const emailVerified = payload['email_verified'];

        if (!emailVerified) {
            return res.status(400).json({ success: false, message: 'El correo electrónico de Google no está verificado.' });
        }

        // Buscar usuario en tu base de datos
        // Primero, busca por googleId
        let user = await dbInstance.Usuario.findOne({ where: { googleId: googleId } });

        if (!user) {
            // Si no se encuentra por googleId, intenta buscar por email
            user = await dbInstance.Usuario.findOne({ where: { email: email } });

            if (user) {
                // Si el usuario existe por email, pero sin googleId, lo actualizamos y lo vinculamos
                console.log('Usuario existente por email. Vinculando a Google:', user.email);
                await user.update({
                    googleId: googleId,
                    nombres: user.nombres || nombres, // Mantén los nombres existentes si ya los tiene
                    apellidos: user.apellidos || apellidos,
                    foto_perfil: user.foto_perfil || foto_perfil, // Mantén la foto existente si ya la tiene
                    verificacion_email: true // Si Google lo verifica, asumimos que el email está verificado
                  
                });
            } else {
                // Si el usuario no existe en la base de datos, lo creamos
                console.log('Creando nuevo usuario con Google:', email);
                user = await dbInstance.Usuario.create({
                    googleId: googleId,
                    email: email,
                    nombres: nombres,
                    apellidos: apellidos,
                    foto_perfil: foto_perfil,
                    accountType: 'Aprendiz', // Rol por defecto para nuevos registros de Google
                    verificacion_email: true, // Google ya verificó el email
                    password: null, // Usuarios de Google no tendrán contraseña en tu DB
                });
            }
        } else {
            console.log('Usuario existente ha iniciado sesión con Google:', user.email);
            // Si el usuario ya existe y tiene googleId, actualiza sus datos si han cambiado en Google
            await user.update({
                nombres: nombres,
                apellidos: apellidos,
                foto_perfil: foto_perfil,
                verificacion_email: true, // Asegúrate de que el email esté verificado
            });
        }

        //Generar token JWT
        const token = jwt.sign(
            { id: user.ID, email: user.email, accountType: user.accountType },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );

        //Enviar el token como una cookie HTTP-only
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
            sameSite: "strict",
            maxAge: 3600000, // 1 hora
        });

        //Devolver la información del usuario al frontend
        res.status(200).json({
            success: true,
            message: 'Inicio de sesión exitoso con Google.',
            user: {
                ID: user.ID,
                googleId: user.googleId,
                email: user.email,
                nombres: user.nombres,
                apellidos: user.apellidos,
                foto_perfil: user.foto_perfil,
                accountType: user.accountType,
            }
        });

    } catch (error) {
        console.error('Error al procesar el inicio de sesión con Google:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ success: false, message: 'El correo electrónico ya está registrado.' });
        }
        if (error.code === 'ERR_GOOGLE_AUTH_INVALID_TOKEN') {
            return res.status(401).json({ success: false, message: 'Token de Google inválido o expirado.' });
        }
        res.status(500).json({ success: false, message: 'Error interno del servidor al autenticar con Google.' });
    }
};

module.exports = {
    googleSignIn, setDb
};