const crypto = require('crypto');
const AuthToken = require('../models/AuthToken');

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

async function generateToken({ email, type, invitedBy = null }) {
  const normalizedEmail = email.toLowerCase().trim();

  await AuthToken.updateMany(
    { email: normalizedEmail, type, used: false },
    { used: true, usedAt: new Date() }
  );

  const rawToken = crypto.randomBytes(32).toString('hex');
  const doc = await AuthToken.create({
    email: normalizedEmail,
    tokenHash: hashToken(rawToken),
    type,
    expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    invitedBy
  });

  return { rawToken, doc };
}

async function verifyToken({ rawToken, type }) {
  if (!rawToken) return null;

  const doc = await AuthToken.findOne({
    tokenHash: hashToken(rawToken),
    type,
    used: false,
    expiresAt: { $gt: new Date() }
  });

  return doc;
}

async function consumeToken(doc) {
  doc.used = true;
  doc.usedAt = new Date();
  await doc.save();
}

module.exports = { generateToken, verifyToken, consumeToken, hashToken };
