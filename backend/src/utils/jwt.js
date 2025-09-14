const jwt = require('jsonwebtoken');

const signToken = (user) => {
  const payload = { sub: user.id, email: user.email };
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set');
  return jwt.verify(token, secret);
};

module.exports = { signToken, verifyToken };
