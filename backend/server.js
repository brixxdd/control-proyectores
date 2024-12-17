require('dotenv').config();
console.log('Variables de entorno:', {
  MONGODB_URI: process.env.MONGODB_URI ? 'Presente' : 'Falta',
  CLIENT_ID: process.env.CLIENT_ID ? 'Presente' : 'Falta',
  JWT_SECRET: process.env.JWT_SECRET ? 'Presente' : 'Falta'
});

const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Solicitud = require('./models/Solicitud');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
require('dotenv').config();
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');
const Proyector = require('./models/Proyector');
const multer = require('multer');
const path = require('path');
const Document = require('./models/Document');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const FileType = require('file-type');
const proyectorRoutes = require('./routes/proyectorRoutes');


if (!process.env.CLIENT_ID || !process.env.JWT_SECRET) {
  console.error('Error: Variables de entorno no configuradas correctamente');
  console.error('CLIENT_ID:', process.env.CLIENT_ID ? 'Presente' : 'Falta');
  console.error('JWT_SECRET:', process.env.JWT_SECRET ? 'Presente' : 'Falta');
  process.exit(1);
}

const app = express();
const PORT = 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const oauth2Client = new OAuth2Client(CLIENT_ID);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [
    'http://localhost:3001',
    'https://control-proyectores-2wir.vercel.app'
  ],
  credentials: true,
}));

app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
  res.setHeader(
    'Content-Security-Policy',
    "frame-ancestors 'self' https://accounts.google.com https://*.google.com; " +
    "frame-src 'self' https://accounts.google.com https://*.google.com; " +
    "script-src 'self' https://accounts.google.com https://*.googleusercontent.com 'unsafe-inline' 'unsafe-eval';"
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'ALLOWALL');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  console.log('Petición recibida:', {
    método: req.method,
    ruta: req.path,
    parámetros: req.params,
    cuerpo: req.body
  });
  next();
});

app.use('/uploads', (req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' blob:;");
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static('uploads'));

app.get('/', (req, res) => {
  res.json({ message: 'Bienvenido a la API de control de proyectores' });
});

app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await User.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
});

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    console.log(req.user)
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

app.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Sesión cerrada correctamente' });
});

app.get('/check-session', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    console.log('Datos del usuario enviados:', user); // Agrega este log
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        nombre: user.nombre, 
        picture: user.picture 
      } 
    });
  } catch (error) {
    console.error('Error al verificar el token:', error);
    res.status(401).json({ message: 'Token inválido o expirado' });
  }
});

app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Acceso concedido', user: req.user });
});

app.post('/login', async (req, res) => {
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  try {
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('Google payload:', payload);

    if (!payload) {
      return res.status(401).json({ message: 'Payload de Google inválido' });
    }

    const { email, name, picture } = payload;

    if (email !== 'proyectoresunach@gmail.com' && !email.endsWith('@unach.mx')) {
      return res.status(401).json({ 
        message: 'Solo se permiten correos institucionales (@unach.mx) o administradores autorizados' 
      });
    }

    let pvez = null;
    let usuario = await User.findOne({ email });
    if (!usuario) {
      usuario = new User({
        nombre: name,
        email: email,
        picture: picture,
        isAdmin: email === 'proyectoresunach@gmail.com'
      });
      await usuario.save();
      pvez = true
    }else{
      if(usuario.grado === null && usuario.grupo === null && usuario.turno === null){
        pvez = true
      }
    }


    const jwtToken = jwt.sign(
      { 
        id: usuario._id,
        email: usuario.email,
        isAdmin: email === 'proyectoresunach@gmail.com'
      }, 
      JWT_SECRET,
      { expiresIn: '30m' }
    );

    const refreshToken = jwt.sign(
      { id: usuario._id },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Usuario autenticado:', {
      email: usuario.email,
      isAdmin: email === 'proyectoresunach@gmail.com'
    });

    res.status(200).json({ 
      message: 'Login exitoso',
      user: usuario,
      token: jwtToken,
      refreshToken,
      pvez
    });

  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(401).json({ 
      message: 'Autenticación fallida',
      error: error.message 
    });
  }
});

app.post('/calendar-event', verifyToken, async (req, res) => {
  const user = req.user;
  const googleToken = user.googleToken;

  try {
    const calendarApiUrl = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
    
    const event = {
      summary: 'Solicitud de proyector',
      start: {
        dateTime: '2024-10-02T09:00:00-07:00',
        timeZone: 'America/Mexico_City',
      },
      end: {
        dateTime: '2024-10-02T10:00:00-07:00',
        timeZone: 'America/Mexico_City',
      },
    };

    const response = await axios.post(calendarApiUrl, event, {
      headers: {
        Authorization: `Bearer ${googleToken}`,
      }
    });

    res.status(200).json({ message: 'Evento creado en Google Calendar', event: response.data });
  } catch (error) {
    res.status(500).json({ message: 'Error al crear evento en Google Calendar', error });
  }
});

app.put('/update-user', verifyToken, async (req, res) => {
  try {
    const { grado, grupo, turno } = req.body;
    const userId = req.user.id;

    // Validar los datos recibidos
    if (!grado || !grupo || !turno) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos' 
      });
    }

    // Actualizar el usuario
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        grado, 
        grupo, 
        turno 
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado' 
      });
    }

    res.json({ 
      message: 'Usuario actualizado correctamente',
      user: updatedUser 
    });

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ 
      message: 'Error al actualizar el usuario',
      error: error.message 
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Error interno del servidor' });
});


/*mongoose.connect('mongodb://localhost:27017/BDproyectores')
  .then(() => {
    console.log('Conectado a MongoDB 🥳');
        app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });*/

/*mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/BDproyectores')
  .then(() => {
    console.log('Conectado a MongoDB :)');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });*/

app.get('/solicitudes', verifyToken, async (req, res) => {
  try {
    // Verificar si el usuario es admin
    if (req.user.email !== 'proyectoresunach@gmail.com') {
      return res.status(403).json({ message: 'Acceso no autorizado' });
    }

    // Modificamos el populate para incluir los campos adicionales
    const solicitudes = await Solicitud.find().populate('usuarioId', 'nombre email grado grupo turno');
    console.log('Solicitudes encontradas:', solicitudes.length);
    res.status(200).json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ message: 'Error al obtener las solicitudes', error });
  }
});

app.post('/solicitar-proyector', verifyToken, async (req, res) => {
  try {
    const { fechaInicio, fechaFin, motivo, eventId, grado, grupo, turno } = req.body;
    const usuarioId = req.user.id;
    
    // Log para debugging
    console.log('Datos recibidos:', {
      fechaInicio,
      fechaFin,
      motivo,
      eventId,
      grado,
      grupo,
      turno,
      usuarioId
    });

    // Validaciones mejoradas
    if (!fechaInicio || !fechaFin || !motivo || !eventId) {
      return res.status(400).json({ 
        message: 'Los campos fechaInicio, fechaFin, motivo y eventId son requeridos',
        camposRecibidos: {
          fechaInicio: !!fechaInicio,
          fechaFin: !!fechaFin,
          motivo: !!motivo,
          eventId: !!eventId
        }
      });
    }

    // Convertir fechas a objetos Date
    const fechaInicioDate = new Date(fechaInicio);
    const fechaFinDate = new Date(fechaFin);

    const proyectorId = new mongoose.Types.ObjectId('650000000000000000000001');

    const nuevaSolicitud = new Solicitud({
      usuarioId: new mongoose.Types.ObjectId(usuarioId),
      proyectorId,
      fechaInicio: fechaInicioDate,
      fechaFin: fechaFinDate,
      motivo,
      eventId,
      grado: grado || null,
      grupo: grupo || null,
      turno: turno || null,
      estado: 'pendiente'
    });

    // Log antes de guardar
    console.log('Nueva solicitud a guardar:', nuevaSolicitud);

    const solicitudGuardada = await nuevaSolicitud.save();
    const solicitudConUsuario = await solicitudGuardada.populate('usuarioId');

    res.status(201).json({ 
      message: 'Solicitud creada exitosamente',
      solicitud: solicitudConUsuario
    });

  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/refresh-token', async (req, res) => {
  const refreshToken = req.headers['authorization']?.split(' ')[1];
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const newToken = jwt.sign(
      { 
        id: user._id,
        email: user.email,
        isAdmin: user.email === 'proyectoresunach@gmail.com'
      }, 
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ 
      token: newToken,
      user: {
        id: user._id,
        email: user.email,
        nombre: user.nombre,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('Error al renovar token:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

// Middleware para verificar si es admin
const isAdmin = async (req, res, next) => {
  const userEmail = req.user.email;
  
  if (userEmail !== 'proyectoresunach@gmail.com') {
    console.log('Acceso denegado para:', userEmail);
    return res.status(403).json({ 
      message: 'Acceso denegado: Se requieren privilegios de administrador' 
    });
  }
  
  console.log('Acceso de administrador concedido para:', userEmail);
  next();
};

// Rutas protegidas para admin
app.get('/admin/usuarios', verifyToken, isAdmin, async (req, res) => {
  try {
    const usuarios = await User.find();
    res.status(200).json(usuarios);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener usuarios', error });
  }
});

app.get('/admin/solicitudes', verifyToken, isAdmin, async (req, res) => {
  try {
    const solicitudes = await Solicitud.find().populate('usuarioId', 'nombre email');
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las solicitudes', error });
  }
});

app.put('/solicituds/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    // Validar que el estado sea uno de los permitidos
    const estadosPermitidos = ['pendiente', 'aprobado', 'rechazado'];
    if (!estadosPermitidos.includes(estado)) {
      return res.status(400).json({ 
        message: 'Estado no válido. Debe ser: pendiente, aprobado o rechazado' 
      });
    }

    console.log('Actualizando solicitud:', { id, estado });

    const solicitudActualizada = await Solicitud.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );

    if (!solicitudActualizada) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.json({ 
      message: 'Estado actualizado correctamente',
      solicitud: solicitudActualizada 
    });

  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ message: 'Error al actualizar el estado' });
  }
});

const uri = process.env.MONGODB_URI; // Asegurate de que esto esté configurado

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
  .then(() => {
    console.log('Conectado a MongoDB Atlas! 🥳');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });

app.get('/mis-solicitudes', verifyToken, async (req, res) => {
  try {
    // Agregar más logs para debugging
    console.log('Token recibido:', req.headers.authorization);
    console.log('Usuario autenticado:', {
      id: req.user.id,
      email: req.user.email
    });

    const solicitudes = await Solicitud.find({ 
      usuarioId: req.user.id 
    });
    
    // Log para ver la consulta
    console.log('Consulta MongoDB:', {
      usuarioId: req.user.id,
      encontradas: solicitudes.length
    });

    // Si no hay solicitudes, enviar array vacío pero con mensaje
    if (!solicitudes || solicitudes.length === 0) {
      console.log('No se encontraron solicitudes para el usuario');
      return res.json([]);
    }

    const solicitudesFormateadas = await Solicitud.find({ 
      usuarioId: req.user.id 
    })
    .sort({ createdAt: -1 })
    .select('_id motivo fechaInicio fechaFin estado')
    .lean();

    res.json(solicitudesFormateadas);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ 
      message: 'Error al obtener solicitudes',
      error: error.message 
    });
  }
});

// Ruta para obtener estadísticas del dashboard
app.get('/dashboard-stats', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Obtener estadísticas
    const stats = {
      proyectoresDisponibles: await Proyector.countDocuments({ estado: 'disponible' }),
      solicitudesPendientes: await Solicitud.countDocuments({ estado: 'pendiente' }),
      solicitudesActivas: await Solicitud.countDocuments({ estado: 'aprobado' }),
      misSolicitudes: await Solicitud.countDocuments({ usuarioId: userId })
    };

    res.json(stats);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas' });
  }
});

app.get('/api/mis-solicitudes', verifyToken, async (req, res) => {
  try {
    const solicitudes = await Solicitud.find({ 
      usuarioId: req.user.id 
    })
    .sort({ createdAt: -1 })
    .populate('proyectorId', 'nombre codigo')
    .select('materia profesor salon fechaInicio fechaFin estado motivo comentarios')
    .lean();

    res.json(solicitudes);
  } catch (error) {
    console.error('Error al obtener solicitudes:', error);
    res.status(500).json({ message: 'Error al obtener solicitudes' });
  }
});

// Configuración de multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({ storage });

app.post('/upload-pdf', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    // Verificar si el usuario ya tiene un documento
    const existingDoc = await Document.findOne({ 
      usuarioId: req.body.usuarioId 
    });

    if (existingDoc) {
      // Si existe, eliminar el archivo anterior
      if (fs.existsSync(existingDoc.filePath)) {
        fs.unlinkSync(existingDoc.filePath);
      }
      // Eliminar el registro de la base de datos
      await Document.findByIdAndDelete(existingDoc._id);
    }

    // Crear nuevo nombre de archivo con el nombre del usuario
    const nombreUsuario = req.body.nombre.replace(/\s+/g, '_').toLowerCase();
    const extension = path.extname(req.file.originalname);
    const nuevoNombre = `${nombreUsuario}-${Date.now()}${extension}`;
    const nuevaRuta = path.join('uploads', nuevoNombre);

    // Renombrar el archivo
    fs.renameSync(req.file.path, nuevaRuta);

    const documentoSubido = await Document.create({
      filePath: nuevaRuta,
      usuarioId: req.body.usuarioId,
      email: req.body.email,
      nombre: req.body.nombre,
      grado: req.body.grado,
      grupo: req.body.grupo,
      turno: req.body.turno,
      estado: 'pendiente'
    });

    await documentoSubido.populate('usuarioId');

    res.status(200).json({ 
      message: 'Archivo subido exitosamente', 
      filePath: nuevaRuta,
      documento: documentoSubido
    });
  } catch (error) {
    console.error('Error al subir archivo:', error);
    res.status(500).json({ message: 'Error al subir archivo' });
  }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para obtener todos los documentos
app.get('/documentos', verifyToken, async (req, res) => {
  try {
    const documentos = await Document.find()
      .populate('usuarioId', 'nombre email grado grupo turno') // Popula la información del usuario
      .sort({ createdAt: -1 }); // Ordena por fecha de creación, más recientes primero

    res.json(documentos);
  } catch (error) {
    console.error('Error al obtener documentos:', error);
    res.status(500).json({ message: 'Error al obtener documentos' });
  }
});

// Ruta para actualizar el estado de un documento
app.put('/documentos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    const documento = await Document.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    ).populate('usuarioId', 'nombre email grado grupo turno');

    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    res.json(documento);
  } catch (error) {
    console.error('Error al actualizar documento:', error);
    res.status(500).json({ message: 'Error al actualizar documento' });
  }
});

// Ruta para obtener un documento específico
app.get('/documentos/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const documento = await Document.findById(id)
      .populate('usuarioId', 'nombre email grado grupo turno');

    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    res.json(documento);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ message: 'Error al obtener documento' });
  }
});

app.get('/documentos/usuario/:usuarioId', verifyToken, async (req, res) => {
  try {
    const documento = await Document.findOne({ 
      usuarioId: req.params.usuarioId 
    });
    
    if (!documento) {
      return res.status(404).json({ message: 'No se encontró ningún documento' });
    }

    res.json(documento);
  } catch (error) {
    console.error('Error al obtener documento:', error);
    res.status(500).json({ message: 'Error al obtener documento' });
  }
});

// Ruta para eliminar un documento
app.delete('/documentos/:id', verifyToken, async (req, res) => {
  try {
    const documento = await Document.findById(req.params.id);
    
    if (!documento) {
      return res.status(404).json({ message: 'Documento no encontrado' });
    }

    // Eliminar el archivo físico
    const fs = require('fs');
    if (fs.existsSync(documento.filePath)) {
      fs.unlinkSync(documento.filePath);
    }

    // Eliminar el registro de la base de datos
    await Document.findByIdAndDelete(req.params.id);

    res.json({ message: 'Documento eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar documento:', error);
    res.status(500).json({ message: 'Error al eliminar documento' });
  }
});

// Configurar middleware de subida de archivos
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
}));

// Función para validar archivo PDF usando metadatos
const validatePDF = async (file) => {
  try {
    // Analizar los primeros bytes del archivo para determinar el tipo real
    const fileTypeResult = await FileType.fromBuffer(file.data);
    
    // Verificar que sea realmente un PDF
    if (!fileTypeResult || fileTypeResult.mime !== 'application/pdf') {
      throw new Error('El archivo no es un PDF válido');
    }

    // Verificar la firma del archivo PDF (%PDF-) al inicio
    const header = file.data.slice(0, 4).toString('ascii');
    if (!header.startsWith('%PDF')) {
      throw new Error('El archivo no tiene una firma PDF válida');
    }

    return true;
  } catch (error) {
    console.error('Error validando PDF:', error);
    return false;
  }
};

// Ruta para subir documentos
app.post('/upload', verifyToken, async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ message: 'No se subió ningún archivo' });
    }

    const file = req.files.file;
    const userData = req.body;

    // Validar que sea un PDF real
    const isValidPDF = await validatePDF(file);
    if (!isValidPDF) {
      return res.status(400).json({ 
        message: 'El archivo no es un PDF válido o podría ser malicioso' 
      });
    }

    // Generar nombre único para el archivo
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.pdf`;
    const filePath = `uploads/${fileName}`;

    // Mover archivo a la carpeta de uploads
    await file.mv(filePath);

    // Crear documento en la base de datos
    const documento = new Document({
      filePath,
      usuarioId: userData.usuarioId,
      email: userData.email,
      nombre: userData.nombre,
      grado: userData.grado,
      grupo: userData.grupo,
      turno: userData.turno
    });

    await documento.save();

    // Devolver el documento creado
    res.status(200).json({
      message: 'Documento subido exitosamente',
      documento: documento
    });

  } catch (error) {
    console.error('Error al subir documento:', error);
    res.status(500).json({ 
      message: 'Error al subir el documento',
      error: error.message 
    });
  }
});

// Asegurarse de que la carpeta uploads exista
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configurar headers de seguridad para la carpeta uploads
app.use('/uploads', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self' blob: data:; object-src 'self' blob: data:; frame-ancestors 'self';");
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Ruta específica para PDFs con headers adicionales
app.get('/view-pdf/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).send('PDF no encontrado');
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename=' + filename);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self' blob: data:; object-src 'self' blob: data:; frame-ancestors 'self';");

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    console.error('Error al servir PDF:', error);
    res.status(500).send('Error al servir el PDF');
  }
});

// Usar las rutas de proyectores
app.use('/api/proyectores', proyectorRoutes);

app.put('/api/solicitudes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, proyectorId } = req.body;
    
    const solicitudActualizada = await Solicitud.findByIdAndUpdate(
      id,
      { 
        estado,
        proyectorId 
      },
      { new: true }
    );

    if (!solicitudActualizada) {
      return res.status(404).json({ message: 'Solicitud no encontrada' });
    }

    res.json(solicitudActualizada);
  } catch (error) {
    console.error('Error al actualizar solicitud:', error);
    res.status(500).json({ message: 'Error al actualizar la solicitud' });
  }
});

// Ruta para actualizar el estado del proyector
app.put('/api/proyectores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    
    const proyectorActualizado = await Proyector.findByIdAndUpdate(
      id,
      { estado },
      { new: true }
    );

    if (!proyectorActualizado) {
      return res.status(404).json({ message: 'Proyector no encontrado' });
    }

    res.json(proyectorActualizado);
  } catch (error) {
    console.error('Error al actualizar proyector:', error);
    res.status(500).json({ message: 'Error al actualizar el proyector' });
  }
});

// Ruta para eliminar proyector
app.delete('/api/proyectores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const proyector = await Proyector.findByIdAndDelete(id);
    
    if (!proyector) {
      return res.status(404).json({ message: 'Proyector no encontrado' });
    }
    
    res.json({ message: 'Proyector eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar proyector:', error);
    res.status(500).json({ message: 'Error al eliminar el proyector' });
  }
});

app.get('/api/proyectores', async (req, res) => {
  try {
    const { estado } = req.query;
    const query = estado ? { estado } : {};
    const proyectores = await Proyector.find(query);
    res.json(proyectores);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proyectores', error });
  }
});
