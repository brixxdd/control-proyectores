const express = require('express');
const router = express.Router();
const Proyector = require('../models/Proyector');
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET /api/proyectores
router.get('/', verifyToken, async (req, res) => {
  try {
    const proyectores = await Proyector.find();
    res.json(proyectores);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proyectores', error });
  }
});

// POST /api/proyectores
router.post('/', verifyToken, async (req, res) => {
  try {
    console.log('Creando nuevo proyector:', req.body);
    const { grado, grupo } = req.body;

    if (!grado || !grupo) {
      return res.status(400).json({ 
        message: 'Grado y grupo son requeridos',
        received: { grado, grupo }
      });
    }

    // Generar código único
    const codigo = `PRY-${grado}${grupo}-${Date.now().toString().slice(-4)}`;

    const proyector = new Proyector({
      codigo,
      grado,
      grupo,
      estado: 'disponible'
    });

    console.log('Proyector a guardar:', proyector);
    const proyectorGuardado = await proyector.save();
    console.log('Proyector guardado:', proyectorGuardado);

    res.status(201).json(proyectorGuardado);
  } catch (error) {
    console.error('Error al crear proyector:', error);
    res.status(500).json({ 
      message: 'Error al crear proyector', 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router; 