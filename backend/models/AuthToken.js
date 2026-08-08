const mongoose = require('mongoose');

const authTokenSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  tokenHash: { type: String, required: true, unique: true },
  type: { type: String, enum: ['invite', 'reset'], required: true },
  expiresAt: { type: Date, required: true },
  used: { type: Boolean, default: false },
  usedAt: { type: Date, default: null },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }
}, {
  timestamps: true
});

authTokenSchema.index({ email: 1, type: 1, used: 1 });

module.exports = mongoose.model('AuthToken', authTokenSchema);
