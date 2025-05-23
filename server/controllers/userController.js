const User = require("../models/User");
const crypto = require("crypto");
const { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangeConfirmationEmail } = require("../services/emailService");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");

// Registrar usuario
const Empresa = require('../models/empresa'); // Importar el modelo Empresa
const Sena = require('../models/sena'); // Importar el modelo Sena
const Departamento = require('../models/departamento'); // Importar el modelo Departamento
const Ciudad = require('../models/ciudad'); // Importar el modelo Ciudad





const registerUser = async (req, res) => {
    try {
        const { email, password, accountType, cedula, nombres, apellidos, celular, titulo_profesional } = req.body;

        // Validar datos obligatorios
        if (!email || !password || !accountType) {
            return res.status(400).json({ message: 'Los campos email, password y accountType son obligatorios' });
        }

        // Validar el tipo de cuenta
        const validAccountTypes = ['Aprendiz', 'Empresa', 'Instructor', 'Administrador', 'Gestor'];
        if (!validAccountTypes.includes(accountType)) {
            return res.status(400).json({ message: 'El tipo de cuenta no es válido' });
        }

        // Verificar si el usuario ya existe por email
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // Generar token de verificación
        const token = crypto.randomBytes(32).toString('hex');

        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // Procesar imagen de perfil si se sube
        let foto_perfil = null;
        if (req.file) {
            const path = require('path');
            const fs = require('fs');
            const base64Data = req.file.buffer.toString('base64');
            const uniqueName = `${req.file.fieldname}-${Date.now()}.txt`;
            const savePath = path.join(__dirname, '../base64storage', uniqueName);
            if (!fs.existsSync(path.dirname(savePath))) {
                fs.mkdirSync(path.dirname(savePath), { recursive: true });
            }
            fs.writeFileSync(savePath, base64Data);
            foto_perfil = `/base64storage/${uniqueName}`;
        }

        // Crear nuevo usuario
        const newUser = await User.create({
            email,
            password: hashedPassword,
            accountType,
            cedula: cedula || null,
            nombres: nombres || null,
            apellidos: apellidos || null,
            celular: celular || null,
            titulo_profesional: titulo_profesional || null,
            verificacion_email: false,
            token,
            foto_perfil: image, // Guardar la ruta del archivo base64 si existe
        });

        // Si el tipo de cuenta es Empresa, crear un registro en la tabla Empresa y relacionarlo con el usuario
        if (accountType === 'Empresa') {
            const nuevaEmpresa = await Empresa.create({
                NIT: null, // Inicialmente vacío
                email_empresa: null, // Usar el email del usuario como email de la empresa
                nombre_empresa: null, // Inicialmente vacío
                direccion: null, // Inicialmente vacío
                estado: 'inactivo', // Estado por defecto
                categoria: null, // Inicialmente vacío
                telefono: null, // Inicialmente vacío
                img_empresa: null, // Inicialmente vacío
            });

            // Relacionar el usuario con la empresa
            newUser.empresa_ID = nuevaEmpresa.ID;
            await newUser.save();
        }

        // Enviar correo de verificación
        await sendVerificationEmail(email, token);

        res.status(201).json({ message: 'Usuario registrado. Por favor verifica tu correo.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al registrar el usuario' });
    }
};

// Verificar correo
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        // Validar token
        if (!token) {
            return res.status(400).json({ message: "Token no proporcionado" });
        }
        console.log('Token recibido:', token);
        // Buscar usuario por token
        const user = await User.findOne({ where: { token } });

        if (!user) {
            return res.status(400).json({ message: "Token inválido o expirado" });
        }
        console.log('Token en la base de datos:', user.token);

        // Actualizar estado de verificación
        user.verificacion_email = true;
        user.token = null;
        await user.save();

        res.status(200).json({ message: "Correo verificado con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al verificar el correo" });
    }
};

// Iniciar sesión
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validar datos de entrada
        if (!email || !password) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        // Buscar usuario por correo
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
        }

        // Comparar contraseñas
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
        }

        // Generar token JWT
        const token = jwt.sign(
            { id: user.ID, email: user.email, accountType: user.accountType },
            process.env.JWT_SECRET || "secret",
            { expiresIn: "1h" }
        );

        // Enviar el token como una cookie HTTP-only
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Solo en HTTPS en producción
            sameSite: "strict",
            maxAge: 3600000, // 1 hora
        });

        res.status(200).json({
            message: "Inicio de sesión exitoso",
            id: user.ID, // 👈 Esto es lo que necesitas agregar
            accountType: user.accountType,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

// Solicitud de restablecimiento de contraseña
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            console.log(`Intento de recuperación para un correo no registrado: ${email}`);
            return res.status(404).json({ message: "No se encontró un usuario con ese correo electrónico." });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
        await user.save();

        // 👉 Imprimir el token en consola
        console.log(`Token generado para ${email}: ${resetToken}`);

        const resetLink = `http://localhost:5173/resetPassword?token=${resetToken}`;
        console.log(`Enviando correo de recuperación a: ${email}`);
        await sendPasswordResetEmail(email, resetLink);

        res.status(200).json({ message: "Se ha enviado un enlace de recuperación a tu correo electrónico." });
    } catch (error) {
        console.error("Error al solicitar recuperación de contraseña:", error);
        res.status(500).json({ message: "Error al procesar la solicitud de recuperación de contraseña." });
    }
};

// Cambiar contraseña con token
const resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { newPassword } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Token no proporcionado" });
        }

        const user = await User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: "Token inválido o expirado" });
        }

        // Encriptar la nueva contraseña
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

        user.password = hashedPassword;
        // Limpiar el token usado
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;

        // Generar un nuevo token de recuperación por si el usuario no hizo el cambio
        const newResetToken = crypto.randomBytes(32).toString("hex");
        user.resetPasswordToken = newResetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora más

        await user.save();

        // Enlace para volver a cambiar la contraseña
        const resetLink = `http://localhost:5173/resetPassword?token=${newResetToken}`;
        await sendPasswordChangeConfirmationEmail(user.email, resetLink);

        res.status(200).json({ message: "Contraseña restablecida con éxito" });
    } catch (error) {
        console.error("Error al restablecer la contraseña:", error);
        res.status(500).json({ message: "Error al restablecer la contraseña" });
    }
};

//limpiar tokens expirados
const cleanExpiredTokens = async () => {
    try {
        // Limpia los tokens de recuperación de contraseña expirados
        await User.update(
            { resetPasswordToken: null, resetPasswordExpires: null },
            {
                where: {
                    resetPasswordExpires: { [Op.lt]: Date.now() }
                }
            }
        );
        console.log("Tokens de recuperación expirados limpiados correctamente.");
    } catch (error) {
        console.error("Error al limpiar tokens expirados:", error);
    }
};


// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password', 'token', 'resetPasswordToken', 'resetPasswordExpires'] } // para no enviar datos sensibles
        });

        res.status(200).json(users);
    } catch (error) {
        console.error("Error al obtener los usuarios:", error);
        res.status(500).json({ message: "Error al obtener los usuarios" });
    }
};

const getUserProfile = async (req, res) => {
    try {
        const userId = req.params.id;

        const usuario = await User.findByPk(userId, {
            include: [
                {
                    model: Sena,
                    as: 'Sena',
                    include: [
                        {
                            model: Ciudad,
                            as: 'Ciudad',
                            attributes: ['ID', 'nombre'],
                            include: [
                                {
                                    model: Departamento,
                                    as: 'Departamento',
                                    attributes: ['ID', 'nombre'],
                                },
                            ],
                        },
                    ],
                },
                {
                    model: Empresa,
                    as: 'Empresa',
                },
            ],
        });

        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(usuario);
    } catch (error) {
        console.error('Error al obtener el perfil del usuario:', error);
        res.status(500).json({ error: 'Error al obtener el perfil del usuario' });
    }
};

//Consultar lista de aprendices
const getAprendices = async (req, res) => {
    try {
        const aprendices = await User.findAll({
            where: { accountType: 'Aprendiz' },
            attributes: { exclude: ['password', 'token', 'resetPasswordToken', 'resetPasswordExpires'] }, // Excluir datos sensibles
        });

        res.status(200).json(aprendices);
    } catch (error) {
        console.error("Error al obtener la lista de aprendices:", error);
        res.status(500).json({ message: "Error al obtener la lista de aprendices." });
    }
};

//Consultar lista de empresas
const getEmpresas = async (req, res) => {
    try {
        const empresas = await User.findAll({
            where: { accountType: 'Empresa' },
            attributes: { exclude: ['password', 'token', 'resetPasswordToken', 'resetPasswordExpires'] }, // Excluir datos sensibles
            include: [
                {
                    model: Empresa,
                    as: 'Empresa', // Alias definido en la relación
                    attributes: ['ID', 'NIT', 'email_empresa', 'nombre_empresa', 'direccion', 'estado', 'categoria', 'telefono', 'img_empresa'], // Campos que deseas incluir
                },
            ],
        });

        res.status(200).json(empresas);
    } catch (error) {
        console.error("Error al obtener la lista de empresas:", error);
        res.status(500).json({ message: "Error al obtener la lista de empresas." });
    }
};

//Consultar lista de instructores
const getInstructores = async (req, res) => {
    try {
        const instructores = await User.findAll({
            where: { accountType: 'Instructor' },
            attributes: ['ID', 'email', 'nombres', 'apellidos', 'estado', 'celular', 'cedula', 'foto_perfil', 'titulo_profesional'],
        });

        // Transformar el campo foto_perfil para devolver una URL
        const instructoresConFoto = instructores.map((instructor) => {
            return {
                ...instructor.toJSON(),
                foto_perfil: instructor.foto_perfil
                    ? `http://localhost:3001/${instructor.foto_perfil}` // Construir la URL completa
                    : null, // Si no hay foto, devolver null
            };
        });

        res.status(200).json(instructoresConFoto);
    } catch (error) {
        console.error('Error al obtener los instructores:', error);
        res.status(500).json({ message: 'Error al obtener los instructores.' });
    }
};

//Consultar lista de gestores
const getGestores = async (req, res) => {
    try {
        const gestores = await User.findAll({
            where: { accountType: 'Gestor' },
            attributes: ['ID', 'email', 'nombres', 'apellidos', 'estado', 'celular', 'cedula', 'foto_perfil'],
        });

        // Transformar el campo foto_perfil para devolver una URL
        const gestoresConFoto = gestores.map((gestor) => {
            return {
                ...gestor.toJSON(),
                foto_perfil: gestor.foto_perfil
                    ? `http://localhost:3001/${gestor.foto_perfil}` // Construir la URL completa
                    : null, // Si no hay foto, devolver null
            };
        });

        res.status(200).json(gestoresConFoto);
    } catch (error) {
        console.error('Error al obtener los gestores:', error);
        res.status(500).json({ message: 'Error al obtener los gestores.' });
    }
};

//Actualizar perfil segun tipo cuenta
const updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            email,
            nombres,
            apellidos,
            celular,
            cedula,
            estado,
            titulo_profesional,
            password,
        } = req.body;

        // Procesar imagen de perfil si se sube
        let foto_perfil = null;
        if (req.file) {
            const path = require('path');
            const fs = require('fs');
            const base64Data = req.file.buffer.toString('base64');
            const uniqueName = `${req.file.fieldname}-${Date.now()}.txt`;
            const savePath = path.join(__dirname, '../base64storage', uniqueName);
            if (!fs.existsSync(path.dirname(savePath))) {
                fs.mkdirSync(path.dirname(savePath), { recursive: true });
            }
            fs.writeFileSync(savePath, base64Data);
            foto_perfil = `/base64storage/${uniqueName}`;
        } else if (req.file && req.file.path) {
            // Compatibilidad con imágenes subidas como archivo normal
            foto_perfil = req.file.path;
        }

        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ message: "No autorizado. Debes iniciar sesión." });
        }

        const loggedInUser = jwt.verify(token, process.env.JWT_SECRET || "secret");
        if (!loggedInUser) {
            return res.status(401).json({ message: "Token inválido o expirado." });
        }

        const user = await User.findByPk(id, {
            include: [{ model: Empresa, as: "Empresa" }],
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Verificación de permisos
        if (loggedInUser.accountType === "Gestor" || loggedInUser.accountType === "Instructor") {
            return res.status(403).json({ message: "No tienes permiso para actualizar perfiles." });
        }

        // ADMINISTRADOR
        if (loggedInUser.accountType === "Administrador") {
            if (["Instructor", "Gestor", "Administrador", "Empresa", "Aprendiz"].includes(user.accountType)) {

                // Validaciones únicas
                if (email && email !== user.email) {
                    const existingEmail = await User.findOne({ where: { email } });
                    if (existingEmail) {
                        return res.status(400).json({ message: "El correo electrónico ya está registrado." });
                    }
                }

                if (cedula && cedula !== user.cedula) {
                    const existingCedula = await User.findOne({ where: { cedula } });
                    if (existingCedula) {
                        return res.status(400).json({ message: "La cédula ya está registrada." });
                    }
                }

                if (celular && celular !== user.celular) {
                    const existingCelular = await User.findOne({ where: { celular } });
                    if (existingCelular) {
                        return res.status(400).json({ message: "El número de celular ya está registrado." });
                    }
                }

                // Asignación directa de campos
                if (email) user.email = email;
                if (nombres) user.nombres = nombres;
                if (apellidos) user.apellidos = apellidos;
                if (celular) user.celular = celular;
                if (cedula) user.cedula = cedula;
                if (estado) user.estado = estado;
                if (titulo_profesional) user.titulo_profesional = titulo_profesional;

                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    user.password = hashedPassword;
                }

                if (foto_perfil) user.foto_perfil = foto_perfil;

                await user.save();
                return res.status(200).json({ message: "Perfil actualizado con éxito." });
            }
        }

        // EMPRESA
        if (loggedInUser.accountType === "Empresa" && user.accountType === "Empresa") {
            if (email) user.email = email;
            if (nombres) user.nombres = nombres;
            if (apellidos) user.apellidos = apellidos;
            if (celular) user.celular = celular;
            if (cedula) user.cedula = cedula;
            if (estado) user.estado = estado;

            // Empresa viene como string JSON en el campo 'empresa'
            if (req.body.empresa && user.Empresa) {
                let empresaData;
                try {
                    empresaData = JSON.parse(req.body.empresa);
                } catch (e) {
                    return res.status(400).json({ message: "Formato de empresa inválido." });
                }

                const {
                    nit,
                    email_empresa,
                    nombre_empresa,
                    direccion,
                    estado,
                    categoria,
                    telefono,
                    img_empresa
                } = empresaData;

                if (nit) user.Empresa.NIT = nit;
                if (email_empresa) user.Empresa.email_empresa = email_empresa;
                if (nombre_empresa) user.Empresa.nombre_empresa = nombre_empresa;
                if (direccion) user.Empresa.direccion = direccion;
                if (estado) user.Empresa.estado = estado;
                if (categoria) user.Empresa.categoria = categoria;
                if (telefono) user.Empresa.telefono = telefono;
                if (img_empresa) user.Empresa.img_empresa = img_empresa;

                await user.Empresa.save();
            }

            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                user.password = hashedPassword;
            }

            if (foto_perfil) user.foto_perfil = foto_perfil;

            await user.save();
            return res.status(200).json({ message: "Perfil de empresa actualizado con éxito." });
        }

        // APRENDIZ
        if (loggedInUser.accountType === "Aprendiz" && user.accountType === "Aprendiz") {
            if (email) user.email = email;
            if (nombres) user.nombres = nombres;
            if (apellidos) user.apellidos = apellidos;
            if (celular) user.celular = celular;
            if (cedula) user.cedula = cedula;
            if (estado) user.estado = estado;
            if (titulo_profesional) user.titulo_profesional = titulo_profesional;
            if (password) {
                const hashedPassword = await bcrypt.hash(password, 10);
                user.password = hashedPassword;
            }
            if (foto_perfil) user.foto_perfil = foto_perfil;
            await user.save();
            return res.status(200).json({ message: "Perfil de aprendiz actualizado con éxito." });
        }

        return res.status(403).json({ message: "No tienes permiso para actualizar este perfil." });
    } catch (error) {
        console.error("Error al actualizar el perfil del usuario:", error);
        return res.status(500).json({ message: "Error al actualizar el perfil del usuario." });
    }
};

// Actualizar foto de perfil
const updateProfilePicture = async (req, res) => {
    try {
        const { id } = req.params; // Obtener el ID del usuario desde los parámetros de la URL

        // Verificar si se subió un archivo
        if (!req.file) {
            console.log("Archivo no recibido en la solicitud.");
            return res.status(400).json({ message: "No se ha subido ninguna imagen." });
        }

        console.log("Archivo recibido:", req.file); // Verificar qué archivo se recibió

        const path = require('path');
        const fs = require('fs');
        const base64Data = req.file.buffer.toString('base64');
        const uniqueName = `${req.file.fieldname}-${Date.now()}.txt`;
        const savePath = path.join(__dirname, '../base64storage', uniqueName);
        if (!fs.existsSync(path.dirname(savePath))) {
            fs.mkdirSync(path.dirname(savePath), { recursive: true });
        }
        fs.writeFileSync(savePath, base64Data);
        const filePath = `/base64storage/${uniqueName}`; // Ruta de la imagen subida

        // Buscar el usuario por ID
        const user = await User.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        // Actualizar la foto de perfil
        user.foto_perfil = filePath;
        await user.save();

        res.status(200).json({ message: "Foto de perfil actualizada con éxito.", foto_perfil: filePath });
    } catch (error) {
        console.error("Error al actualizar la foto de perfil:", error);
        res.status(500).json({ message: "Error al actualizar la foto de perfil." });
    }
};

// Crear Instructor
const createInstructor = async (req, res) => {
    try {
        console.log("Cuerpo de la solicitud:", req.body); // Verifica los datos enviados
        console.log("Archivo recibido:", req.file); // Verifica si el archivo fue recibido

        const { nombres, apellidos, titulo_profesional, celular, email, cedula, estado } = req.body;

        // Procesar imagen de perfil si se sube
        let foto_perfil = null;
        if (req.file) {
            const path = require('path');
            const fs = require('fs');
            const base64Data = req.file.buffer.toString('base64');
            const uniqueName = `${req.file.fieldname}-${Date.now()}.txt`;
            const savePath = path.join(__dirname, '../base64storage', uniqueName);
            if (!fs.existsSync(path.dirname(savePath))) {
                fs.mkdirSync(path.dirname(savePath), { recursive: true });
            }
            fs.writeFileSync(savePath, base64Data);
            foto_perfil = `/base64storage/${uniqueName}`;
        }

        // Validar datos obligatorios
        if (!nombres || !apellidos || !titulo_profesional || !celular || !email || !cedula || !estado) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        // Verificar si el correo ya está registrado
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: "El correo ya está registrado." });
        }

        // Verificar si la cédula ya está registrada
        const existingCedula = await User.findOne({ where: { cedula } });
        if (existingCedula) {
            return res.status(400).json({ message: "La cédula ya está registrada." });
        }

        // Generar token de verificación
        const token = crypto.randomBytes(32).toString("hex");

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash("defaultPassword123", 10);

        // Crear el instructor
        const newInstructor = await User.create({
            nombres,
            apellidos,
            titulo_profesional,
            celular,
            email,
            cedula,
            estado,
            foto_perfil,
            sena_ID: 1, //ID Sena 
            accountType: "Instructor", // Tipo de cuenta
            password: hashedPassword, // Contraseña encriptada
            verificacion_email: false, // Estado de verificación
            token, // Token de verificación
        });

        // Enviar correo de verificación
        await sendVerificationEmail(email, token);


        res.status(201).json({
            message: "Instructor creado con éxito. Por favor verifica tu correo.",
            instructor: newInstructor
        });
    } catch (error) {
        console.error("Error al crear el instructor:", error);
        res.status(500).json({ message: "Error al crear el instructor." });
    }
};

// Crear Gestor
const createGestor = async (req, res) => {
    try {
        console.log("Cuerpo de la solicitud:", req.body); // Verifica los datos enviados
        console.log("Archivo recibido:", req.file); // Verifica si el archivo fue recibido

        const { nombres, apellidos, celular, email, cedula, estado } = req.body;

        // Procesar imagen de perfil si se sube
        let foto_perfil = null;
        if (req.file) {
            const path = require('path');
            const fs = require('fs');
            const base64Data = req.file.buffer.toString('base64');
            const uniqueName = `${req.file.fieldname}-${Date.now()}.txt`;
            const savePath = path.join(__dirname, '../base64storage', uniqueName);
            if (!fs.existsSync(path.dirname(savePath))) {
                fs.mkdirSync(path.dirname(savePath), { recursive: true });
            }
            fs.writeFileSync(savePath, base64Data);
            foto_perfil = `/base64storage/${uniqueName}`;
        }

        // Validar datos obligatorios
        if (!nombres || !apellidos || !celular || !email || !cedula || !estado) {
            return res.status(400).json({ message: "Todos los campos son obligatorios." });
        }

        // Verificar si el correo ya está registrado
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            return res.status(400).json({ message: "El correo ya está registrado." });
        }

        // Verificar si la cédula ya está registrada
        const existingCedula = await User.findOne({ where: { cedula } });
        if (existingCedula) {
            return res.status(400).json({ message: "La cédula ya está registrada." });
        }

        // Generar token de verificación
        const token = crypto.randomBytes(32).toString("hex");

        // Encriptar la contraseña
        const hashedPassword = await bcrypt.hash("defaultPassword123", 10);

        // Crear el gestor
        const newGestor = await User.create({
            nombres,
            apellidos,
            celular,
            email,
            cedula,
            estado,
            foto_perfil,
            accountType: "Gestor", // Tipo de cuenta
            password: hashedPassword, // Contraseña encriptada
            verificacion_email: false, // Estado de verificació
            sena_ID: 1,
            token, // Token de verificación
        });

        // Enviar correo de verificación
        await sendVerificationEmail(email, token);

        res.status(201).json({ message: "Gestor creado con éxito. Por favor verifica tu correo.", gestor: newGestor });
    } catch (error) {
        console.error("Error al crear el gestor:", error);
        res.status(500).json({ message: "Error al crear el gestor." });
    }
};

module.exports = { registerUser, verifyEmail, loginUser, requestPasswordReset, resetPassword, getAllUsers, getUserProfile, getAprendices, getEmpresas, getInstructores, getGestores, updateUserProfile, updateProfilePicture, createInstructor, createGestor, logoutUser, cleanExpiredTokens };
