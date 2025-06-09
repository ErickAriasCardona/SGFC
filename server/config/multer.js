const multer = require("multer");
const path = require("path");


// Almacenamiento de memoria
const storage = multer.memoryStorage(); // Almacena la imagen en tipo buffer 

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jepg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan imagenes (jepg, png, jpg)'))
    }
};

const  upload = multer({storage, fileFilter});

module.exports = upload;

