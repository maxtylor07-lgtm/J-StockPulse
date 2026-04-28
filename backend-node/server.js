/**
 * server.js
 * ──────────────────────────────────────────────────────────
 * StockPulse backend entry point.
 *
 *   • Express + CORS + JSON body parsing
 *   • Firebase Admin init (side-effect import)
 *   • Mounts /api/auth, /api/products, /api/sales, /api/analytics
 *   • Serves the static frontend (../frontend-static) if present
 *     so you can run everything from a single process.
 * ──────────────────────────────────────────────────────────
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Initialize Firebase (throws early if credentials are bad)
require('./firebase');

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const salesRoutes = require('./routes/salesRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ─────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ─── Health check ───────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// ─── API Routes ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/analytics', analyticsRoutes);

// ─── Static frontend (optional single-origin deployment) ────
const STATIC_DIR = path.resolve(__dirname, '../frontend-static');
if (fs.existsSync(STATIC_DIR)) {
  app.use(express.static(STATIC_DIR));
  app.get('/', (_req, res) => res.sendFile(path.join(STATIC_DIR, 'index.html')));
  console.log(`[static] Serving frontend from ${STATIC_DIR}`);
}

// ─── Global error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`🚀 StockPulse backend running on http://localhost:${PORT}`);
});
