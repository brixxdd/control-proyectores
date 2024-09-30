const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;
const CLIENT_ID = '217386513987-f2uhmkqcb8stdrr04ona8jioh0tgs2j2.apps.googleusercontent.com'; // Tu Google OAuth Client ID
const client = new OAuth2Client(CLIENT_ID);

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3001', // Frontend origin
  credentials: true, // Permitir uso de credenciales (cookies)
}));

// Middleware para verificar el token de Google
const verifyToken = async (req, res, next) => {
  const token = req.cookies.token; // Obtenemos el token de la cookie

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Verificar si el dominio del correo es '@unach.mx'
    if (payload.email && payload.email.endsWith('@unach.mx')) {
      req.user = payload; // Almacenar la información del usuario en la solicitud
      next();
    } else {
      return res.status(403).json({ message: 'Correo no autorizado' });
    }
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado', error });
  }
};

app.get('/check-session', verifyToken, (req, res) => {
  res.status(200).json({ message: 'Sesión activa', user: req.user });
});


// Ruta protegida
app.get('/protected', verifyToken, (req, res) => {
  res.json({ message: 'Acceso concedido', user: req.user });
});

// Ruta para iniciar sesión (almacena el token en una cookie)
app.post('/login', async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Token no proporcionado' });
  }

  try {
    // Verificar el token recibido antes de almacenarlo
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // Verificar si el dominio del correo es '@unach.mx'
    if (!payload.email || !payload.email.endsWith('@unach.mx')) {
      return res.status(403).json({ message: 'Correo no autorizado' });
    }

    // Almacenar el token en una cookie segura
    res.cookie('token', token, {
      httpOnly: true,        // Solo accesible por el servidor
      secure: false,         // Cambiar a true en producción (HTTPS)
      sameSite: 'None',      // Permite el uso de cookies en diferentes dominios
    });

    res.json({ message: 'Inicio de sesión exitoso', user: payload });
  } catch (error) {
    return res.status(400).json({ message: 'Error al verificar el token', error });
  }
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  res.clearCookie('token'); // Elimina la cookie de sesión
  res.json({ message: 'Sesión cerrada correctamente' });
});

// Manejo de errores generales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo salió mal', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

