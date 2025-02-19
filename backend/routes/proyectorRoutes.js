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
    console.log('Datos recibidos:', req.body); // Debug

    const { codigo, grado, grupo, estado, turno } = req.body;

    // Validar que todos los campos requeridos existan
    if (!codigo || !grado || !grupo || !turno) {
      console.log('Campos faltantes:', { codigo, grado, grupo, turno }); // Debug
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos',
        received: { codigo, grado, grupo, turno }
      });
    }

    // Convertir grupo a mayúsculas
    const grupoUpper = grupo.toUpperCase();
    
    // Convertir grado a número
    const gradoNum = parseInt(grado);

    // Validaciones
    if (isNaN(gradoNum) || gradoNum < 1 || gradoNum > 7) {
      return res.status(400).json({ 
        message: 'El grado debe ser un número entre 1 y 7'
      });
    }

    if (!/^[A-F]$/.test(grupoUpper)) {
      return res.status(400).json({ 
        message: 'El grupo debe ser una letra entre A y F'
      });
    }

    if (!['Matutino', 'Vespertino'].includes(turno)) {
      return res.status(400).json({ 
        message: 'El turno debe ser Matutino o Vespertino'
      });
    }

    // Verificar si ya existe un proyector con el mismo grado, grupo y turno
    const proyectorExistente = await Proyector.findOne({ 
      grado: gradoNum, 
      grupo: grupoUpper,
      turno
    });

    if (proyectorExistente) {
      return res.status(400).json({ 
        message: `Ya existe un proyector asignado al grado ${gradoNum} grupo ${grupoUpper} turno ${turno}`
      });
    }

    // Crear el objeto proyector explícitamente
    const proyectorData = {
      codigo: codigo,
      grado: gradoNum,
      grupo: grupoUpper,
      estado: estado || 'disponible',
      turno: turno // Asegurarnos que el turno se asigna explícitamente
    };

    console.log('Datos del proyector a crear:', proyectorData); // Debug

    const proyector = new Proyector(proyectorData);
    
    console.log('Proyector antes de guardar:', proyector); // Debug

    const proyectorGuardado = await proyector.save();
    
    console.log('Proyector guardado:', proyectorGuardado); // Debug

    res.status(201).json(proyectorGuardado);

  } catch (error) {
    console.error('Error completo:', error); // Debug completo del error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: `Ya existe un proyector asignado a este grado, grupo y turno`
      });
    }

    res.status(500).json({ 
      message: 'Error al crear proyector', 
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router; 