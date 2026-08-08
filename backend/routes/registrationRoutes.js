const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ADMIN_EMAILS = require('../config/adminEmails');
const { verifyToken: verifyAuthToken, consumeToken } = require('../utils/authTokenUtils');
const { tokenConsumeLimiter } = require('../middleware/rateLimiters');

const GRADO_REGEX = /^[1-9]$/;
const GRUPO_REGEX = /^[a-zA-Z]$/;
const TURNOS_VALIDOS = ['Matutino', 'Vespertino'];

router.get('/api/registro/validar/:token', async (req, res) => {
  try {
    const doc = await verifyAuthToken({ rawToken: req.params.token, type: 'invite' });
    if (!doc) {
      return res.status(410).json({ valid: false, reason: 'Liga inválida o expirada' });
    }
    res.json({ valid: true, email: doc.email });
  } catch (error) {
    console.error('Error al validar token de registro:', error);
    res.status(500).json({ valid: false, reason: 'Error al validar la liga' });
  }
});

router.post('/api/registro/completar', tokenConsumeLimiter, async (req, res) => {
  try {
    const { token, nombre, grado, grupo, turno, password } = req.body;

    if (!token || !nombre || !grado || !grupo || !turno || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres' });
    }
    if (!GRADO_REGEX.test(grado)) {
      return res.status(400).json({ message: 'Grado inválido' });
    }
    if (!GRUPO_REGEX.test(grupo)) {
      return res.status(400).json({ message: 'Grupo inválido' });
    }
    if (!TURNOS_VALIDOS.includes(turno)) {
      return res.status(400).json({ message: 'Turno inválido' });
    }

    const doc = await verifyAuthToken({ rawToken: token, type: 'invite' });
    if (!doc) {
      return res.status(410).json({ message: 'Liga inválida o expirada' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const isAdmin = ADMIN_EMAILS.includes(doc.email);

    let usuario = await User.findOne({ email: doc.email });
    if (usuario) {
      usuario.nombre = nombre;
      usuario.grado = grado;
      usuario.grupo = grupo.toUpperCase();
      usuario.turno = turno;
      usuario.passwordHash = passwordHash;
      usuario.isAdmin = isAdmin;
      usuario.perfilModificadoEn = new Date();
      await usuario.save();
    } else {
      usuario = await User.create({
        nombre,
        email: doc.email,
        grado,
        grupo: grupo.toUpperCase(),
        turno,
        passwordHash,
        isAdmin,
        perfilModificadoEn: new Date()
      });
    }

    await consumeToken(doc);

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

    res.status(201).json({ message: 'Registro completado', user: usuario, token: jwtToken, refreshToken, pvez: false });
  } catch (error) {
    console.error('Error al completar registro:', error);
    res.status(500).json({ message: 'Error al completar el registro' });
  }
});

module.exports = router;
