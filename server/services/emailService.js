const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "eariassena19@gmail.com",
        pass: "jzcg vevx ixqj wcgv",
    },
}); 

// Función para enviar el correo de verificación
const sendVerificationEmail = (email, token) => {
    const enlaceVerificacion = `http://localhost:5173/verificarCorreo?token=${token}`;
    const mailOptions = {
        from: "eariassena19@gmail.com",
        to: email,
        subject: "Verificación de correo electrónico",
        html: `<p>Por favor, haz clic en el siguiente enlace para verificar tu correo:</p>
               <a href="${enlaceVerificacion}">Verificar correo</a>`, 
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log("Error al enviar el correo:", err);
        } else {
            console.log("Correo enviado:", info.response);
        }
    });
};

// Función para enviar el correo de recuperación de contraseña
const sendPasswordResetEmail = (email, resetLink) => {
    const mailOptions = {
        from: "eariassena19@gmail.com",
        to: email,
        subject: "Recuperación de contraseña",
        html: `<p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
               <a href="${resetLink}">Restablecer contraseña</a>`,
    };

    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error al enviar el correo:", err);
                reject(err);
            } else {
                console.log("Correo enviado:", info.response);
                resolve(info);
            }
        });
    });
};

// Función para notificar la actualización del curso
const sendCursoUpdatedNotification = (email, curso) => {
    const mailOptions = {
        from: "eariassena19@gmail.com",
        to: email,
        subject: `El curso "${curso.nombre_curso}" ha sido actualizado`,
        html: `
            <p>Hola,</p>
            <p>Te informamos que el curso <strong>${curso.nombre_curso}</strong> ha sido actualizado.</p>
            <p><strong>Descripción:</strong> ${curso.descripcion}</p>
            <p><strong>Fecha de inicio:</strong> ${curso.fecha_inicio}</p>
            <p><strong>Fecha de fin:</strong> ${curso.fecha_fin}</p>
            <p><strong>Lugar:</strong> ${curso.lugar_formacion}</p>
            <p>Saludos,<br/>SGFC</p>
        `,
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log("Error al enviar notificación de actualización:", err);
        } else {
            console.log("📨 Notificación enviada:", info.response);
        }
    });
};


// Exportar ambas funciones
module.exports = { sendVerificationEmail, sendPasswordResetEmail,sendCursoUpdatedNotification };