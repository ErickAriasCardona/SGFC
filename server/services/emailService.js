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
module.exports = { sendVerificationEmail, sendPasswordResetEmail, sendPasswordChangeConfirmationEmail, sendCourseCreatedEmail, sendCursoUpdatedNotification };





//--------------------------------------------------------------

//Cod. prueba para enviar correos con nodemailer



const nodemailer = require('nodemailer');

/**
 * Envía un email utilizando nodemailer
 * @param {string} destinatario - Email del destinatario
 * @param {string} asunto - Asunto del email
 * @param {string} mensaje - Mensaje en texto plano
 * @param {Object} datos - Datos adicionales para plantillas
 * @returns {Promise<Object>} - Información sobre el envío del email
 */
const enviarEmail = async (destinatario, asunto, mensaje, datos = {}) => {
  try {
    // Configuración del transporte (esto debería venir de variables de entorno)
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.example.com',
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER || 'user@example.com',
        pass: process.env.EMAIL_PASS || 'password'
      }
    });

    // Generar HTML para el email (se podría usar una plantilla)
    let htmlMensaje = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>${asunto}</h2>
        <p>${mensaje}</p>
    `;

    // Agregar detalles específicos según el tipo de datos
    if (datos.curso) {
      htmlMensaje += `
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 15px;">
          <h3>Detalles del curso:</h3>
          <ul>
            <li><strong>Nombre:</strong> ${datos.curso.nombre_curso}</li>
            <li><strong>Ficha:</strong> ${datos.curso.ficha || 'No asignada'}</li>
            ${datos.curso.fecha_inicio ? `<li><strong>Fecha inicio:</strong> ${new Date(datos.curso.fecha_inicio).toLocaleDateString()}</li>` : ''}
            ${datos.curso.fecha_fin ? `<li><strong>Fecha fin:</strong> ${new Date(datos.curso.fecha_fin).toLocaleDateString()}</li>` : ''}
            ${datos.curso.hora_inicio ? `<li><strong>Hora inicio:</strong> ${datos.curso.hora_inicio}</li>` : ''}
            ${datos.curso.hora_fin ? `<li><strong>Hora fin:</strong> ${datos.curso.hora_fin}</li>` : ''}
            ${datos.curso.dias_formacion ? `<li><strong>Días:</strong> ${datos.curso.dias_formacion}</li>` : ''}
            ${datos.curso.lugar_formacion ? `<li><strong>Lugar:</strong> ${datos.curso.lugar_formacion}</li>` : ''}
          </ul>
        </div>
      `;
    }

    // Si es una notificación que requiere respuesta
    if (datos.notificacion && datos.notificacion.requiere_respuesta) {
      const urlRespuesta = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/responder-disponibilidad/${datos.notificacion.id}`;
      htmlMensaje += `
        <div style="margin-top: 20px;">
          <p><strong>Se requiere su respuesta antes del:</strong> ${datos.notificacion.fecha_limite_respuesta ? new Date(datos.notificacion.fecha_limite_respuesta).toLocaleString() : 'Lo antes posible'}</p>
          <a href="${urlRespuesta}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Responder disponibilidad</a>
        </div>
      `;
    }

    htmlMensaje += `
        <hr style="margin-top: 20px;">
        <p style="font-size: 12px; color: #777;">Este es un mensaje automático del Sistema de Gestión de Formación Complementaria.</p>
      </div>
    `;

    // Enviar el email
    const info = await transporter.sendMail({
      from: `"SGFC - Formación Complementaria" <${process.env.EMAIL_USER || 'noreply@example.com'}>`,
      to: destinatario,
      subject: asunto,
      text: mensaje,
      html: htmlMensaje
    });

    console.log(`Email enviado: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
};

module.exports = enviarEmail;