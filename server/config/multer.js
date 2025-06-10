const multer = require("multer");
const path = require("path");

// Almacenamiento de memoria

const storage = multer.memoryStorage(); // Almacena la imagen en tipo buffer 
const fileFilter = (req, file, cb) => {
    if (file.fieldname === 'foto_perfil') {
        // Solo las imagenes
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Solo se aceptan imágenes (jpeg, jpg, png) para foto_perfil.'));
        }
    } else if (file.fieldname === 'document_pdf') {
        // Solo los pdf
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Solo se acepta PDF para document_pdf.'));
        }
    } else {
        cb(new Error('Campo de archivo no permitido.'));
    }
}


const  upload = multer({storage, fileFilter});

module.exports = upload;


