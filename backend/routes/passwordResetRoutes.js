const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, verifyToken: verifyAuthToken, consumeToken } = require('../utils/authTokenUtils');
const { sendPasswordResetEmail } = require('../services/emailService');
const { forgotPasswordLimiter, tokenConsumeLimiter } = require('../middleware/rateLimiters');

const MENSAJE_GENERICO = 'Si el correo existe en nuestro sistema, recibirás una liga para definir tu contraseña.';

router.post('/api/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'El correo es requerido' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const usuario = await User.findOne({ email: normalizedEmail });

    if (usuario) {
      const { rawToken } = await generateToken({ email: normalizedEmail, type: 'reset' });
      try {
        await sendPasswordResetEmail({ to: normalizedEmail, rawToken });
      } catch (emailError) {
        console.error('Error al enviar correo de reset:', emailError);
      }
    }

    res.status(200).json({ message: MENSAJE_GENERICO });
  } catch (error) {
    console.error('Error en forgot-password:', error);
    res.status(200).json({ message: MENSAJE_GENERICO });
  }
});

router.get('/api/reset-password/validar/:token', async (req, res) => {
  try {
    const doc = await verifyAuthToken({ rawToken: req.params.token, type: 'reset' });
    if (!doc) {
      return res.status(410).json({ valid: false, reason: 'Liga inválida o expirada' });
    }
    res.json({ valid: true, email: doc.email });
  } catch (error) {
    console.error('Error al validar token de reset:', error);
    res.status(500).json({ valid: false, reason: 'Error al validar la liga' });
  }
});

router.post('/api/reset-password/completar', tokenConsumeLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    const doc = await verifyAuthToken({ rawToken: token, type: 'reset' });
    if (!doc) {
      return res.status(410).json({ message: 'Liga inválida o expirada' });
    }

    const usuario = await User.findOne({ email: doc.email });
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    usuario.passwordHash = await bcrypt.hash(password, 12);
    await usuario.save();
    await consumeToken(doc);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al completar reset de contraseña:', error);
    res.status(500).json({ message: 'Error al restablecer la contraseña' });
  }
});

module.exports = router;
