const jwt = require('jsonwebtoken');
const ADMIN_EMAIL = 'proyectoresunach@gmail.com'; // Mismo email que en tus constantes

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.email !== ADMIN_EMAIL) {
    return res.status(403).json({ message: 'Acceso no autorizado' });
  }
  next();
};

module.exports = { verifyToken, isAdmin }; 