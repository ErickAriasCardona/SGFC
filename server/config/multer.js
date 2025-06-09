const multer = require("multer");
const path = require("path");


const storage = multer.memoryStorage(); // Almacena la imagen en tipo buffer 
/*
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jepg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan imagenes (jepg, png, jpg)'))
    }
};
*/
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
    } else if(file.fieldname = 'archivo_xlsx'){
        const validMimetype = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
        if (validMimetype.includes(file.mimetype)) {
            cb(null, true);
        }else{
            cb(new Error('Solo se permiten archivos .xlsx'), false)
        }
    } else {
        cb(new Error('Campo de archivo no permitido.'));
    }
}

const  upload = multer({storage, fileFilter});

module.exports = upload;

