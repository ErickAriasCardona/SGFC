const Curso = require("../models/curso");
const User = require("../models/User");
const path = require("path");
const AsignacionCursoInstructor = require("../models/AsignacionCursoInstructor");
const { sendCourseCreatedEmail } = require("../services/emailService");
const { Router } = require("express");
const upload = require("../config/multer");
const { sendCursoUpdatedNotification } = require("../services/emailService");
const { InscripcionCurso } = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");

//Asignar cursos
const asignarCursoAInstructor = async (req, res) => {
  const { gestor_ID, instructor_ID, curso_ID, fecha_asignacion, estado } =
    req.body;

  try {
    // Validación básica
    if (!gestor_ID || !instructor_ID || !curso_ID) {
      return res.status(400).json({
        mensaje:
          "Todos los campos (gestor_ID, instructor_ID, curso_ID) son obligatorios",
      });
    }

    // Validar existencia del gestor
    const gestor = await User.findByPk(gestor_ID);
    if (!gestor || gestor.accountType !== "Gestor") {
      return res
        .status(404)
        .json({ mensaje: "Gestor no encontrado o no válido" });
    }

    // Validar existencia del instructor
    const instructor = await User.findByPk(instructor_ID);
    if (!instructor || instructor.accountType !== "Instructor") {
      return res
        .status(404)
        .json({ mensaje: "Instructor no encontrado o no válido" });
    }

    // Validar existencia del curso
    const curso = await Curso.findByPk(curso_ID);
    if (!curso) {
      return res.status(404).json({ mensaje: "Curso no encontrado" });
    }

    // Validar que no se haya asignado ya este curso al instructor
    const asignacionExistente = await AsignacionCursoInstructor.findOne({
      where: {
        gestor_ID,
        instructor_ID,
        curso_ID,
      },
    });

    if (asignacionExistente) {
      return res.status(409).json({
        mensaje: "Este curso ya ha sido asignado a este instructor previamente",
      });
    }

    // Crear la nueva asignación
    const nuevaAsignacion = await AsignacionCursoInstructor.create({
      gestor_ID,
      instructor_ID,
      curso_ID,
      fecha_asignacion: fecha_asignacion || new Date(),
      estado: estado || "aceptada",
    });

    res.status(201).json({
      mensaje: "Curso asignado correctamente",
      asignacion: nuevaAsignacion,
    });
  } catch (error) {
    console.error("Error al asignar curso:", error);
    res.status(500).json({
      mensaje: "Error interno al asignar el curso",
    });
  }
};

//consultar cursos asignador a un instructor
const obtenerCursosAsignadosAInstructor = async (req, res) => {
  const { instructor_ID } = req.params;

  try {
    if (!instructor_ID) {
      return res
        .status(400)
        .json({ mensaje: "El ID del instructor es obligatorio" });
    }

    const asignaciones = await AsignacionCursoInstructor.findAll({
      where: { instructor_ID },
      include: [
        {
          model: Curso,
          attributes: ["id", "nombre_curso", "descripcion", "imagen"], // ajusta campos según tu modelo
        },
      ],
    });

    res.status(200).json(asignaciones);
  } catch (error) {
    console.error("Error al obtener los cursos asignados:", error);
    res
      .status(500)
      .json({ mensaje: "Error interno al obtener los cursos asignados" });
  }
};

// Crear un curso (solo para administradores)
const createCurso = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== "Administrador") {
      return res
        .status(403)
        .json({ message: "No tienes permisos para crear cursos." });
    }

    const {
      nombre_curso,
      descripcion,
      tipo_oferta,
      ficha,
      estado,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      dias_formacion,
      lugar_formacion,
    } = req.body;

    // Validar campos obligatorios
    if (!ficha || !nombre_curso || !descripcion || !tipo_oferta || !estado) {
      return res.status(400).json({
        message:
          "Los campos nombre_curso, tipo_oferta, ficha, descripcion y estado son obligatorios.",
      });
    }

    // Procesar imagen y convertir a Base64 si se envió
    let image = null;
    if (req.file) {
      const base64Data = req.file.buffer.toString("base64");
      const uniqueName = `${req.file.fieldname}-${Date.now()}.txt`;
      const savePath = path.join(__dirname, "../base64storage", uniqueName);

      if (!fs.existsSync(path.dirname(savePath))) {
        fs.mkdirSync(path.dirname(savePath), { recursive: true });
      }
      fs.writeFileSync(savePath, base64Data);

      image = `/base64storage/${uniqueName}`;
    }

    // Procesar días de formación
    let diasFormacionParsed = dias_formacion;
    if (typeof dias_formacion === "string") {
      try {
        diasFormacionParsed = JSON.parse(dias_formacion);
      } catch (e) {
        return res.status(400).json({
          message: "El formato de los días de formación no es válido.",
        });
      }
    }

    // Crear el curso
    const nuevoCurso = await Curso.create({
      nombre_curso,
      descripcion,
      tipo_oferta,
      ficha,
      estado,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      dias_formacion: diasFormacionParsed,
      lugar_formacion,
      imagen: image,
    });

    // Responder con éxito
    res.status(201).json({ message: "Curso creado con éxito." });

    // Buscar usuarios verificados
    const usuarios = await User.findAll({
      where: {
        verificacion_email: true,
        accountType: { [Op.or]: ["Empresa", "Aprendiz"] },
      },
      attributes: ["email"],
    });

    const emails = usuarios.map((user) => user.email);

    if (emails.length === 0) {
      console.warn("No hay usuarios aceptados para mandar Email");
    } else {
      const courseLink = `http://localhost:5173/cursos/${nuevoCurso.id}`;
      await sendCourseCreatedEmail(emails, nombre_curso, courseLink);
    }
  } catch (error) {
    console.error("Error al crear el curso:", error);

    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ message: "Error de validación.", errors: error.errors });
    }

    res.status(500).json({ message: "Error al crear el curso." });
  }
};

// Actualizar un curso (solo para administradores)
const updateCurso = async (req, res) => {
  try {
    const { accountType } = req.user;
    if (accountType !== "Administrador") {
      return res
        .status(403)
        .json({ message: "No tienes permisos para actualizar cursos." });
    }

    const { id } = req.params;
    const {
      nombre_curso,
      descripcion,
      tipo_oferta,
      ficha,
      fecha_inicio,
      fecha_fin,
      hora_inicio,
      hora_fin,
      dias_formacion,
      lugar_formacion,
      estado,
    } = req.body;

    // === VALIDACIONES DE FECHAS Y HORAS ===
    console.log("=== VALIDANDO FECHAS EN updateCurso ===");

    // Solo validar si se están enviando fechas
    if (fecha_inicio || fecha_fin) {
      // Ambas fechas deben estar presentes si se va a actualizar programación
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({
          message:
            "Si actualiza fechas, debe proporcionar tanto fecha_inicio como fecha_fin",
          fecha_inicio_presente: !!fecha_inicio,
          fecha_fin_presente: !!fecha_fin,
        });
      }

      // Validar formato de fechas
      const fechaRegex = /^(\d{4})-([0-1][0-9])-([0-3][0-9])$/;

      if (!fechaRegex.test(fecha_inicio)) {
        return res.status(400).json({
          message: "Formato de fecha_inicio inválido. Use formato YYYY-MM-DD",
          fecha_recibida: fecha_inicio,
        });
      }

      if (!fechaRegex.test(fecha_fin)) {
        return res.status(400).json({
          message: "Formato de fecha_fin inválido. Use formato YYYY-MM-DD",
          fecha_recibida: fecha_fin,
        });
      }

      // Extraer componentes y validar rangos
      const [, yearInicio, monthInicio, dayInicio] =
        fecha_inicio.match(fechaRegex);
      const [, yearFin, monthFin, dayFin] = fecha_fin.match(fechaRegex);

      const añoInicio = parseInt(yearInicio);
      const mesInicio = parseInt(monthInicio);
      const diaInicio = parseInt(dayInicio);
      const añoFin = parseInt(yearFin);
      const mesFin = parseInt(monthFin);
      const diaFin = parseInt(dayFin);

      // Validar año razonable
      if (añoInicio < 2024 || añoInicio > 2030) {
        return res.status(400).json({
          message: "El año de fecha_inicio debe estar entre 2024 y 2030",
          año_recibido: añoInicio,
          fecha_recibida: fecha_inicio,
        });
      }

      if (añoFin < 2024 || añoFin > 2030) {
        return res.status(400).json({
          message: "El año de fecha_fin debe estar entre 2024 y 2030",
          año_recibido: añoFin,
          fecha_recibida: fecha_fin,
        });
      }

      // Validar mes
      if (mesInicio < 1 || mesInicio > 12) {
        return res.status(400).json({
          message: "El mes de fecha_inicio debe estar entre 01 y 12",
          mes_recibido: monthInicio,
          fecha_recibida: fecha_inicio,
        });
      }

      if (mesFin < 1 || mesFin > 12) {
        return res.status(400).json({
          message: "El mes de fecha_fin debe estar entre 01 y 12",
          mes_recibido: monthFin,
          fecha_recibida: fecha_fin,
        });
      }

      // Validar día
      if (diaInicio < 1 || diaInicio > 31) {
        return res.status(400).json({
          message: "El día de fecha_inicio debe estar entre 01 y 31",
          dia_recibido: dayInicio,
          fecha_recibida: fecha_inicio,
        });
      }

      if (diaFin < 1 || diaFin > 31) {
        return res.status(400).json({
          message: "El día de fecha_fin debe estar entre 01 y 31",
          dia_recibido: dayFin,
          fecha_recibida: fecha_fin,
        });
      }

      // Crear objetos Date para comparación
      const fechaInicioObj = new Date(añoInicio, mesInicio - 1, diaInicio);
      const fechaFinObj = new Date(añoFin, mesFin - 1, diaFin);
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      // Validar que fechas sean válidas
      if (isNaN(fechaInicioObj.getTime()) || isNaN(fechaFinObj.getTime())) {
        return res.status(400).json({
          message: "Una o ambas fechas son inválidas",
          fecha_inicio_valida: !isNaN(fechaInicioObj.getTime()),
          fecha_fin_valida: !isNaN(fechaFinObj.getTime()),
        });
      }

      // Validar que fecha_inicio no sea anterior a hoy
      if (fechaInicioObj < hoy) {
        return res.status(400).json({
          message: "La fecha de inicio no puede ser anterior a la fecha actual",
          fecha_actual: hoy.toISOString().split("T")[0],
          fecha_inicio_recibida: fecha_inicio,
        });
      }

      // Validar que fecha_fin sea posterior a fecha_inicio
      if (fechaFinObj <= fechaInicioObj) {
        return res.status(400).json({
          message: "La fecha de fin debe ser posterior a la fecha de inicio",
          fecha_inicio_recibida: fecha_inicio,
          fecha_fin_recibida: fecha_fin,
        });
      }

      console.log("✅ Validaciones de fecha pasaron en updateCurso");
    }

    // === VALIDACIONES DE HORAS ===
    if (hora_inicio || hora_fin) {
      // Ambas horas deben estar presentes
      if (!hora_inicio || !hora_fin) {
        return res.status(400).json({
          message:
            "Si actualiza horarios, debe proporcionar tanto hora_inicio como hora_fin",
          hora_inicio_presente: !!hora_inicio,
          hora_fin_presente: !!hora_fin,
        });
      }

      // Validar formato de horas
      const horaRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

      if (!horaRegex.test(hora_inicio)) {
        return res.status(400).json({
          message:
            "Formato de hora_inicio inválido. Use formato HH:MM o HH:MM:SS",
          hora_recibida: hora_inicio,
        });
      }

      if (!horaRegex.test(hora_fin)) {
        return res.status(400).json({
          message: "Formato de hora_fin inválido. Use formato HH:MM o HH:MM:SS",
          hora_recibida: hora_fin,
        });
      }

      // Normalizar horas (agregar segundos si no están)
      const horaInicioNorm =
        hora_inicio.includes(":") && hora_inicio.split(":").length === 2
          ? hora_inicio + ":00"
          : hora_inicio;
      const horaFinNorm =
        hora_fin.includes(":") && hora_fin.split(":").length === 2
          ? hora_fin + ":00"
          : hora_fin;

      // Validar que hora_fin sea posterior a hora_inicio
      const [horaInicioH, horaInicioM] = horaInicioNorm.split(":").map(Number);
      const [horaFinH, horaFinM] = horaFinNorm.split(":").map(Number);

      const minutosInicio = horaInicioH * 60 + horaInicioM;
      const minutosFin = horaFinH * 60 + horaFinM;

      if (minutosFin <= minutosInicio) {
        return res.status(400).json({
          message: "La hora de fin debe ser posterior a la hora de inicio",
          hora_inicio_recibida: hora_inicio,
          hora_fin_recibida: hora_fin,
        });
      }

      // Validar duración mínima (1 hora)
      const duracionMinutos = minutosFin - minutosInicio;
      if (duracionMinutos < 60) {
        return res.status(400).json({
          message: "El curso debe tener una duración mínima de 1 hora",
          duracion_actual_minutos: duracionMinutos,
        });
      }

      console.log("✅ Validaciones de hora pasaron en updateCurso");
    }

    // === RESTO DEL CÓDIGO ORIGINAL ===

    // Buscar el curso real en la base de datos
    const curso = await Curso.findByPk(id);
    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    // Verificar si se envió una nueva imagen
    let image = null;
    if (req.file) {
      const base64Data = req.file.buffer.toString("base64");
      const uniqueName = `${req.file.fieldname}-${Date.now()}.txt`;
      const savePath = path.join(__dirname, "../base64storage", uniqueName);

      if (!fs.existsSync(path.dirname(savePath))) {
        fs.mkdirSync(path.dirname(savePath), { recursive: true });
      }
      fs.writeFileSync(savePath, base64Data);

      image = `/base64storage/${uniqueName}`;
    }

    // Preparar datos para actualización
    const datosActualizacion = {
      nombre_curso,
      descripcion,
      tipo_oferta,
      ficha,
      dias_formacion,
      lugar_formacion,
      estado,
    };

    // Solo incluir fechas y horas si fueron validadas
    if (fecha_inicio && fecha_fin) {
      datosActualizacion.fecha_inicio = fecha_inicio;
      datosActualizacion.fecha_fin = fecha_fin;
    }

    if (hora_inicio && hora_fin) {
      // Normalizar formato de horas
      datosActualizacion.hora_inicio =
        hora_inicio.includes(":") && hora_inicio.split(":").length === 2
          ? hora_inicio + ":00"
          : hora_inicio;
      datosActualizacion.hora_fin =
        hora_fin.includes(":") && hora_fin.split(":").length === 2
          ? hora_fin + ":00"
          : hora_fin;
    }

    if (image) {
      datosActualizacion.imagen = image;
    }

    // Actualizar el curso en la base de datos
    await curso.update(datosActualizacion);

    const usuarios = await User.findAll({
      where: {
        verificacion_email: true,
        accountType: { [Op.or]: ["Empresa", "Aprendiz"] },
      },
      attributes: ["email"],
    });
    const emails = usuarios.map((user) => user.email);

    if (emails.length === 0) {
      console.warn("No hay usuarios aceptados para mandar Email");
    } else {
      await sendCursoUpdatedNotification(emails, curso);
    }

    res.status(200).json({
      message: `Curso actualizado con éxito. Notificaciones enviadas a ${emails.length} usuarios.`,
      curso,
      validaciones_aplicadas: {
        fechas: !!(fecha_inicio && fecha_fin),
        horas: !!(hora_inicio && hora_fin),
      },
    });
  } catch (error) {
    console.error("Error al actualizar el curso:", error);
    res.status(500).json({ message: "Error al actualizar el curso." });
  }
};

// Obtener todos los cursos
const getAllCursos = async (req, res) => {
  try {
    const cursos = await Curso.findAll(); // Obtener todos los cursos
    res.status(200).json(cursos);
  } catch (error) {
    console.error("Error al obtener los cursos:", error);
    res.status(500).json({ message: "Error al obtener los cursos." });
  }
};

// Obtener un curso por ID
const getCursoById = async (req, res) => {
  try {
    const { id } = req.params; // Obtener el ID del curso desde los parámetros de la URL
    const curso = await Curso.findByPk(id); // Buscar el curso por ID

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    res.status(200).json(curso);
  } catch (error) {
    console.error("Error al obtener el curso:", error);
    res.status(500).json({ message: "Error al obtener el curso." });
  }
};

//obtener curso por ficha
const getCursoByFicha = async (req, res) => {
  try {
    const { ficha } = req.params; // Obtener la ficha del curso desde los parámetros de la URL
    console.log("Ficha recibida:", ficha); // Log para verificar el valor recibido

    // Buscar el curso por ficha
    const curso = await Curso.findOne({ where: { ficha } });
    console.log("Resultado de la consulta:", curso); // Log para verificar el resultado de la consulta

    if (!curso) {
      return res.status(404).json({ message: "Curso no encontrado." });
    }

    res.status(200).json(curso);
  } catch (error) {
    console.error("Error al obtener el curso por ficha:", error);
    res.status(500).json({ message: "Error al obtener el curso." });
  }
};

// Nuevo controlador para transformacion
const uploadImagesBase64 = async (req, res) => {
  try {
    const file = req.file;
    if (!file)
      return res.status(400).json({ message: "No se recibio ningun archivo" });

    const base64Data = file.buffer.toString("base64");
    const uniqueName = `${file.fieldname}-${Date.now()}.txt`;
    const savePath = path.join(__dirname, "../base64storage", uniqueName);

    if (!fs.existsSync(path.dirname(savePath))) {
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
    }

    fs.writeFileSync(savePath, base64Data);

    return res.status(200).json({
      message: "Imagen convertida y guardada.",
      filename: uniqueName,
      path: savePath,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al guardar la imagen." });
  }
};

const actualizarProgramacion = async (req, res) => {
  console.log("=== FUNCIÓN actualizarProgramacion INICIADA ===");

  try {
    const { accountType } = req.user;
    console.log("Usuario accountType:", accountType);

    // Verificar permisos
    if (accountType !== "Administrador" && accountType !== "Gestor") {
      console.log("❌ ACCESO DENEGADO - Tipo de cuenta:", accountType);
      return res.status(403).json({
        error: "No tienes permisos para actualizar la programación de cursos.",
      });
    }

    const { id } = req.params;
    const { fecha_inicio, fecha_fin, hora_inicio, hora_fin, dias_formacion } =
      req.body;

    console.log("=== DATOS RECIBIDOS ===");
    console.log("ID del curso:", id);
    console.log("fecha_inicio:", fecha_inicio, "tipo:", typeof fecha_inicio);
    console.log("fecha_fin:", fecha_fin, "tipo:", typeof fecha_fin);
    console.log("hora_inicio:", hora_inicio, "tipo:", typeof hora_inicio);
    console.log("hora_fin:", hora_fin, "tipo:", typeof hora_fin);

    // PASO 1: Validación de datos obligatorios
    console.log("=== PASO 1: Validando campos obligatorios ===");
    if (!fecha_inicio || !fecha_fin || !hora_inicio || !hora_fin) {
      console.log("❌ CAMPOS FALTANTES");
      console.log("fecha_inicio presente:", !!fecha_inicio);
      console.log("fecha_fin presente:", !!fecha_fin);
      console.log("hora_inicio presente:", !!hora_inicio);
      console.log("hora_fin presente:", !!hora_fin);

      return res.status(400).json({
        error: "Todos los campos temporales son requeridos",
        campos_requeridos: [
          "fecha_inicio",
          "fecha_fin",
          "hora_inicio",
          "hora_fin",
        ],
        campos_recibidos: {
          fecha_inicio: !!fecha_inicio,
          fecha_fin: !!fecha_fin,
          hora_inicio: !!hora_inicio,
          hora_fin: !!hora_fin,
        },
      });
    }
    console.log("✅ Todos los campos obligatorios están presentes");

    // PASO 2: Validar formato de fechas con regex
    console.log("=== PASO 2: Validando formato de fechas ===");
    const fechaRegex = /^(\d{4})-([0-1][0-9])-([0-3][0-9])$/;

    console.log("Probando regex en fecha_inicio:", fecha_inicio);
    const testInicio = fechaRegex.test(fecha_inicio);
    console.log("Resultado test fecha_inicio:", testInicio);

    if (!testInicio) {
      console.log("❌ FORMATO DE FECHA_INICIO INVÁLIDO");
      return res.status(400).json({
        error: "Formato de fecha_inicio inválido. Use formato YYYY-MM-DD",
        fecha_recibida: fecha_inicio,
        formato_esperado: "YYYY-MM-DD (ej: 2025-12-31)",
        regex_usado: fechaRegex.toString(),
      });
    }

    console.log("Probando regex en fecha_fin:", fecha_fin);
    const testFin = fechaRegex.test(fecha_fin);
    console.log("Resultado test fecha_fin:", testFin);

    if (!testFin) {
      console.log("❌ FORMATO DE FECHA_FIN INVÁLIDO");
      return res.status(400).json({
        error: "Formato de fecha_fin inválido. Use formato YYYY-MM-DD",
        fecha_recibida: fecha_fin,
        formato_esperado: "YYYY-MM-DD (ej: 2025-12-31)",
        regex_usado: fechaRegex.toString(),
      });
    }
    console.log("✅ Formato de fechas válido");

    // PASO 3: Extraer y validar componentes de fecha
    console.log("=== PASO 3: Extrayendo componentes de fecha ===");
    const matchInicio = fecha_inicio.match(fechaRegex);
    const matchFin = fecha_fin.match(fechaRegex);

    console.log("Match fecha_inicio:", matchInicio);
    console.log("Match fecha_fin:", matchFin);

    if (!matchInicio || !matchFin) {
      console.log("❌ ERROR EN EXTRACCIÓN DE COMPONENTES");
      return res.status(400).json({
        error: "Error al procesar las fechas",
        match_inicio: !!matchInicio,
        match_fin: !!matchFin,
      });
    }

    const [, yearInicio, monthInicio, dayInicio] = matchInicio;
    const [, yearFin, monthFin, dayFin] = matchFin;

    const añoInicio = parseInt(yearInicio);
    const mesInicio = parseInt(monthInicio);
    const diaInicio = parseInt(dayInicio);
    const añoFin = parseInt(yearFin);
    const mesFin = parseInt(monthFin);
    const diaFin = parseInt(dayFin);

    console.log("Componentes fecha_inicio:", {
      añoInicio,
      mesInicio,
      diaInicio,
    });
    console.log("Componentes fecha_fin:", { añoFin, mesFin, diaFin });

    // PASO 4: Validar rangos de año
    console.log("=== PASO 4: Validando rangos de año ===");
    if (añoInicio < 2024 || añoInicio > 2030) {
      console.log("❌ AÑO DE INICIO FUERA DE RANGO:", añoInicio);
      return res.status(400).json({
        error: "El año de fecha_inicio debe estar entre 2024 y 2030",
        año_recibido: añoInicio,
        fecha_recibida: fecha_inicio,
        rango_valido: "2024-2030",
      });
    }

    if (añoFin < 2024 || añoFin > 2030) {
      console.log("❌ AÑO DE FIN FUERA DE RANGO:", añoFin);
      return res.status(400).json({
        error: "El año de fecha_fin debe estar entre 2024 y 2030",
        año_recibido: añoFin,
        fecha_recibida: fecha_fin,
        rango_valido: "2024-2030",
      });
    }
    console.log("✅ Años dentro del rango válido");

    // PASO 5: Validar mes
    console.log("=== PASO 5: Validando meses ===");
    if (mesInicio < 1 || mesInicio > 12) {
      console.log("❌ MES DE INICIO INVÁLIDO:", mesInicio);
      return res.status(400).json({
        error: "El mes de fecha_inicio debe estar entre 01 y 12",
        mes_recibido: monthInicio,
        fecha_recibida: fecha_inicio,
      });
    }

    if (mesFin < 1 || mesFin > 12) {
      console.log("❌ MES DE FIN INVÁLIDO:", mesFin);
      return res.status(400).json({
        error: "El mes de fecha_fin debe estar entre 01 y 12",
        mes_recibido: monthFin,
        fecha_recibida: fecha_fin,
      });
    }
    console.log("✅ Meses válidos");

    // PASO 6: Validar días
    console.log("=== PASO 6: Validando días ===");
    if (diaInicio < 1 || diaInicio > 31) {
      console.log("❌ DÍA DE INICIO INVÁLIDO:", diaInicio);
      return res.status(400).json({
        error: "El día de fecha_inicio debe estar entre 01 y 31",
        dia_recibido: dayInicio,
        fecha_recibida: fecha_inicio,
      });
    }

    if (diaFin < 1 || diaFin > 31) {
      console.log("❌ DÍA DE FIN INVÁLIDO:", diaFin);
      return res.status(400).json({
        error: "El día de fecha_fin debe estar entre 01 y 31",
        dia_recibido: dayFin,
        fecha_recibida: fecha_fin,
      });
    }
    console.log("✅ Días válidos");

    // PASO 7: Crear objetos Date
    console.log("=== PASO 7: Creando objetos Date ===");
    const fechaInicio = new Date(añoInicio, mesInicio - 1, diaInicio);
    const fechaFin = new Date(añoFin, mesFin - 1, diaFin);

    console.log("fechaInicio creado:", fechaInicio);
    console.log("fechaFin creado:", fechaFin);
    console.log("fechaInicio válido:", !isNaN(fechaInicio.getTime()));
    console.log("fechaFin válido:", !isNaN(fechaFin.getTime()));

    if (isNaN(fechaInicio.getTime()) || isNaN(fechaFin.getTime())) {
      console.log("❌ FECHAS INVÁLIDAS DESPUÉS DE CREAR OBJETOS DATE");
      return res.status(400).json({
        error: "Una o ambas fechas son inválidas",
        fecha_inicio_valida: !isNaN(fechaInicio.getTime()),
        fecha_fin_valida: !isNaN(fechaFin.getTime()),
      });
    }

    // PASO 8: Validar fecha actual
    console.log("=== PASO 8: Validando contra fecha actual ===");
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    console.log("Fecha actual:", hoy);
    console.log("fechaInicio:", fechaInicio);
    console.log("fechaInicio < hoy:", fechaInicio < hoy);

    if (fechaInicio < hoy) {
      console.log("❌ FECHA DE INICIO ES ANTERIOR A HOY");
      return res.status(400).json({
        error: "La fecha de inicio no puede ser anterior a la fecha actual",
        fecha_actual: hoy.toISOString().split("T")[0],
        fecha_inicio_recibida: fecha_inicio,
        comparacion: {
          fecha_inicio_timestamp: fechaInicio.getTime(),
          fecha_actual_timestamp: hoy.getTime(),
          diferencia_dias: Math.floor(
            (hoy - fechaInicio) / (1000 * 60 * 60 * 24)
          ),
        },
      });
    }

    // PASO 9: Validar orden de fechas
    console.log("=== PASO 9: Validando orden de fechas ===");
    console.log("fechaFin:", fechaFin);
    console.log("fechaFin <= fechaInicio:", fechaFin <= fechaInicio);
    console.log("Comparación timestamps:", {
      fechaInicio: fechaInicio.getTime(),
      fechaFin: fechaFin.getTime(),
      diferencia: fechaFin.getTime() - fechaInicio.getTime(),
    });

    if (fechaFin <= fechaInicio) {
      console.log("❌ FECHA DE FIN NO ES POSTERIOR A FECHA DE INICIO");
      return res.status(400).json({
        error: "La fecha de fin debe ser posterior a la fecha de inicio",
        fecha_inicio_recibida: fecha_inicio,
        fecha_fin_recibida: fecha_fin,
        detalle: `${fecha_fin} debe ser posterior a ${fecha_inicio}`,
        timestamps: {
          fecha_inicio: fechaInicio.getTime(),
          fecha_fin: fechaFin.getTime(),
          diferencia_ms: fechaFin.getTime() - fechaInicio.getTime(),
        },
      });
    }
    console.log("✅ Orden de fechas correcto");

    // Si llegamos aquí, todas las validaciones pasaron
    console.log("=== ✅ TODAS LAS VALIDACIONES PASARON ===");

    // Continuar con el resto de la lógica...
    const diferenciaDias = Math.ceil(
      (fechaFin - fechaInicio) / (1000 * 60 * 60 * 24)
    );
    console.log("Duración del curso:", diferenciaDias, "días");

    // Buscar el curso
    const curso = await Curso.findByPk(id);
    if (!curso) {
      console.log("❌ CURSO NO ENCONTRADO");
      return res.status(404).json({
        error: "Curso no encontrado",
      });
    }

    console.log("✅ Curso encontrado:", curso.nombre_curso);

    // Actualizar el curso (por ahora solo las fechas para testing)
    await curso.update({
      fecha_inicio,
      fecha_fin,
    });

    console.log("✅ CURSO ACTUALIZADO EXITOSAMENTE");

    res.status(200).json({
      mensaje: "Programación actualizada con éxito",
      validaciones_pasadas: true,
      curso: {
        id: curso.id,
        nombre_curso: curso.nombre_curso,
        fecha_inicio: curso.fecha_inicio,
        fecha_fin: curso.fecha_fin,
        duracion_dias: diferenciaDias,
      },
    });
  } catch (error) {
    console.error("❌ ERROR EN actualizarProgramacion:", error);
    res.status(500).json({
      error: "Error interno del servidor al actualizar la programación",
      detalles: error.message,
    });
  }
};

module.exports = {
  createCurso,
  updateCurso,
  getAllCursos,
  getCursoById,
  getCursoByFicha,
  asignarCursoAInstructor,
  obtenerCursosAsignadosAInstructor,
  uploadImagesBase64,
  actualizarProgramacion,
};
