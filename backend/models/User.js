const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  grado: { type: String, default: null },
  grupo: { type: String, default: null },
  proyectores: { type: Array, default: [] },
  turno: { type: String, default: null },
  picture: { type: String, default: null },
  isAdmin: { type: Boolean, default: false },
  pdfPath: { type: String, default: null }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);