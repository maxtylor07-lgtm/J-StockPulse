/**
 * routes/salesRoutes.js
 * ──────────────────────────────────────────────────────────
 *   POST /api/sales/add → record a sale (also decrements the
 *                         product stock and appends to
 *                         salesHistory array used by analytics)
 *   GET  /api/sales/all → list current user's sales
 * ──────────────────────────────────────────────────────────
 */
const express = require('express');
const { admin, db } = require('../firebase');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { productId, quantitySold, saleDate } = req.body || {};
    if (!productId || !quantitySold) {
      return res.status(400).json({ error: 'productId and quantitySold are required' });
    }

    // Validate that the product belongs to this user
    const prodRef = db.collection('products').doc(productId);
    const prodSnap = await prodRef.get();
    if (!prodSnap.exists) return res.status(404).json({ error: 'Product not found' });
    if (prodSnap.data().userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    const qty = Number(quantitySold) || 0;

    // Record the sale
    const sale = {
      userId: req.user.uid,
      productId,
      quantitySold: qty,
      saleDate: saleDate ? new Date(saleDate).toISOString() : new Date().toISOString(),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const ref = await db.collection('sales').add(sale);

    // Update product: decrement stock, append to history (keep last 90)
    const currentQty = Number(prodSnap.data().quantity) || 0;
    const history = Array.isArray(prodSnap.data().salesHistory) ? prodSnap.data().salesHistory : [];
    await prodRef.update({
      quantity: Math.max(0, currentQty - qty),
      salesHistory: [...history, qty].slice(-90),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    const snap = await ref.get();
    const data = snap.data();
    if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate().toISOString();
    return res.status(201).json({ id: snap.id, ...data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

router.get('/all', authMiddleware, async (req, res) => {
  try {
    const snap = await db.collection('sales').where('userId', '==', req.user.uid).get();
    const sales = snap.docs.map((d) => {
      const data = d.data();
      if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate().toISOString();
      return { id: d.id, ...data };
    });
    sales.sort((a, b) => String(b.saleDate || '').localeCompare(String(a.saleDate || '')));
    return res.json({ sales });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
