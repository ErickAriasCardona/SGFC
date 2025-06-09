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



// Carga de archivos en fire base

/*
import { initializeApp } from "firebase/app";
import { getStorage, ref,  uploadBytes, getDownloadURL } from "@firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { getAnalytics} from 'firebase/analytics' 

const firebaseConfig = {
  apiKey: "AIzaSyA-8DUUAbJSK70d07SHqgZYkGTvtbXjInY",
  authDomain: "sgfc-images.firebaseapp.com",
  projectId: "sgfc-images",
  storageBucket: "sgfc-images.firebasestorage.app",
  messagingSenderId: "385189873572",
  appId: "1:385189873572:web:29d06047090a6343692331",
  measurementId: "G-NF20VTZF2D"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export async function uploadFile(file) {
  try {
    const uniqueFileName = uuidv4(); // Genera un nombre de archivo único
    const storageRef = ref(storage, uniqueFileName);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error al cargar el archivo:", error);
    throw error; // Re-lanza el error para que pueda ser manejado externamente si es necesario
  }
}
*/
