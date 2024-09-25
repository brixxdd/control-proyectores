const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;

// Clave secreta para JWT
const JWT_SECRET = 'mi_secreto_super_secreto';

app.use(express.json());
app.use(cookieParser());

// Ruta principal para mostrar un mensaje en la raíz
app.get('/', (req, res) => {
  res.send('¡Bienvenido al servidor Express!');
});

// Simulando autenticación (normalmente sería una validación con una base de datos)
const users = [{ email: 'usuario@unach.mx', password: '12345' }];

// Ruta de inicio de sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    const token = jwt.sign({ email: user.email }, JWT_SECRET, { expiresIn: '1h' });

    // Enviar el token en una cookie segura con HttpOnly
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'Strict'
    });

    res.json({ message: 'Inicio de sesión exitoso' });
  } else {
    res.status(401).json({ message: 'Credenciales inválidas' });
  }
});

// Ruta protegida que requiere autenticación
app.get('/protected', (req, res) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'No autenticado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ message: 'Acceso concedido', user: decoded });
  } catch (err) {
    res.status(403).json({ message: 'Token inválido o expirado' });
  }
});

// Ruta para cerrar sesión
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Sesión cerrada correctamente' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

