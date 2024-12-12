const mongoose = require('mongoose');

const proyectorSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true
  },
  grado: {
    type: String,
    required: true
  },
  grupo: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['disponible', 'ocupado', 'mantenimiento'],
    default: 'disponible'
  },
  asignadoA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Proyector', proyectorSchema); 