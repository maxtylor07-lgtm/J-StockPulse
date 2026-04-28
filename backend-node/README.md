# StockPulse Backend

Node.js + Express + Firebase Firestore backend for the **J-StockPulse** Smart Inventory Dashboard.

## Folder layout

```
backend-node/
├── server.js              # Express entry point
├── firebase.js            # Firebase Admin SDK singleton
├── firebase-admin.json    # Service-account JSON (NEVER commit)
├── .env                   # local config (NEVER commit)
├── .env.example           # template
├── middleware/
│   └── authMiddleware.js  # JWT verification
├── routes/
│   ├── authRoutes.js      # /api/auth/signup | /login | /me
│   ├── productRoutes.js   # /api/products/add | /all | /search | /update/:id | /delete/:id
│   ├── salesRoutes.js     # /api/sales/add | /all
│   └── analyticsRoutes.js # /api/analytics/* (dashboard, charts, forecasts)
└── utils/
    └── prediction.js      # pure-JS demand prediction math
```

## Setup (local)

1. Install dependencies (requires Node 18+):
   ```bash
   cd backend-node
   npm install
   ```

2. Confirm `.env` contains:
   - `PORT` (default `5000`)
   - `JWT_SECRET` (long random hex)
   - `FIREBASE_WEB_API_KEY`
   - `FIREBASE_ADMIN_CREDENTIALS_PATH` (path to service-account JSON)

3. Make sure `firebase-admin.json` sits in this folder (already included).

4. In your **Firebase Console**:
   - **Authentication → Sign-in method → Email/Password** = *Enabled*
   - **Firestore Database** = created (test mode is fine for development)

5. Run the server:
   ```bash
   npm start          # production
   # or
   npm run dev        # with nodemon auto-reload
   ```

   You should see:
   ```
   [firebase] Initialized for project: stockpulse-e447d
   [static] Serving frontend from .../frontend-static
   🚀 StockPulse backend running on http://localhost:5000
   ```

6. Open **http://localhost:5000** — the frontend is served from the same origin, so no CORS to worry about.

## API reference

### Auth
| Method | Path                | Body / Notes |
|--------|---------------------|--------------|
| POST   | `/api/auth/signup`  | `{ name, email, password }` → `{ token, user }` |
| POST   | `/api/auth/login`   | `{ email, password }` → `{ token, user }` |
| GET    | `/api/auth/me`      | **Auth required** → `{ user }` |

### Products (all require `Authorization: Bearer <token>`)
| Method | Path                         | Body |
|--------|------------------------------|------|
| POST   | `/api/products/add`          | `{ name, category, quantity, price, supplier, dailySales, image }` |
| GET    | `/api/products/all`          | — |
| GET    | `/api/products/search?q=...` | — |
| PUT    | `/api/products/update/:id`   | any of the fields above |
| DELETE | `/api/products/delete/:id`   | — |

### Sales
| Method | Path                 | Body |
|--------|----------------------|------|
| POST   | `/api/sales/add`     | `{ productId, quantitySold, saleDate? }` |
| GET    | `/api/sales/all`     | — |

### Analytics
- `GET /api/analytics/dashboard` — live metric cards
- `GET /api/analytics/stock-summary` — Chart.js labels/data (stock per category)
- `GET /api/analytics/monthly-sales` — monthly sales trend
- `GET /api/analytics/top-products` — top-5 sellers
- `GET /api/analytics/product/:id` — per-product metrics (stock, rate, days, trend)
- `GET /api/analytics/forecast/:id` — 30-day demand forecast
- `GET /api/analytics/demand-forecast/:productId` — alias of `/forecast/:id`

## Demand prediction (pure JS, no ML libs)

```
averageDailySales = Σ(salesHistory) / historyLength
predictedDemand   = averageDailySales × 30
daysUntilOut      = currentStock / averageDailySales
restockNeeded     = max(0, predictedDemand − currentStock)
```

Trend direction comes from comparing the first vs second half of the last 14 recorded days.

## Firestore schema

```
users/{uid}          → { uid, name, email, createdAt }
products/{autoId}    → { userId, name, category, quantity, price,
                          supplier, dailySales, image, salesHistory[],
                          createdAt, updatedAt }
sales/{autoId}       → { userId, productId, quantitySold, saleDate, createdAt }
```

## Security

- Admin SDK credentials stay on the server only.
- All `/api/*` routes (except `/auth/signup`, `/auth/login`, `/health`) require a valid JWT.
- Each query is scoped by `userId`, so users can only see their own documents.
- In production, replace the Firestore test-mode rules with per-user rules, for example:
  ```
  match /products/{id} {
    allow read, write: if request.auth != null &&
                       request.auth.uid == resource.data.userId;
  }
  ```
