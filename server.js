const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const CLIENT_ID = '217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com'; // Client ID de tu Google OAuth

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3001', // Permitir solo el origen del frontend
  credentials: true, // Permitir el uso de credenciales
}));



// Instancia del cliente OAuth de Google
const client = new OAuth2Client(CLIENT_ID);

// Middleware para verificar token de Google
const verifyToken = async (req, res, next) => {
  const token = req.cookies.token; // Supongamos que el token viene en una cookie

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (payload.email.endsWith('@unach.mx')) {
      req.user = payload; // Guardar la información del usuario en la solicitud
      next();
    } else {
      return res.status(403).json({ message: 'Correo no autorizado' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado', error });
  }
};

// Ruta pública
app.get('/', (req, res) => {
  res.send('¡Bienvenido al servidor Express!');
});

// Ruta protegida que requiere autenticación
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Acceso concedido', user: req.user });
});

// Ruta para iniciar sesión (almacena el token en una cookie)
app.post('/login', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  // Almacena el token en una cookie
res.cookie('token', token, {
  httpOnly: true,
  secure: false, // Cambia a true en producción
  sameSite: 'None', // Necesario para enviar cookies con CORS
});


  res.json({ message: 'Inicio de sesión exitoso' });
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

