require('dotenv').config();
const mongoose = require('mongoose');
const Solicitud = require('../models/Solicitud');
const User = require('../models/User');

async function updateSolicitudes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const solicitudes = await Solicitud.find();
    
    for (const solicitud of solicitudes) {
      const usuario = await User.findById(solicitud.usuarioId);
      if (usuario) {
        await Solicitud.updateOne(
          { _id: solicitud._id },
          {
            $set: {
              grado: usuario.grado || 'N/A',
              grupo: usuario.grupo || 'N/A',
              turno: usuario.turno || 'N/A'
            }
          }
        );
        console.log(`Solicitud ${solicitud._id} actualizada`);
      }
    }

    console.log('Actualización completada');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateSolicitudes(); 