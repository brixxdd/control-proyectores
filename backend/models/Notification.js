const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  tipo: {
    type: String,
    required: true,
    enum: ['solicitud', 'documento', 'sistema', 'asignacion']
  },
  mensaje: {
    type: String,
    required: true
  },
  destinatario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  remitente: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  leida: {
    type: Boolean,
    default: false
  },
  enlace: String,
  entidadId: mongoose.Schema.Types.ObjectId,
  entidadTipo: String
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;