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
    html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            color: #1A1A1A;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img { /* Estilos para el logo */
            max-width: 100px; /* Ajusta este valor según el tamaño deseado de tu logo */
            height: auto;
            margin-bottom: 15px; /* Espacio debajo del logo */
        }
        .header h1 {
            color: #00843D;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px 0;
            line-height: 1.6;
        }
        .content p {
            margin-bottom: 15px;
        }
        .button-container {
            text-align: center;
            padding: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #F7941E; /* Color del botón de acción */
            color: #ffffff !important;
            padding: 12px 25px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #777777;
        }
        a {
            color: #00843D; /* Color para enlaces generales */
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://i.imgur.com/2pzIurJ.png" alt="Logo de Fábrica de Software CCT">
            <h1>Verificación de Correo Electrónico</h1>
        </div>
        <div class="content">
            <p>Gracias por registrarte. Para completar el proceso y activar tu cuenta, por favor haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
            <div class="button-container">
                <a href="${enlaceVerificacion}" class="button">Verificar correo</a>
            </div>
            <p>Si no te registraste en nuestros servicios, por favor ignora este correo.</p>
            <p>Saludos cordiales,<br>El equipo de Fábrica de Software CCT</p>
        </div>
        <div class="footer">
            <p>Copyright © 2025 Fábrica de Software CCT - Regional Quindío</p>
        </div>
    </div>
</body>
</html>
`,
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
    html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            color: #1A1A1A;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img { /* Estilos para el logo */
            max-width: 100px; /* Ajusta este valor según el tamaño deseado de tu logo */
            height: auto;
            margin-bottom: 15px; /* Espacio debajo del logo */
        }
        .header h1 {
            color: #00843D;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px 0;
            line-height: 1.6;
        }
        .content p {
            margin-bottom: 15px;
        }
        .button-container {
            text-align: center;
            padding: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #F7941E; /* Color del botón de acción */
            color: #ffffff !important;
            padding: 12px 25px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #777777;
        }
        a {
            color: #00843D; /* Color para enlaces generales */
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://i.imgur.com/2pzIurJ.png" alt="Logo de Fábrica de Software CCT">
            <h1>Restablecimiento de Contraseña</h1>
        </div>
        <div class="content">
            <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
            <p>Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
            <div class="button-container">
                <a href="${resetLink}" class="button">Restablecer contraseña</a>
            </div>
            <p>Este enlace es válido por un tiempo limitado. Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo.</p>
            <p>Si tienes problemas para acceder a tu cuenta, por favor contacta a nuestro soporte.</p>
            <p>Saludos cordiales,<br>El equipo de Fábrica de Software CCT</p>
        </div>
        <div class="footer">
            <p>Copyright © 2025 Fábrica de Software CCT - Regional Quindío</p>
        </div>
    </div>
</body>
</html>
`,
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
    html: `
<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            color: #1A1A1A;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background-color: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .header img { /* Estilos para el logo */
            max-width: 100px; /* Ajusta este valor según el tamaño deseado de tu logo */
            height: auto;
            margin-bottom: 15px; /* Espacio debajo del logo */
        }
        .header h1 {
            color: #00843D;
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px 0;
            line-height: 1.6;
        }
        .content p {
            margin-bottom: 15px;
        }
        .button-container {
            text-align: center;
            padding: 20px 0;
        }
        .button {
            display: inline-block;
            background-color: #F7941E;
            color: #ffffff !important;
            padding: 12px 25px;
            border-radius: 5px;
            text-decoration: none;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #777777;
        }
        a {
            color: #00843D; /* Color para enlaces generales */
            text-decoration: none;
        }
        a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://i.imgur.com/2pzIurJ.png" alt="Logo de Fábrica de Software CCT">
            <h1>Confirmación de cambio de contraseña</h1>
        </div>
        <div class="content">
            <p>Queremos confirmar que tu contraseña ha sido cambiada exitosamente.</p>
            <p>Si <strong>no realizaste este cambio</strong>, por favor <a href="mailto:soporte@tudominio.com" style="color: #F7941E;">contacta a nuestro soporte</a> de inmediato para asegurar la seguridad de tu cuenta.</p>
            <p>También puedes volver a cambiar tu contraseña haciendo clic en el siguiente enlace:</p>
            <div class="button-container">
                <a href="${resetLink}" class="button">Cambiar contraseña nuevamente</a>
            </div>
            <p>Gracias por confiar en nuestros servicios.</p>
        </div>
        <div class="footer">
            <p>Copyright © 2025 Fábrica de Software CCT - Regional Quindío</p>
        </div>
    </div>
</body>
</html>
`,
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
