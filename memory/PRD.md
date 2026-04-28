# J-StockPulse — Smart Inventory Dashboard

## Original Problem Statement
Existing frontend (HTML/CSS/Vanilla JS) from github.com/maxtylor07-lgtm/J-StockPulse.
Generate a full production-style backend: Node.js + Express + Firebase Firestore,
with Firebase Auth (email/password), JWT-protected routes, product/sales CRUD,
analytics endpoints for Chart.js, and pure-JS demand prediction.
Then wire up the existing frontend JS to call these new APIs.

## Tech Stack
- Frontend: HTML / CSS / Vanilla JS (Chart.js on pages that need charts)
- Backend : Node.js + Express
- Auth    : Firebase Authentication (email/password) + our own JWT
- DB      : Firebase Firestore (via firebase-admin)
- Forecast: pure JavaScript math (moving average + linear trend)

## Folder layout
```
/app
├── backend-node/                  # new backend
│   ├── server.js
│   ├── firebase.js
│   ├── firebase-admin.json        # service-account (gitignored)
│   ├── .env / .env.example
│   ├── middleware/authMiddleware.js
│   ├── routes/{auth,product,sales,analytics}Routes.js
│   └── utils/prediction.js
└── frontend-static/               # user's existing frontend (wired to new APIs)
    ├── api.js                     # new fetch helper (token + API base)
    ├── index.html (login/signup wired)
    ├── dashboard.html (auth guard + api.js)
    ├── add-product.js (POSTs new products)
    ├── inventory.js (loads /api/products/all on init)
    └── …
```

## Implemented (2026-04-28)
- POST /api/auth/signup → Firebase Auth createUser + Firestore users/{uid} + JWT
- POST /api/auth/login  → Firebase REST signInWithPassword + JWT
- GET  /api/auth/me     → protected profile fetch
- POST /api/products/add, GET /all, GET /search?q=, PUT /update/:id, DELETE /delete/:id
- POST /api/sales/add (decrements stock + appends salesHistory), GET /all
- GET /api/analytics/dashboard, /stock-summary, /monthly-sales, /top-products
- GET /api/analytics/product/:id, /forecast/:id, /demand-forecast/:productId
- JWT middleware, CORS, error handler, health check
- Frontend wired: login/signup call real APIs, dashboard has auth guard,
  add-product saves to Firestore, inventory loads products on mount.

## Verified
- `require('./firebase')` initialises cleanly against project `stockpulse-e447d`.
- Server boots on port 5000 and serves /api/health.
- API surface reachable. Firebase services (Firestore, Auth) must be enabled
  in the console before the flows return data — currently blocked on console setup.

## Action required from user (before first successful signup/login)
1. Firebase Console → Build → **Firestore Database** → *Create database* (test mode is fine for dev).
2. Firebase Console → Build → **Authentication** → *Get started* → Sign-in method → **Email/Password** → Enable.
3. Re-run `cd /app/backend-node && npm start`, then open http://localhost:5000.

## Backlog / Next actions
- P1: Add Edit/Delete buttons to inventory cards (backend already supports them)
- P1: Add live Chart.js wiring on dashboard using /analytics/stock-summary & /monthly-sales
- P2: PDF export of inventory (jsPDF)
- P2: Firestore security rules scoped by request.auth.uid
- P2: Fast-moving (🔥) and dead-stock (💤) badges on cards
