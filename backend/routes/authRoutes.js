const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const ADMIN_EMAILS = require('../config/adminEmails');
const { authLimiter } = require('../middleware/rateLimiters');

router.post('/login', authLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Correo y contraseña son requeridos' });
  }

  try {
    const normalizedEmail = email.toLowerCase().trim();
    const usuario = await User.findOne({ email: normalizedEmail });

    if (!usuario) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    if (!usuario.passwordHash) {
      return res.status(403).json({
        message: 'Esta cuenta todavía no tiene contraseña. Usa "¿Olvidaste tu contraseña?" para definirla.',
        codigoError: 'PASSWORD_NOT_SET'
      });
    }

    const passwordOk = await bcrypt.compare(password, usuario.passwordHash);
    if (!passwordOk) {
      return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    }

    const isAdmin = ADMIN_EMAILS.includes(usuario.email);
    const pvez = usuario.grado === null && usuario.grupo === null && usuario.turno === null;

    const jwtToken = jwt.sign(
      { id: usuario._id, email: usuario.email, isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      { id: usuario._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({ message: 'Login exitoso', user: usuario, token: jwtToken, refreshToken, pvez });
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ message: 'Error al iniciar sesión' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Sesión cerrada correctamente' });
});

router.get('/check-session', verifyToken, async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json({ user: usuario, message: 'Sesión válida' });
  } catch (error) {
    console.error('Error al verificar sesión:', error);
    res.status(500).json({ message: 'Error al verificar la sesión' });
  }
});

router.post('/refresh-token', async (req, res) => {
  const refreshToken = req.headers['authorization']?.split(' ')[1];

  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const newToken = jwt.sign(
      { id: user._id, email: user.email, isAdmin: ADMIN_EMAILS.includes(user.email) },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({ token: newToken, user: { id: user._id, email: user.email, nombre: user.nombre, picture: user.picture } });
  } catch (error) {
    console.error('Error al renovar token:', error);
    res.status(401).json({ message: 'Invalid refresh token' });
  }
});

module.exports = router;
