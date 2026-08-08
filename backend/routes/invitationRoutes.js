const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AuthToken = require('../models/AuthToken');
const { verifyToken, isAdmin } = require('../middleware/auth');
const ADMIN_EMAILS = require('../config/adminEmails');
const { generateToken } = require('../utils/authTokenUtils');
const { sendInvitationEmail } = require('../services/emailService');

function esCorreoPermitido(email) {
  return email.endsWith('@unach.mx') || ADMIN_EMAILS.includes(email);
}

router.post('/api/invitaciones', verifyToken, isAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'El correo es requerido' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    if (!esCorreoPermitido(normalizedEmail)) {
      return res.status(400).json({ message: 'Solo se permiten correos institucionales (@unach.mx) o administradores autorizados' });
    }

    const usuarioExistente = await User.findOne({ email: normalizedEmail });
    if (usuarioExistente?.passwordHash) {
      return res.status(409).json({ message: 'Este usuario ya está registrado' });
    }

    const { rawToken, doc } = await generateToken({ email: normalizedEmail, type: 'invite', invitedBy: req.user.id });

    try {
      await sendInvitationEmail({ to: normalizedEmail, rawToken });
    } catch (emailError) {
      console.error('Error al enviar correo de invitación:', emailError);
      return res.status(502).json({ message: 'Invitación creada pero falló el envío del correo. Puedes reenviarla desde el panel.' });
    }

    res.status(201).json({ message: 'Invitación enviada', email: normalizedEmail, expiresAt: doc.expiresAt });
  } catch (error) {
    console.error('Error al crear invitación:', error);
    res.status(500).json({ message: 'Error al crear la invitación' });
  }
});

router.get('/api/invitaciones', verifyToken, isAdmin, async (req, res) => {
  try {
    const { estado } = req.query;
    const filtro = { type: 'invite' };

    if (estado === 'pendiente') {
      filtro.used = false;
      filtro.expiresAt = { $gt: new Date() };
    } else if (estado === 'expirada') {
      filtro.used = false;
      filtro.expiresAt = { $lte: new Date() };
    } else if (estado === 'usada') {
      filtro.used = true;
    }

    const invitaciones = await AuthToken.find(filtro)
      .populate('invitedBy', 'nombre email')
      .sort({ createdAt: -1 });

    res.json(invitaciones);
  } catch (error) {
    console.error('Error al listar invitaciones:', error);
    res.status(500).json({ message: 'Error al obtener invitaciones' });
  }
});

router.post('/api/invitaciones/:id/reenviar', verifyToken, isAdmin, async (req, res) => {
  try {
    const invitacion = await AuthToken.findOne({ _id: req.params.id, type: 'invite' });
    if (!invitacion) {
      return res.status(404).json({ message: 'Invitación no encontrada' });
    }

    const usuarioExistente = await User.findOne({ email: invitacion.email });
    if (usuarioExistente?.passwordHash) {
      return res.status(409).json({ message: 'Este usuario ya completó su registro' });
    }

    const { rawToken, doc } = await generateToken({ email: invitacion.email, type: 'invite', invitedBy: req.user.id });

    try {
      await sendInvitationEmail({ to: invitacion.email, rawToken });
    } catch (emailError) {
      console.error('Error al reenviar correo de invitación:', emailError);
      return res.status(502).json({ message: 'Invitación regenerada pero falló el envío del correo. Intenta reenviar de nuevo.' });
    }

    res.json({ message: 'Invitación reenviada', email: invitacion.email, expiresAt: doc.expiresAt });
  } catch (error) {
    console.error('Error al reenviar invitación:', error);
    res.status(500).json({ message: 'Error al reenviar la invitación' });
  }
});

router.delete('/api/invitaciones/:id', verifyToken, isAdmin, async (req, res) => {
  try {
    const invitacion = await AuthToken.findOneAndUpdate(
      { _id: req.params.id, type: 'invite', used: false },
      { used: true, usedAt: new Date() }
    );
    if (!invitacion) {
      return res.status(404).json({ message: 'Invitación no encontrada o ya procesada' });
    }
    res.json({ message: 'Invitación revocada' });
  } catch (error) {
    console.error('Error al revocar invitación:', error);
    res.status(500).json({ message: 'Error al revocar la invitación' });
  }
});

module.exports = router;
