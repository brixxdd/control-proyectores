const mongoose = require('mongoose');

const proyectorSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  codigo: {
    type: String,
    required: true,
    unique: true
  },
  estado: {
    type: String,
    enum: ['en uso', 'en espera de recolección', 'devuelto', 'reservado'],
    default: 'devuelto'
  },
  ubicacion: {
    type: String,
    required: true
  },
  observaciones: {
    type: String
  }
}, {
  timestamps: true
});

const Proyector = mongoose.model('Proyector', proyectorSchema);

module.exports = Proyector; 