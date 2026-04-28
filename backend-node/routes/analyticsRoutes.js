/**
 * routes/analyticsRoutes.js
 * ──────────────────────────────────────────────────────────
 * JSON endpoints that feed Chart.js on the frontend.
 *
 *   GET /api/analytics/dashboard                → top metric cards
 *   GET /api/analytics/stock-summary            → stock per category
 *   GET /api/analytics/monthly-sales            → sales per month
 *   GET /api/analytics/top-products             → top-5 sellers
 *   GET /api/analytics/product/:id              → per-product metrics
 *   GET /api/analytics/forecast/:id             → 30-day forecast
 *   GET /api/analytics/demand-forecast/:productId (alias)
 * ──────────────────────────────────────────────────────────
 */
const express = require('express');
const { db } = require('../firebase');
const authMiddleware = require('../middleware/authMiddleware');
const {
  averageDailySales,
  predictFutureDemand,
  daysUntilOutOfStock,
  stockStatus,
  demandTrend,
  restockSuggestion,
} = require('../utils/prediction');

const router = express.Router();

async function userProducts(uid) {
  const snap = await db.collection('products').where('userId', '==', uid).get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function userSales(uid) {
  const snap = await db.collection('sales').where('userId', '==', uid).get();
  return snap.docs.map((d) => {
    const data = d.data();
    if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate().toISOString();
    return { id: d.id, ...data };
  });
}

// ─── Dashboard metric cards ─────────────────────────────────
router.get('/dashboard', authMiddleware, async (req, res) => {
  try {
    const products = await userProducts(req.user.uid);
    let totalValue = 0;
    let lowStock = 0;
    let fastMoving = 0;

    products.forEach((p) => {
      totalValue += (Number(p.price) || 0) * (Number(p.quantity) || 0);
      const rate = Number(p.dailySales) || averageDailySales(p.salesHistory);
      const days = daysUntilOutOfStock(p.quantity, rate);
      if (stockStatus(days) !== 'safe') lowStock += 1;
      if (rate >= 10) fastMoving += 1; // arbitrary threshold for "fast"
    });

    return res.json({
      totalProducts: products.length,
      totalInventoryValue: Number(totalValue.toFixed(2)),
      lowStockProducts: lowStock,
      fastMovingProducts: fastMoving,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Stock-per-category (for a doughnut/bar chart) ──────────
router.get('/stock-summary', authMiddleware, async (req, res) => {
  try {
    const products = await userProducts(req.user.uid);
    const byCategory = {};
    products.forEach((p) => {
      const c = p.category || 'Uncategorized';
      byCategory[c] = (byCategory[c] || 0) + (Number(p.quantity) || 0);
    });
    return res.json({
      labels: Object.keys(byCategory),
      data: Object.values(byCategory),
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Monthly sales trend ────────────────────────────────────
router.get('/monthly-sales', authMiddleware, async (req, res) => {
  try {
    const sales = await userSales(req.user.uid);
    const buckets = {};
    sales.forEach((s) => {
      const d = new Date(s.saleDate || s.createdAt);
      if (isNaN(d.getTime())) return;
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      buckets[key] = (buckets[key] || 0) + (Number(s.quantitySold) || 0);
    });
    return res.json({ labels: Object.keys(buckets), data: Object.values(buckets) });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── Top 5 sellers ──────────────────────────────────────────
router.get('/top-products', authMiddleware, async (req, res) => {
  try {
    const [sales, products] = await Promise.all([
      userSales(req.user.uid),
      userProducts(req.user.uid),
    ]);
    const byProduct = {};
    sales.forEach((s) => {
      byProduct[s.productId] = (byProduct[s.productId] || 0) + (Number(s.quantitySold) || 0);
    });
    const ranked = Object.entries(byProduct)
      .map(([id, qty]) => {
        const p = products.find((x) => x.id === id);
        return { id, name: p ? p.name : 'Unknown', totalSold: qty };
      })
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5);
    return res.json({
      labels: ranked.map((r) => r.name),
      data: ranked.map((r) => r.totalSold),
      products: ranked,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/** Shared helper for /product/:id, /forecast/:id, /demand-forecast/:productId */
async function buildForecast(uid, id) {
  const ref = db.collection('products').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return { status: 404, body: { error: 'Product not found' } };
  const p = { id: snap.id, ...snap.data() };
  if (p.userId !== uid) return { status: 403, body: { error: 'Forbidden' } };

  const history = Array.isArray(p.salesHistory) ? p.salesHistory : [];
  const rate = history.length ? averageDailySales(history) : Number(p.dailySales) || 0;
  const days = daysUntilOutOfStock(p.quantity, rate);
  const predicted = predictFutureDemand(history, 30) || Math.round(rate * 30);

  return {
    status: 200,
    body: {
      productName: p.name,
      currentStock: Number(p.quantity) || 0,
      dailyRate: Number(rate.toFixed(2)),
      daysUntilOutOfStock: isFinite(days) ? days : null,
      status: stockStatus(days),
      trend: demandTrend(history),
      predictedDemand: predicted,
      restockSuggestion: restockSuggestion(p.quantity, predicted),
    },
  };
}

// ─── Per-product analytics ──────────────────────────────────
router.get('/product/:id', authMiddleware, async (req, res) => {
  const { status, body } = await buildForecast(req.user.uid, req.params.id);
  return res.status(status).json(body);
});

router.get('/forecast/:id', authMiddleware, async (req, res) => {
  const { status, body } = await buildForecast(req.user.uid, req.params.id);
  return res.status(status).json(body);
});

router.get('/demand-forecast/:productId', authMiddleware, async (req, res) => {
  const { status, body } = await buildForecast(req.user.uid, req.params.productId);
  return res.status(status).json(body);
});

module.exports = router;
