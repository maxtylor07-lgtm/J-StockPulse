/**
 * authMiddleware.js
 * ──────────────────────────────────────────────────────────
 * Validates the Authorization: Bearer <token> header against
 * our own JWT secret. Attaches the decoded payload to req.user
 * so downstream routes can scope queries by uid.
 * ──────────────────────────────────────────────────────────
 */
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  // Fail fast — missing config should never silently succeed
  throw new Error('JWT_SECRET is missing from .env');
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ error: 'Missing authorization token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // decoded = { uid, email, name, iat, exp }
    req.user = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
