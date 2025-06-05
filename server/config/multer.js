const multer = require("multer");
const path = require("path");

/*
// Configuración de almacenamiento para multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Carpeta donde se guardarán las imágenes
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (jpeg, png, jpg).'), false);
    }
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
*/


// Almacenamiento de memoria

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
    } else {
        cb(new Error('Campo de archivo no permitido.'));
    }
}


const  upload = multer({storage, fileFilter});

module.exports = upload;


