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
        // Verificar el ID Token de Google
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: generalConfig.googleClientId,
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const nombres = payload['given_name'] || payload['name'];
        const apellidos = payload['family_name'] || '';
        const foto_perfil = payload['picture'];
        const emailVerified = payload['email_verified'];

        if (!emailVerified) {
            return res.status(400).json({ success: false, message: 'El correo electrónico de Google no está verificado.' });
        }

        // Buscar usuario en tu base de datos
        const user = await dbInstance.Usuario.findOne({ where: { googleId: googleId } });

        if (user) {
            console.log('Usuario existente ha iniciado sesión con Google:', user.email);
            // Si el usuario ya existe, actualiza sus datos si han cambiado en Google
            await user.update({
                nombres: nombres,
                apellidos: apellidos,
                foto_perfil: foto_perfil,
                verificacion_email: true,
            });

            // Generar token JWT y devolver la información del usuario
            return generateTokenAndRespond(user, res);
        } else {
            return res.status(400).json({ success: false, message: 'Correo no registrado. Por favor, regístrese primero.' });
        }
    } catch (error) {
        // Manejo de errores
        console.error('Error al procesar el inicio de sesión con Google:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al autenticar con Google.' });
    }
};
const googleSignUp = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ success: false, message: 'No se proporcionó token de Google.' });
    }

    try {
        // Verificar el ID Token de Google
        const ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: generalConfig.googleClientId,
        });

        const payload = ticket.getPayload();
        const googleId = payload['sub'];
        const email = payload['email'];
        const nombres = payload['given_name'] || payload['name'];
        const apellidos = payload['family_name'] || '';
        const foto_perfil = payload['picture'];
        const emailVerified = payload['email_verified'];

        if (!emailVerified) {
            return res.status(400).json({ success: false, message: 'El correo electrónico de Google no está verificado.' });
        }

        // Buscar usuario en tu base de datos
        const existingUser = await dbInstance.Usuario.findOne({ where: { email: email } });

        if (existingUser) {
            return res.status(400).json({ success: false, message: 'El correo ya está registrado. Por favor, inicie sesión.' });
        }

        // Crear nuevo usuario
        console.log('Creando nuevo usuario con Google:', email);
        const user = await dbInstance.Usuario.create({
            googleId: googleId,
            email: email,
            nombres: nombres,
            apellidos: apellidos,
            foto_perfil: foto_perfil,
            accountType: 'Aprendiz',
            verificacion_email: true,
            password: null,
        });

        // Generar token JWT y devolver la información del usuario
        return generateTokenAndRespond(user, res);
    } catch (error) {
        console.error('Error al procesar el registro con Google:', error);
        res.status(500).json({ success: false, message: 'Error interno del servidor al registrar con Google.' });
    }
};

const generateTokenAndRespond = (user, res) => {
    const token = jwt.sign(
        { id: user.ID, email: user.email, accountType: user.accountType },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "1h" }
    );

    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 3600000,
    });

    res.status(200).json({
        success: true,
        message: 'Operación exitosa.',
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
};

module.exports = {
    googleSignIn, setDb, googleSignUp
};