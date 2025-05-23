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
<table width="100%" bgcolor="#f4f4f4" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; margin:0; padding:0;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:37.5rem; background:#fff; margin:1.25rem auto; border-radius:.5rem; box-shadow:0 0 .625rem rgba(0,0,0,0.1);">
        <tr>
          <td style="padding:1.875rem;">
            <!-- Header -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:1.25rem; border-bottom:.0625rem solid #eee;">
                  <img src="https://i.imgur.com/2pzIurJ.png" alt="Logo de Fábrica de Software CCT" style="width:5rem; height:auto; margin-bottom:.9375rem; display:block;">
                  <h1 style="color:#00843D; margin:0; font-size:1.5rem; font-family:Arial,sans-serif;">Verificación de Correo Electrónico</h1>
                </td>
              </tr>
            </table>
            <!-- Content -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:1.25rem 0; line-height:1.6; color:#1A1A1A; font-size:1rem;">
                  <p style="margin-bottom:.9375rem;">Gracias por registrarte. Para completar el proceso y activar tu cuenta, por favor haz clic en el siguiente enlace para verificar tu correo electrónico:</p>
                  <div style="text-align:center; padding:1.25rem 0;">
                    <a href="${enlaceVerificacion}" 
                      style="display:inline-block; background-color:#F7941E; color:#fff !important; padding:.75rem 1.5625rem; border-radius:.3125rem; text-decoration:none; font-weight:bold; font-family:Arial,sans-serif; font-size:1rem;">
                      Verificar correo
                    </a>
                  </div>
                  <p style="margin-bottom:.9375rem;">Si no te registraste en nuestros servicios, por favor ignora este correo.</p>
                  <p style="margin-bottom:0;">Saludos cordiales,<br>El equipo de Fábrica de Software CCT</p>
                </td>
              </tr>
            </table>
            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-top:1.25rem; border-top:.0625rem solid #eee; font-size:.75rem; color:#777;">
                  <p style="margin:0;">Copyright © 2025 Fábrica de Software CCT - Regional Quindío</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
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
<table width="100%" bgcolor="#f4f4f4" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; margin:0; padding:0;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:37.5rem; background:#fff; margin:1.25rem auto; border-radius:.5rem; box-shadow:0 0 .625rem rgba(0,0,0,0.1);">
        <tr>
          <td style="padding:1.875rem;">
            <!-- Header -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:1.25rem; border-bottom:.0625rem solid #eee;">
                  <img src="https://i.imgur.com/2pzIurJ.png" alt="Logo de Fábrica de Software CCT" style="width:5rem; height:auto; margin-bottom:.9375rem; display:block;">
                  <h1 style="color:#00843D; margin:0; font-size:1.5rem; font-family:Arial,sans-serif;">Restablecimiento de Contraseña</h1>
                </td>
              </tr>
            </table>
            <!-- Content -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:1.25rem 0; line-height:1.6; color:#1A1A1A; font-size:1rem;">
                  <p style="margin-bottom:.9375rem;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
                  <p style="margin-bottom:.9375rem;">Por favor, haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                  <div style="text-align:center; padding:1.25rem 0;">
                    <a href="${resetLink}" 
                      style="display:inline-block; background-color:#F7941E; color:#fff !important; padding:.75rem 1.5625rem; border-radius:.3125rem; text-decoration:none; font-weight:bold; font-family:Arial,sans-serif; font-size:1rem;">
                      Restablecer contraseña
                    </a>
                  </div>
                  <p style="margin-bottom:.9375rem;">Este enlace es válido por un tiempo limitado. Si no solicitaste un restablecimiento de contraseña, por favor ignora este correo.</p>
                  <p style="margin-bottom:.9375rem;">Si tienes problemas para acceder a tu cuenta, por favor contacta a nuestro soporte.</p>
                  <p style="margin-bottom:0;">Saludos cordiales,<br>El equipo de Fábrica de Software CCT</p>
                </td>
              </tr>
            </table>
            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-top:1.25rem; border-top:.0625rem solid #eee; font-size:.75rem; color:#777;">
                  <p style="margin:0;">Copyright © 2025 Fábrica de Software CCT - Regional Quindío</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
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
<table width="100%" bgcolor="#f4f4f4" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; margin:0; padding:0;">
  <tr>
    <td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:37.5rem; background:#fff; margin:1.25rem auto; border-radius:.5rem; box-shadow:0 0 .625rem rgba(0,0,0,0.1);">
        <tr>
          <td style="padding:1.875rem;">
            <!-- Header -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:1.25rem; border-bottom:.0625rem solid #eee;">
                  <img src="https://i.imgur.com/2pzIurJ.png" alt="Logo de Fábrica de Software CCT" style="width:5rem; height:auto; margin-bottom:.9375rem; display:block;">
                  <h1 style="color:#00843D; margin:0; font-size:1.5rem; font-family:Arial,sans-serif;">Confirmación de cambio de contraseña</h1>
                </td>
              </tr>
            </table>
            <!-- Content -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:1.25rem 0; line-height:1.6; color:#1A1A1A; font-size:1rem;">
                  <p style="margin-bottom:.9375rem;">Queremos confirmar que tu contraseña ha sido cambiada exitosamente.</p>
                  <p style="margin-bottom:.9375rem;">Si <strong>no realizaste este cambio</strong>, por favor <a href="mailto:soporte@tudominio.com" style="color: #F7941E;">contacta a nuestro soporte</a> de inmediato para asegurar la seguridad de tu cuenta.</p>
                  <p style="margin-bottom:.9375rem;">También puedes volver a cambiar tu contraseña haciendo clic en el siguiente enlace:</p>
                  <div style="text-align:center; padding:1.25rem 0;">
                    <a href="${resetLink}" 
                      style="display:inline-block; background-color:#F7941E; color:#fff !important; padding:.75rem 1.5625rem; border-radius:.3125rem; text-decoration:none; font-weight:bold; font-family:Arial,sans-serif; font-size:1rem;">
                      Cambiar contraseña nuevamente
                    </a>
                  </div>
                  <p style="margin-bottom:.9375rem;">Gracias por confiar en nuestros servicios.</p>
                </td>
              </tr>
            </table>
            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-top:1.25rem; border-top:.0625rem solid #eee; font-size:.75rem; color:#777;">
                  <p style="margin:0;">Copyright © 2025 Fábrica de Software CCT - Regional Quindío</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
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

//Funcion para enviar correo de notificacion de curso creado
const sendCourseCreatedEmail = (emails, nombre_curso, courseLink) => {

    const mailOptions = {
        from: 'eariassena19@gmail.com',
        to: emails,
        subject: "Nuevo curso en linea",
        html: ` <h2>El nuevo curso: ${nombre_curso} ha creado</h2>
            <p>Haz clic en el siguiente enlace para mas informacion del curso: </p>
               <a href="${courseLink}">Nuevo curso</a>`,
    }
    console.log(emails, nombre_curso, courseLink)
    return new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error al enviar el correo:", err);
                reject(err);
            }else {
                console.log("Correo enviado:", info.response);
                resolve(info);
                console.log('se ejecuto la funcion')
            }
        })
    })
}


// Exportar ambas funciones
module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangeConfirmationEmail, sendCourseCreatedEmail };
