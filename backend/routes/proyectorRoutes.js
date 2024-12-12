const express = require('express');
const router = express.Router();
const Proyector = require('../models/Proyector');
const { verifyToken, isAdmin } = require('../middleware/auth');

// GET /api/proyectores
router.get('/', verifyToken, async (req, res) => {
  try {
    const proyectores = await Proyector.find()
      .sort({ grado: 1, grupo: 1 });
    res.json(proyectores);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener proyectores', error });
  }
});

// POST /api/proyectores
router.post('/', verifyToken, async (req, res) => {
  try {
    let { grado, grupo } = req.body;

    // Validar que grado y grupo existan
    if (!grado || !grupo) {
      return res.status(400).json({ 
        message: 'Grado y grupo son requeridos',
        received: { grado, grupo }
      });
    }

    // Convertir grupo a mayúsculas
    grupo = grupo.toUpperCase();
    
    // Convertir grado a número
    const gradoNum = parseInt(grado);

    // Validaciones
    if (isNaN(gradoNum) || gradoNum < 1 || gradoNum > 7) {
      return res.status(400).json({ 
        message: 'El grado debe ser un número entre 1 y 7'
      });
    }

    if (!/^[A-F]$/.test(grupo)) {
      return res.status(400).json({ 
        message: 'El grupo debe ser una letra entre A y F'
      });
    }

    // Verificar si ya existe un proyector con el mismo grado y grupo
    const proyectorExistente = await Proyector.findOne({ 
      grado: gradoNum, 
      grupo: grupo 
    });

    if (proyectorExistente) {
      return res.status(400).json({ 
        message: `Ya existe un proyector asignado al grado ${gradoNum} grupo ${grupo}`
      });
    }

    // Generar código único
    const codigo = `PRY-${gradoNum}${grupo}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

    const proyector = new Proyector({
      codigo,
      grado: gradoNum,
      grupo,
      estado: 'disponible'
    });

    const proyectorGuardado = await proyector.save();
    res.status(201).json(proyectorGuardado);

  } catch (error) {
    // Si es un error de duplicado de MongoDB
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: `Ya existe un proyector asignado a este grado y grupo`
      });
    }

    console.error('Error al crear proyector:', error);
    res.status(500).json({ 
      message: 'Error al crear proyector', 
      error: error.message
    });
  }
});

module.exports = router; 