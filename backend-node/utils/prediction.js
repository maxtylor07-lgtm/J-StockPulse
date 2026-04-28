/**
 * utils/prediction.js
 * ──────────────────────────────────────────────────────────
 * Simple demand-prediction utilities using PURE JavaScript
 * math — no ML libraries.
 *
 * Core ideas:
 *   • average daily sales = Σ(salesHistory) / history length
 *   • predicted 30-day demand = avg daily × 30 (moving avg)
 *   • days-until-out-of-stock = currentStock / dailyRate
 *   • trend direction uses slope of the last N days
 * ──────────────────────────────────────────────────────────
 */

/** Average daily sales over recorded history (0 if no data). */
function averageDailySales(salesHistory = []) {
  if (!Array.isArray(salesHistory) || salesHistory.length === 0) return 0;
  const sum = salesHistory.reduce((a, b) => a + Number(b || 0), 0);
  return sum / salesHistory.length;
}

/** Predict demand for the next N days (default 30) using a moving average. */
function predictFutureDemand(salesHistory = [], days = 30) {
  return Math.round(averageDailySales(salesHistory) * days);
}

/** How many days until stock runs out at the current daily rate. */
function daysUntilOutOfStock(currentStock, dailyRate) {
  const rate = Number(dailyRate);
  if (!rate || rate <= 0) return Infinity;
  return Math.floor(Number(currentStock) / rate);
}

/** Human-readable label for remaining runway. */
function stockStatus(days) {
  if (!isFinite(days)) return 'safe';
  if (days < 7) return 'critical';   // 🔴
  if (days < 30) return 'low';       // 🟠
  return 'safe';                     // 🟢
}

/**
 * Trend direction based on the first half vs second half of the
 * last `window` data points. Simple, readable, no ML.
 */
function demandTrend(salesHistory = [], window = 14) {
  if (!Array.isArray(salesHistory) || salesHistory.length < 2) return 'stable';
  const slice = salesHistory.slice(-window);
  if (slice.length < 2) return 'stable';

  const half = Math.floor(slice.length / 2);
  const firstAvg = slice.slice(0, half).reduce((a, b) => a + b, 0) / (half || 1);
  const secondAvg = slice.slice(half).reduce((a, b) => a + b, 0) / (slice.length - half || 1);
  const diff = secondAvg - firstAvg;

  if (diff > 0.5) return 'increasing';
  if (diff < -0.5) return 'decreasing';
  return 'stable';
}

/** Units to reorder if predicted demand exceeds current stock. */
function restockSuggestion(currentStock, predictedDemand) {
  const diff = Number(predictedDemand) - Number(currentStock);
  return diff > 0 ? diff : 0;
}

module.exports = {
  averageDailySales,
  predictFutureDemand,
  daysUntilOutOfStock,
  stockStatus,
  demandTrend,
  restockSuggestion,
};
