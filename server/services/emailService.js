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

// Función para enviar el correo de confirmación de cambio de contraseña
const sendPasswordChangeConfirmationEmail = (email, resetLink) => {
  const mailOptions = {
    from: "eariassena19@gmail.com",
    to: email,
    subject: "Confirmación de cambio de contraseña",
    html: `<p>Si no realizaste este cambio, por favor contacta a nuestro soporte de inmediato.</p>
    <p>También puedes volver a cambiar tu contraseña haciendo clic en el siguiente enlace:</p>
    <a href="${resetLink}">Cambiar contraseña nuevamente</a>`,
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

// Exportar ambas funciones
module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangeConfirmationEmail };
