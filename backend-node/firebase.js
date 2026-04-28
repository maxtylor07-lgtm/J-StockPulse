/**
 * firebase.js
 * ──────────────────────────────────────────────────────────
 * Initializes the Firebase Admin SDK with the service-account
 * JSON and exposes singleton Firestore + Auth clients.
 *
 * The admin SDK runs on the server with elevated privileges —
 * NEVER ship this credentials file to the client.
 * ──────────────────────────────────────────────────────────
 */
const admin = require('firebase-admin');
const path = require('path');

// Resolve credentials file path from .env (relative to this file)
const credPath = path.resolve(
  __dirname,
  process.env.FIREBASE_ADMIN_CREDENTIALS_PATH || './firebase-admin.json'
);

// Singleton pattern — prevents "app already exists" in dev hot-reload
if (!admin.apps.length) {
  // eslint-disable-next-line import/no-dynamic-require, global-require
  const serviceAccount = require(credPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log(`[firebase] Initialized for project: ${serviceAccount.project_id}`);
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
