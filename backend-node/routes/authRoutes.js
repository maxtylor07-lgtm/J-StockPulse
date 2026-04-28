/**
 * routes/authRoutes.js
 * ──────────────────────────────────────────────────────────
 * Email/password auth using Firebase Authentication.
 *
 *   POST /api/auth/signup  →  create user in Firebase Auth
 *                             + store profile in Firestore `users`
 *                             + return our own JWT
 *   POST /api/auth/login   →  verify email/password via the
 *                             Firebase REST endpoint
 *                             (identitytoolkit signInWithPassword)
 *                             then issue our own JWT
 *   GET  /api/auth/me      →  protected: fetch the logged-in profile
 * ──────────────────────────────────────────────────────────
 */
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const { admin, db, auth } = require('../firebase');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

const FIREBASE_API_KEY = process.env.FIREBASE_WEB_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/** Sign a short JWT with just the fields we need on every request. */
function signJwt(user) {
  return jwt.sign(
    { uid: user.uid, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// ─── SIGNUP ─────────────────────────────────────────────────
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // 1) Create the user in Firebase Authentication
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: name,
    });

    // 2) Save profile in Firestore collection `users` (keyed by uid)
    const profile = {
      uid: userRecord.uid,
      name,
      email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('users').doc(userRecord.uid).set(profile, { merge: true });

    // 3) Issue our own JWT
    const token = signJwt({ uid: userRecord.uid, email, name });
    return res.status(201).json({
      token,
      user: { uid: userRecord.uid, name, email },
    });
  } catch (err) {
    console.error('[signup]', err.code || err.message);
    if (err.code === 'auth/email-already-exists') {
      return res.status(409).json({ error: 'Email already registered. Try signing in.' });
    }
    if (err.code === 'auth/invalid-email') {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    if (err.code === 'auth/weak-password') {
      return res.status(400).json({ error: 'Password is too weak' });
    }
    return res.status(500).json({ error: err.message });
  }
});

// ─── LOGIN ──────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }
    if (!FIREBASE_API_KEY) {
      return res.status(500).json({ error: 'FIREBASE_WEB_API_KEY not configured on server' });
    }

    // Verify credentials against Firebase's REST endpoint.
    // Admin SDK can CREATE users but cannot verify passwords,
    // so we call the public identitytoolkit endpoint instead.
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;
    const { data } = await axios.post(url, { email, password, returnSecureToken: true });
    const uid = data.localId;

    // Pull profile (created at signup) from Firestore
    const snap = await db.collection('users').doc(uid).get();
    const profile = snap.exists ? snap.data() : { uid, email, name: email.split('@')[0] };
    const name = profile.name || email.split('@')[0];

    const token = signJwt({ uid, email, name });
    return res.json({ token, user: { uid, name, email } });
  } catch (err) {
    const fbErr = err.response && err.response.data && err.response.data.error && err.response.data.error.message;
    if (
      fbErr === 'EMAIL_NOT_FOUND' ||
      fbErr === 'INVALID_PASSWORD' ||
      fbErr === 'INVALID_LOGIN_CREDENTIALS'
    ) {
      return res.status(401).json({ error: 'Invalid email or password. Try again.' });
    }
    if (fbErr === 'USER_DISABLED') {
      return res.status(403).json({ error: 'This account has been disabled.' });
    }
    console.error('[login]', fbErr || err.message);
    return res.status(500).json({ error: fbErr || err.message });
  }
});

// ─── ME (protected) ─────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const snap = await db.collection('users').doc(req.user.uid).get();
    if (!snap.exists) return res.status(404).json({ error: 'Profile not found' });
    const data = snap.data();
    if (data.createdAt && data.createdAt.toDate) {
      data.createdAt = data.createdAt.toDate().toISOString();
    }
    return res.json({ user: data });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
