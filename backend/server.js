require('dotenv').config(); // Cargar variables de entorno

// Agrega el log aquí para ver las variables de entorno
console.log('Variables de entorno:', process.env);

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
  origin: 'http://localhost:3001',
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
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

app.get('/', (req, res) => {
  res.send('Bienvenido a la API de control de proyectores');
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
  const cookieToken = req.cookies.token;
  const headerToken = req.headers['authorization']?.split(' ')[1];
  const token = cookieToken || headerToken;

  console.log('=== Token Verification Debug ===');
  console.log('Cookie Token:', cookieToken ? 'Presente' : 'No presente');
  console.log('Header Authorization:', headerToken ? 'Presente' : 'No presente');
  console.log('Token usado:', token ? 'Token encontrado' : 'No se encontró token');
  console.log('Headers completos:', req.headers);
  console.log('Cookies completas:', req.cookies);
  console.log('============================');

  if (!token) {
    return res.status(401).json({ message: 'No se proporcionó token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const usuarioExistente = await User.findById(decoded.id);

    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    req.user = usuarioExistente;
    next();
  } catch (error) {
    console.error("Error al verificar el token JWT:", error);
    return res.status(401).json({ message: 'Token inválido o expirado' });
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
      { expiresIn: '1h' }
    );

    console.log('Usuario autenticado:', {
      email: usuario.email,
      isAdmin: email === 'proyectoresunach@gmail.com'
    });

    res.status(200).json({ 
      message: 'Login exitoso',
      user: usuario,
      token: jwtToken,
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
    const userId = req.user._id;

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
  res.status(500).json({ message: 'Algo salió mal', error: err.message });
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
    const usuarioId = req.user._id;
    
    // Log para verificar los datos recibidos
    console.log('Datos recibidos en el backend:', {
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
    if (!fechaInicio || !fechaFin || !motivo || !eventId || !grado || !grupo || !turno) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos',
        camposRecibidos: {
          fechaInicio: !!fechaInicio,
          fechaFin: !!fechaFin,
          motivo: !!motivo,
          eventId: !!eventId,
          grado: !!grado,
          grupo: !!grupo,
          turno: !!turno
        }
      });
    }

    const proyectorId = new mongoose.Types.ObjectId('650000000000000000000001');

    const nuevaSolicitud = new Solicitud({
      usuarioId,
      proyectorId,
      fechaInicio,
      fechaFin,
      motivo,
      eventId,
      grado,
      grupo,
      turno
    });

    // Log antes de guardar
    console.log('Nueva solicitud a guardar:', nuevaSolicitud);

    const solicitudGuardada = await nuevaSolicitud.save();

    // Log después de guardar
    console.log('Solicitud guardada:', solicitudGuardada);

    // Populate los datos del usuario para la respuesta
    const solicitudConUsuario = await solicitudGuardada.populate('usuarioId', 'nombre email');

    res.status(201).json({ 
      message: 'Solicitud creada exitosamente',
      solicitud: solicitudConUsuario
    });

  } catch (error) {
    console.error('Error detallado al crear la solicitud:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const { tokens } = await oauth2Client.refreshToken(refreshToken);
    res.json({ accessToken: tokens.access_token });
  } catch (error) {
    console.error('Error al renovar el token:', error);
    res.status(500).json({ error: 'No se pudo renovar el token' });
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

const uri = process.env.MONGODB_URI; // Asegúrate de que esto esté configurado

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
