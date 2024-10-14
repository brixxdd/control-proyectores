  const express = require('express');
  const { OAuth2Client } = require('google-auth-library');
  const cookieParser = require('cookie-parser');
  const cors = require('cors');
  const mongoose = require('mongoose');
  const User = require('./models/User'); // Asegúrate de tener tu modelo definido
  const jwt = require('jsonwebtoken');
  const { body, validationResult } = require('express-validator'); // Agregamos express-validator
  require('dotenv').config(); // Cargar variables de entorno desde .env
  const axios = require('axios'); // Agrega esta línea

  const app = express();
  const PORT = 3000;
  const CLIENT_ID = process.env.CLIENT_ID; // Usar el CLIENT_ID definido en .env
  const JWT_SECRET = process.env.JWT_SECRET; // Usar la clave secreta definida en .env
  const client = new OAuth2Client(CLIENT_ID);

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors({
    origin: 'http://localhost:3001', // Frontend origin
    credentials: true, // Permitir uso de credenciales (cookies)
  }));

  // Ruta principal
  app.get('/', (req, res) => {
    res.send('Bienvenido a la API de control de proyectores');
  });

  // Ruta para obtener todos los usuarios
  app.get('/usuarios', async (req, res) => {
    try {
      const usuarios = await User.find();
      res.status(200).json(usuarios);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener usuarios', error });
    }
  });

  // Middleware para verificar el token JWT y el token de Google
  const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: 'No autenticado' });
    }

    try {
      // Intentamos verificar el token como un token de Google
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      // Verificar si el dominio del correo es '@unach.mx'
      if (!payload.email || !payload.email.endsWith('@unach.mx')) {
        return res.status(403).json({ message: 'Correo no autorizado' });
      }

      const usuarioExistente = await User.findOne({ email: payload.email });

      if (!usuarioExistente) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      req.user = usuarioExistente;
      next();
    } catch (error) {
      // Intentamos verificarlo como un token JWT si falla el de Google
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const usuarioExistente = await User.findById(decoded.id);
        
        if (!usuarioExistente) {
          return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        req.user = usuarioExistente; // Almacenar el usuario en la solicitud
        next();
      } catch (error) {
        return res.status(401).json({ message: 'Token inválido o expirado', error });
      }
    }
  };

  // Ruta para cerrar sesión
  app.post('/logout', (req, res) => {
    res.clearCookie('token'); // Elimina la cookie de sesión
    return res.status(200).json({ message: 'Sesión cerrada correctamente' });
  });




  // Ruta para verificar la sesión
  app.get('/check-session', verifyToken, async (req, res) => {
    try {
      const user = await User.findOne({ email: req.user.email });
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }

      const isFirstLogin = (!user.grado || !user.grupo);
      res.status(200).json({ message: 'Sesión activa', user, isFirstLogin });
    } catch (error) {
      res.status(500).json({ message: 'Error al verificar la sesión', error });
    }
  });

  // Ruta protegida
  app.get('/protected', verifyToken, (req, res) => {
    res.json({ message: 'Acceso concedido', user: req.user });
  });

  // Ruta para iniciar sesión
  app.post('/login', async (req, res) => {
    const { token } = req.body;

    if (!token) {
      // Si no hay token en el cuerpo, intentamos obtener el de la cookie
      const existingToken = req.cookies.token;
      if (existingToken) {
        // Verificar el token existente
        try {
          const decoded = jwt.verify(existingToken, JWT_SECRET);
          const usuarioExistente = await User.findById(decoded.id);
          if (usuarioExistente) {
            return res.status(200).json({ message: 'Sesión activa', user: usuarioExistente });
          }
        } catch (error) {
          // Si el token es inválido o ha expirado, continuamos con la lógica normal
        }
      }
      return res.status(400).json({ message: 'Token no proporcionado y no hay sesión activa' });
    }

    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
      });

      const payload = ticket.getPayload();

      if (!payload.email || !payload.email.endsWith('@unach.mx')) {
        return res.status(403).json({ message: 'Correo no autorizado' });
      }

      const usuarioExistente = await User.findOne({ email: payload.email });

      if (usuarioExistente) {
        // Generar nuevo JWT solo si no hay uno existente
        const jwtToken = jwt.sign({ id: usuarioExistente._id }, JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', jwtToken, { httpOnly: true });
        return res.status(200).json({ message: 'Usuario ya existe', user: usuarioExistente });
      }

      const nuevoUsuario = new User({
        nombre: payload.name,
        email: payload.email,
        grado: null,
        grupo: null,
        turno: null
      });
      
      await nuevoUsuario.save();
      const jwtToken = jwt.sign({ id: nuevoUsuario._id }, JWT_SECRET, { expiresIn: '1h' });
      res.cookie('token', jwtToken, { httpOnly: true });
      res.json({ message: 'Usuario creado exitosamente', user: nuevoUsuario });
    } catch (error) {
      return res.status(400).json({ message: 'Error al verificar el token', error });
    }
  });

  // Ruta para interactuar con Google Calendar API
app.post('/calendar-event', verifyToken, async (req, res) => {
  const user = req.user;  // Usuario autenticado
  const googleToken = user.googleToken;  // Asegúrate de haber guardado este token

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


  // Ruta para actualizar grado y grupo del usuario
  // Ruta para actualizar grado y grupo del usuario
  app.put('/update-user', 
    verifyToken, 
    body('grado').notEmpty().withMessage('El grado es requerido'),
    body('grupo').notEmpty().withMessage('El grupo es requerido'),
    async (req, res) => {
      const { grado, grupo, turno } = req.body;
      const userId = req.user._id;

      // Validación de errores
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


  // Manejo de errores generales
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal', error: err.message });
  });

  // Conexión a MongoDB
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
