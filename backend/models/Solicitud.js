const mongoose = require('mongoose');

const solicitudSchema = new mongoose.Schema({
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  proyectorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Proyector', // Asumiendo que tienes un modelo de Proyector
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  motivo: {
    type: String,
    required: true
  },
  eventId: {
    type: String,
    required: true
  },
  estado: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
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
  }
}, {
  timestamps: true
});

// Agregar un middleware pre-save para logging
solicitudSchema.pre('save', function(next) {
  console.log('Pre-save solicitud:', this);
  next();
});

solicitudSchema.index({ usuarioId: 1, fechaInicio: 1 });
solicitudSchema.index({ estado: 1 });

const Solicitud = mongoose.model('Solicitud', solicitudSchema);
module.exports = Solicitud;