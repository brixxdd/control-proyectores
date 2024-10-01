const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User'); // Asegúrate de tener tu modelo definido
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator'); // Agregamos express-validator

const app = express();
const PORT = 3000;
const CLIENT_ID = '217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com'; // Tu Google OAuth Client ID
const JWT_SECRET = 'tu_clave_secreta'; // Define una clave secreta para JWT
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

    // Busca al usuario en la base de datos
    const usuarioExistente = await User.findOne({ email: payload.email });

    if (!usuarioExistente) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Almacenar el usuario en la solicitud
    req.user = usuarioExistente;
    next();
  } catch (error) {
    // Si hay un error, intentamos verificarlo como un token JWT
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

// Ruta para actualizar grado y grupo del usuario
app.put('/update-user', 
  verifyToken, 
  body('grado').notEmpty().withMessage('El grado es requerido'),
  body('grupo').notEmpty().withMessage('El grupo es requerido'),
  async (req, res) => {
    const { grado, grupo, turno } = req.body;
    const userId = req.user._id; // Asegúrate de que `req.user` contenga el id correcto

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
      }, { new: true }); // Esto devuelve el nuevo objeto

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
