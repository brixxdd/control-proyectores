const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Demasiados intentos, intenta de nuevo más tarde' },
  standardHeaders: true,
  legacyHeaders: false
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { message: 'Demasiadas solicitudes, intenta de nuevo más tarde' },
  standardHeaders: true,
  legacyHeaders: false
});

const tokenConsumeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Demasiados intentos, intenta de nuevo más tarde' },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = { authLimiter, forgotPasswordLimiter, tokenConsumeLimiter };
