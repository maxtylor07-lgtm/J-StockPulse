/**
 * routes/productRoutes.js
 * ──────────────────────────────────────────────────────────
 *   POST   /api/products/add        → add a product
 *   GET    /api/products/all        → list current user's products
 *   GET    /api/products/search?q=  → filter by name / category
 *   PUT    /api/products/update/:id → update fields
 *   DELETE /api/products/delete/:id → delete product
 *
 * Every document is scoped by `userId` so users only see their own.
 * `createdAt` and `updatedAt` are server timestamps (Firestore).
 * ──────────────────────────────────────────────────────────
 */
const express = require('express');
const { admin, db } = require('../firebase');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();
const col = () => db.collection('products');

/** Convert Firestore doc → plain JSON with ISO date strings. */
function serialize(doc) {
  const data = doc.data() || {};
  if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate().toISOString();
  if (data.updatedAt && data.updatedAt.toDate) data.updatedAt = data.updatedAt.toDate().toISOString();
  return { id: doc.id, ...data };
}

// ─── ADD ────────────────────────────────────────────────────
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { name, category, quantity, price, supplier, dailySales, image } = req.body || {};
    if (!name) return res.status(400).json({ error: 'name is required' });

    const product = {
      userId: req.user.uid,
      name: String(name),
      category: category || 'Uncategorized',
      quantity: Number(quantity) || 0,
      price: Number(price) || 0,
      supplier: supplier || '',
      dailySales: Number(dailySales) || 0,
      image: image || '',
      salesHistory: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const ref = await col().add(product);
    const snap = await ref.get();
    return res.status(201).json(serialize(snap));
  } catch (err) {
    console.error('[products/add]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── LIST ───────────────────────────────────────────────────
router.get('/all', authMiddleware, async (req, res) => {
  try {
    const snap = await col().where('userId', '==', req.user.uid).get();
    const products = snap.docs
      .map(serialize)
      .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
    return res.json({ products });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── SEARCH ─────────────────────────────────────────────────
router.get('/search', authMiddleware, async (req, res) => {
  try {
    const q = (req.query.q || '').toString().toLowerCase().trim();
    const snap = await col().where('userId', '==', req.user.uid).get();
    const results = snap.docs.map(serialize).filter((p) => {
      if (!q) return true;
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.supplier || '').toLowerCase().includes(q)
      );
    });
    return res.json({ products: results });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── UPDATE ─────────────────────────────────────────────────
router.put('/update/:id', authMiddleware, async (req, res) => {
  try {
    const ref = col().doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Product not found' });
    if (snap.data().userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    const allowed = ['name', 'category', 'quantity', 'price', 'supplier', 'dailySales', 'image', 'salesHistory'];
    const patch = {};
    for (const key of allowed) {
      if (key in (req.body || {})) patch[key] = req.body[key];
    }
    // Normalize numeric fields
    if ('quantity' in patch) patch.quantity = Number(patch.quantity) || 0;
    if ('price' in patch) patch.price = Number(patch.price) || 0;
    if ('dailySales' in patch) patch.dailySales = Number(patch.dailySales) || 0;

    patch.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    await ref.update(patch);

    const updated = await ref.get();
    return res.json(serialize(updated));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── DELETE ─────────────────────────────────────────────────
router.delete('/delete/:id', authMiddleware, async (req, res) => {
  try {
    const ref = col().doc(req.params.id);
    const snap = await ref.get();
    if (!snap.exists) return res.status(404).json({ error: 'Product not found' });
    if (snap.data().userId !== req.user.uid) return res.status(403).json({ error: 'Forbidden' });

    await ref.delete();
    return res.json({ success: true, id: req.params.id });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
