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


const app = express();
const PORT = 3000;
const CLIENT_ID = process.env.CLIENT_ID;
const JWT_SECRET = process.env.JWT_SECRET;
const client = new OAuth2Client(CLIENT_ID);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3001',
  credentials: true,
}));


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
  const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];

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
  const { token, picture } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { email, name, picture: googlePicture } = payload;

    let usuario = await User.findOne({ email });
    if (!usuario) {
      usuario = new User({
        nombre: name,
        email: email,
        picture: googlePicture // Usar la imagen de perfil de Google
      });
      await usuario.save();
    } else {
      // Actualizar la imagen de perfil si ha cambiado
      if (googlePicture && usuario.picture !== googlePicture) {
        usuario.picture = googlePicture;
        await usuario.save();
      }
    }

    const jwtToken = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: '1h' });
    res.cookie('token', jwtToken, { httpOnly: true });
    res.status(200).json({ message: 'Login exitoso', user: usuario, token: jwtToken });
  } catch (error) {
    console.error('Error en la autenticación:', error);
    res.status(401).json({ message: 'Autenticación fallida' });
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

app.put('/update-user', 
  verifyToken, 
  body('grado').notEmpty().withMessage('El grado es requerido'),
  body('grupo').notEmpty().withMessage('El grupo es requerido'),
  async (req, res) => {
    const { grado, grupo, turno } = req.body;
    const userId = req.user._id;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(userId, {
        grado,
        grupo,
        turno,
      }, { new: true });

      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      return res.json({ message: 'Usuario actualizado correctamente', user: updatedUser });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error al actualizar el usuario', error });
    }
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal', error: err.message });
});

mongoose.connect('mongodb://localhost:27017/BDproyectores')
  .then(() => {
    console.log('Conectado a MongoDB :)');
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });

app.get('/solicitudes', verifyToken, async (req, res) => {
  if (req.user.email !== 'proyectoresunach@gmail.com') {
    return res.status(403).json({ message: 'Acceso no autorizado' });
  }

  try {
    const solicitudes = await Solicitud.find().populate('usuarioId', 'nombre email');
    res.status(200).json(solicitudes);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las solicitudes', error });
  }
});

app.post('/solicitar-proyector', verifyToken, async (req, res) => {
  try {
    const { fechaInicio, fechaFin, motivo, eventId } = req.body;
    const usuarioId = req.user._id;
    
    // Validaciones
    if (!fechaInicio || !fechaFin || !motivo || !eventId) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos: fechaInicio, fechaFin, motivo, eventId' 
      });
    }

    // Verificar que las fechas sean válidas
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
    
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({
        message: 'Las fechas proporcionadas no son válidas'
      });
    }

    // Verificar que la fecha de fin sea posterior a la de inicio
    if (endDate <= startDate) {
      return res.status(400).json({
        message: 'La fecha de fin debe ser posterior a la fecha de inicio'
      });
    }

    // Por ahora, asignaremos un proyectorId fijo (deberías tener una lógica para asignar el proyector)
    const proyectorId = new mongoose.Types.ObjectId('650000000000000000000001');

    // Crear la nueva solicitud
    const nuevaSolicitud = new Solicitud({
      usuarioId,
      proyectorId,
      fechaInicio: startDate,
      fechaFin: endDate,
      motivo,
      eventId,
    });

    // Guardar la solicitud
    await nuevaSolicitud.save();

    // Responder con la solicitud creada
    res.status(201).json({ 
      message: 'Solicitud creada exitosamente',
      solicitud: await nuevaSolicitud.populate('usuarioId', 'nombre email')
    });

  } catch (error) {
    console.error('Error al crear la solicitud:', error);
    res.status(500).json({ 
      message: 'Error al procesar la solicitud',
      error: error.message
    });
  }
});

app.post('/refresh-token', async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const { tokens } = await client.refreshToken(refreshToken);
    res.json({ accessToken: tokens.access_token });
  } catch (error) {
    console.error('Error al renovar el token:', error);
    res.status(500).json({ error: 'No se pudo renovar el token' });
  }
});

