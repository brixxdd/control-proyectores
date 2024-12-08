const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  filePath: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'La ruta del archivo es requerida'
    }
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  grado: {
    type: String,
    required: true
  },
  grupo: {
    type: String,
    required: true
  },
  turno: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema); 