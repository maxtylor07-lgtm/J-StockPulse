// ═══════════════════════════════════════
// INVENTORY MANAGEMENT — REDESIGNED JS
// ═══════════════════════════════════════

const inventoryProducts = [
  { id:1, name:'Smart Watch Pro', emoji:'⌚', image:'images/smart-watch-pro.png', category:'Electronics', stock:245, stockLevel:'healthy', demand:'high', demandWord:'High', trend:'rising', trendArrow:'↗', price:[89,149], insight:'Demand has increased 34% this month. Sales peak expected during the upcoming holiday season.', points:[20,25,30,28,35,42,50,55,60,58,65,72] },
  { id:2, name:'Running Shoes X1', emoji:'👟', image:'images/running-shoes-x1.png', category:'Footwear', stock:12, stockLevel:'critical', demand:'high', demandWord:'High', trend:'rising', trendArrow:'↗', price:[65,120], insight:'Stock critically low. Reorder immediately — demand is rising with fitness season approaching.', points:[30,28,32,35,40,45,50,55,62,68,72,78] },
  { id:3, name:'Wireless Earbuds', emoji:'🎧', image:'images/wireless-earbuds.png', category:'Electronics', stock:89, stockLevel:'healthy', demand:'medium', demandWord:'Medium', trend:'stable', trendArrow:'→', price:[29,79], insight:'Steady demand with seasonal fluctuations. Current stock is sufficient for the next 3 weeks.', points:[40,42,38,41,39,43,40,42,44,41,43,42] },
  { id:4, name:'Yoga Mat Premium', emoji:'🧘', image:'images/yoga-mat-premium.png', category:'Fitness', stock:34, stockLevel:'low', demand:'medium', demandWord:'Medium', trend:'rising', trendArrow:'↗', price:[25,55], insight:'Demand is picking up with New Year fitness resolutions. Consider restocking soon.', points:[25,28,30,32,35,34,38,40,42,45,48,52] },
  { id:5, name:'USB-C Hub Ultra', emoji:'🔌', image:'images/usbc-hub-ultra.png', category:'Accessories', stock:156, stockLevel:'healthy', demand:'medium', demandWord:'Medium', trend:'stable', trendArrow:'→', price:[35,65], insight:'Consistent demand across all channels. Well-stocked for current order velocity.', points:[45,43,44,46,45,47,44,46,45,43,44,46] },
  { id:6, name:'Backpack Voyager', emoji:'🎒', image:'images/backpack-voyager.png', category:'Bags', stock:67, stockLevel:'healthy', demand:'low', demandWord:'Low', trend:'falling', trendArrow:'↘', price:[45,89], insight:'Demand declining post-travel season. Consider promotional pricing to move inventory.', points:[60,55,52,48,45,42,40,38,35,33,30,28] },
  { id:7, name:'Resistance Bands', emoji:'💪', image:'images/resistance-bands.png', category:'Fitness', stock:28, stockLevel:'low', demand:'high', demandWord:'High', trend:'rising', trendArrow:'↗', price:[12,35], insight:'Extremely popular in home fitness category. Stock running low against rising demand curve.', points:[15,20,25,30,35,42,50,58,65,70,75,82] },
  { id:8, name:'Desk Lamp LED', emoji:'💡', image:'images/desk-lamp-led.png', category:'Home Office', stock:92, stockLevel:'healthy', demand:'low', demandWord:'Low', trend:'stable', trendArrow:'→', price:[22,48], insight:'Stable low demand. Current stock will last approximately 8 weeks at current sell rate.', points:[20,22,21,23,20,22,21,19,20,22,21,23] },
  { id:9, name:'Water Bottle Steel', emoji:'🍶', image:'images/water-bottle-steel.png', category:'Lifestyle', stock:8, stockLevel:'critical', demand:'medium', demandWord:'Medium', trend:'rising', trendArrow:'↗', price:[15,32], insight:'Nearly out of stock with growing interest. Urgent restock needed to avoid missed sales.', points:[30,32,35,38,40,42,45,48,50,52,55,58] },
  { id:10, name:'Bluetooth Speaker', emoji:'🔊', image:'images/bluetooth-speaker.png', category:'Electronics', stock:45, stockLevel:'low', demand:'high', demandWord:'High', trend:'rising', trendArrow:'↗', price:[39,99], insight:'Strong social media driven demand. Currently trending on review platforms.', points:[22,28,35,40,48,55,60,68,72,78,82,88] },
  { id:11, name:'Phone Case Armor', emoji:'📱', image:'images/phone-case-armor.png', category:'Accessories', stock:320, stockLevel:'healthy', demand:'medium', demandWord:'Medium', trend:'stable', trendArrow:'→', price:[12,25], insight:'Reliable seller with consistent margins. Demand follows new phone release cycles.', points:[50,48,52,50,54,52,56,54,52,50,48,50] },
  { id:12, name:'Trail Mix Organic', emoji:'🥜', image:'images/trail-mix-organic.png', category:'Food', stock:180, stockLevel:'healthy', demand:'low', demandWord:'Low', trend:'falling', trendArrow:'↘', price:[8,18], insight:'Post-hiking season decline. Consider bundling with other outdoor products to boost sales.', points:[50,48,45,42,40,38,35,32,30,28,26,24] },
];

let invFocusedMode = false;
let invSelectedId = null;
let invActiveFilter = 'all';

function initInventory() {
  renderInventoryGrid();
  setupInvSearch();
  setupInvFilters();
  setupKeyboardExit();
  loadProductsFromAPI();
}

// ═══════════ LOAD FROM BACKEND ═══════════
// Fetch user's real products from Firestore and merge them into
// the inventoryProducts array (replacing seed/mock data).
async function loadProductsFromAPI() {
  if (!window.api || !window.Auth || !window.Auth.isLoggedIn()) return;
  try {
    const data = await window.api('/api/products/all');
    if (!data || !Array.isArray(data.products)) return;
    const categoryEmojis = {
      Electronics:'📱', Footwear:'👟', Fitness:'💪', Accessories:'🔌',
      Bags:'🎒', 'Home Office':'💡', Lifestyle:'🍶', Food:'🍿',
      Clothing:'👕', Books:'📚', Beauty:'💄', Toys:'🧸',
    };
    const mapped = data.products.map(p => {
      const price = Number(p.price) || 0;
      const qty = Number(p.quantity) || 0;
      const threshold = 10;
      let stockLevel = 'healthy';
      if (qty <= threshold) stockLevel = 'critical';
      else if (qty <= threshold * 3) stockLevel = 'low';
      return {
        id: p.id,
        name: p.name,
        emoji: categoryEmojis[p.category] || '📦',
        image: p.image || '',
        category: p.category || 'Uncategorized',
        stock: qty,
        stockLevel,
        demand: 'medium',
        demandWord: 'Medium',
        trend: 'stable',
        trendArrow: '→',
        price: [Math.round(price * 0.7), price],
        insight: `Added on ${p.createdAt ? new Date(p.createdAt).toLocaleDateString() : 'recently'}. Live stock synced from Firebase.`,
        points: Array.isArray(p.salesHistory) && p.salesHistory.length
          ? p.salesHistory.slice(-12)
          : [30, 32, 35, 33, 36, 38, 35, 37, 40, 38, 41, 40],
      };
    });
    // Replace the seed array contents in place so existing references stay valid.
    inventoryProducts.splice(0, inventoryProducts.length, ...mapped);
    renderInventoryGrid();
    if (typeof updateDashboardCounts === 'function') updateDashboardCounts();
  } catch (err) {
    console.error('[inventory] load failed:', err.message);
    if (err.status === 401 && window.Auth) window.Auth.logout();
  }
}

// Delete product on the server (called from the confirmation popup).
async function apiDeleteProduct(id) {
  if (!window.api || !window.Auth || !window.Auth.isLoggedIn()) return true;
  try {
    await window.api(`/api/products/delete/${id}`, { method: 'DELETE' });
    return true;
  } catch (err) {
    console.error('[inventory] delete failed:', err.message);
    alert('Delete failed: ' + err.message);
    return false;
  }
}

// ═══════════ FILTER BAR ═══════════
function setupInvFilters() {
  const bar = document.getElementById('inv-filter-bar');
  if (!bar) return;

  const categories = ['All', ...new Set(inventoryProducts.map(p => p.category))];
  bar.innerHTML = categories.map(cat => {
    const val = cat === 'All' ? 'all' : cat.toLowerCase();
    return `<button class="inv-filter-chip${val === invActiveFilter ? ' active' : ''}" data-filter="${val}">${cat}</button>`;
  }).join('');

  bar.addEventListener('click', e => {
    const chip = e.target.closest('.inv-filter-chip');
    if (!chip) return;
    invActiveFilter = chip.dataset.filter;
    bar.querySelectorAll('.inv-filter-chip').forEach(c => c.classList.toggle('active', c === chip));
    if (invFocusedMode) exitFocusedMode();
    renderInventoryGrid();
  });
}

// ═══════════ KEYBOARD EXIT ═══════════
function setupKeyboardExit() {
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && invFocusedMode) {
      exitFocusedMode();
    }
  });
}

// ═══════════ RENDER GRID ═══════════
function renderInventoryGrid() {
  const grid = document.getElementById('inv-product-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const searchVal = document.getElementById('inv-search-input')?.value.toLowerCase() || '';

  let filtered = inventoryProducts.filter(p =>
    p.name.toLowerCase().includes(searchVal) || p.category.toLowerCase().includes(searchVal)
  );

  // Apply category filter
  if (invActiveFilter !== 'all') {
    filtered = filtered.filter(p => p.category.toLowerCase() === invActiveFilter);
  }

  filtered.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'inv-card' + (invSelectedId === p.id ? ' selected' : '');
    card.setAttribute('data-id', p.id);
    card.onclick = () => enterFocusedMode(p.id);
    card.style.animationDelay = `${i * 40 + 40}ms`;

    const stockLabel = p.stockLevel === 'healthy' ? 'In Stock' : p.stockLevel === 'low' ? 'Low Stock' : 'Critical';
    const trendSymbol = p.trend === 'rising' ? '↑' : p.trend === 'falling' ? '↓' : '—';

    card.innerHTML = `
      <div class="inv-card-img">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:48px\\'>${p.emoji}</span>'" />
        <div class="inv-card-status ${p.stockLevel}">
          <span class="inv-card-status-dot"></span>
          ${stockLabel}
        </div>
      </div>
      <div class="inv-card-body">
        <div class="inv-card-name">${p.name}</div>
        <div class="inv-card-category">${p.category}</div>
        <div class="inv-card-meta">
          <span class="inv-stock-badge ${p.stockLevel}">${p.stock} units</span>
          <span class="inv-demand-mini ${p.trend}">${trendSymbol} ${p.demandWord}</span>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ═══════════ SEARCH ═══════════
function setupInvSearch() {
  const input = document.getElementById('inv-search-input');
  if (!input) return;
  let timer;
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (invFocusedMode) exitFocusedMode();
      renderInventoryGrid();
    }, 200);
  });
}

// ═══════════ ENTER FOCUSED MODE ═══════════
function enterFocusedMode(productId) {
  invFocusedMode = true;
  invSelectedId = productId;

  const layout = document.getElementById('inv-layout');
  const backBtn = document.getElementById('inv-back-btn');
  const detailPanel = document.getElementById('inv-detail-panel');
  const overlay = document.getElementById('inv-overlay');

  // Switch layout
  layout.classList.add('focused-mode');

  // Show back button
  backBtn.classList.add('visible');

  // Show overlay for click-outside detection
  if (overlay) overlay.classList.add('active');

  // Re-render grid as list
  renderInventoryGrid();

  // Build detail panel
  const product = inventoryProducts.find(p => p.id === productId);
  if (!product) return;

  detailPanel.innerHTML = buildDetailPanel(product);
  detailPanel.classList.add('visible');

  // Re-trigger animation
  detailPanel.style.animation = 'none';
  detailPanel.offsetHeight;
  detailPanel.style.animation = '';

  // Scroll selected card into view
  requestAnimationFrame(() => {
    const selectedCard = document.querySelector('.inv-card.selected');
    if (selectedCard) selectedCard.scrollIntoView({ behavior:'smooth', block:'nearest' });
  });
}

// ═══════════ EXIT FOCUSED MODE ═══════════
function exitFocusedMode() {
  invFocusedMode = false;
  invSelectedId = null;

  const layout = document.getElementById('inv-layout');
  const backBtn = document.getElementById('inv-back-btn');
  const detailPanel = document.getElementById('inv-detail-panel');
  const overlay = document.getElementById('inv-overlay');

  layout.classList.remove('focused-mode');
  backBtn.classList.remove('visible');
  detailPanel.classList.remove('visible');
  if (overlay) overlay.classList.remove('active');

  // Smooth exit: add a brief fade before re-render
  setTimeout(() => {
    detailPanel.innerHTML = '';
    renderInventoryGrid();
  }, 100);
}

// ═══════════ BUILD DETAIL PANEL ═══════════
function buildDetailPanel(p) {
  const chartPath = buildInvChartPath(p.points, 500, 120);
  const fillPath = chartPath + ' L 500,120 L 0,120 Z';
  const lastPt = p.points[p.points.length - 1];
  const maxPt = Math.max(...p.points);
  const lastY = 120 - ((lastPt / (maxPt * 1.1)) * 100) - 5;
  const strokeColor = p.demand === 'high' ? '#00C9A7' : p.demand === 'medium' ? '#F5A623' : '#8B909A';
  const fillColor = p.demand === 'high' ? 'rgba(0,201,167,.12)' : p.demand === 'medium' ? 'rgba(245,166,35,.12)' : 'rgba(139,144,154,.08)';

  const stockStatusText = p.stockLevel === 'critical' ? 'Critical' : p.stockLevel === 'low' ? 'Low' : 'Healthy';
  const trendLabel = p.trend.charAt(0).toUpperCase() + p.trend.slice(1);
  const trendIcon = p.trend === 'rising' ? '↗' : p.trend === 'falling' ? '↘' : '→';

  return `
    <!-- Hero -->
    <div class="inv-detail-hero">
      <div class="inv-detail-hero-img">
        <img src="${p.image}" alt="${p.name}" onerror="this.style.display='none';this.parentElement.innerHTML='<span style=\\'font-size:64px;display:flex;align-items:center;justify-content:center;height:100%\\'>${p.emoji}</span>'" />
      </div>
      <div class="inv-detail-hero-info">
        <div class="inv-detail-name">${p.name}</div>
        <div class="inv-detail-category">${p.category}</div>
        <div class="inv-detail-stats">
          <div class="inv-detail-stat">
            <div class="inv-detail-stat-label">Stock</div>
            <div class="inv-detail-stat-value ${p.stockLevel}">${p.stock}</div>
          </div>
          <div class="inv-detail-stat">
            <div class="inv-detail-stat-label">Demand</div>
            <div class="inv-detail-stat-value ${p.demand === 'low' ? 'low-level' : p.demand}">${p.demandWord}</div>
          </div>
          <div class="inv-detail-stat">
            <div class="inv-detail-stat-label">Price Range</div>
            <div class="inv-detail-stat-value">$${p.price[0]}–$${p.price[1]}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sales Trend Graph -->
    <div class="inv-insight-card">
      <div class="inv-insight-title"><span>📊</span> Sales Trend & Demand Prediction</div>
      <div class="inv-demand-row">
        <span class="inv-demand-level ${p.demand}">${p.demandWord} Demand</span>
        <span class="inv-demand-trend ${p.trend}">${trendIcon} ${trendLabel}</span>
      </div>
      <div class="inv-chart-wrap">
        <svg viewBox="0 0 500 120" preserveAspectRatio="none">
          <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
          <line x1="0" y1="60" x2="500" y2="60" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
          <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,.03)" stroke-width="1"/>
          <path class="inv-chart-fill" d="${fillPath}" fill="${fillColor}"/>
          <path class="inv-chart-line" d="${chartPath}" stroke="${strokeColor}"/>
          <circle cx="500" cy="${lastY}" r="4" fill="${strokeColor}" opacity="0.9"/>
          <circle cx="500" cy="${lastY}" r="8" fill="none" stroke="${strokeColor}" stroke-width="1.5" opacity="0.3">
            <animate attributeName="r" values="5;12;5" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0;0.4" dur="2s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
      <div class="inv-chart-labels"><span>12w ago</span><span>8w ago</span><span>4w ago</span><span>Now</span></div>
      <div class="inv-quick-insight">${p.insight}</div>
      <div class="inv-price-range">
        <span class="inv-price-label">Price Range</span>
        <span class="inv-price-value">$${p.price[0]}</span>
        <span class="inv-price-divider"></span>
        <span class="inv-price-value">$${p.price[1]}</span>
      </div>
    </div>

    <!-- Suggestions -->
    <div class="inv-detail-suggestions">
      <div class="inv-suggestion-card">
        <div class="inv-suggestion-icon ${p.stockLevel === 'critical' || p.stockLevel === 'low' ? 'restock' : 'trending'}">
          ${p.stockLevel === 'critical' || p.stockLevel === 'low' ? '📦' : '📈'}
        </div>
        <div class="inv-suggestion-title">${p.stockLevel === 'critical' ? 'Urgent Restock Needed' : p.stockLevel === 'low' ? 'Restock Recommended' : 'Stock Healthy'}</div>
        <div class="inv-suggestion-desc">${p.stockLevel === 'critical' ? 'Only '+p.stock+' units left. Order now to avoid stockout.' : p.stockLevel === 'low' ? 'Stock is getting low at '+p.stock+' units. Plan a reorder soon.' : 'You have '+p.stock+' units — sufficient for current demand.'}</div>
      </div>
      <div class="inv-suggestion-card">
        <div class="inv-suggestion-icon trending">📊</div>
        <div class="inv-suggestion-title">Demand ${p.trend === 'rising' ? 'Increasing' : p.trend === 'falling' ? 'Decreasing' : 'Stable'}</div>
        <div class="inv-suggestion-desc">${p.trend === 'rising' ? 'Customer interest is growing. Great time to ensure availability.' : p.trend === 'falling' ? 'Interest is declining. Consider promotional strategies.' : 'Demand is consistent. Maintain current stock levels.'}</div>
      </div>
    </div>

    <!-- Actions -->
    <div class="inv-detail-actions">
      <button class="inv-action-btn primary" onclick="event.stopPropagation()">✏️ Edit Product</button>
      <button class="inv-action-btn secondary" onclick="event.stopPropagation()">📦 Update Stock</button>
      <button class="inv-action-btn outline" onclick="event.stopPropagation()">📊 View Insights</button>
    </div>
  `;
}

// ═══════════ CHART PATH BUILDER ═══════════
function buildInvChartPath(pts, w, h) {
  if (!pts.length) return '';
  const maxVal = Math.max(...pts) * 1.1;
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const ys = pts.map(p => h - ((p / maxVal) * h * 0.8) - h * 0.05);
  let d = `M ${xs[0]},${ys[0]}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (xs[i-1] + xs[i]) / 2;
    d += ` C ${cpx},${ys[i-1]} ${cpx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  return d;
}

// ═══════════ SECTION SWITCH HOOKS ═══════════
const origSwitchSection = window.switchSection;
if (origSwitchSection) {
  window.switchSection = function(name, navEl) {
    const result = origSwitchSection(name, navEl);
    if (name === 'inventory') {
      invFocusedMode = false;
      invSelectedId = null;
      invActiveFilter = 'all';
      setTimeout(initInventory, 50);
    }
    if (name === 'demand') {
      setTimeout(initDemandPage, 50);
    }
    if (name === 'trends') {
      setTimeout(initTrends, 50);
    }
    if (name === 'alerts') {
      setTimeout(initAlerts, 50);
    }
    if (name === 'analytics') {
      setTimeout(() => {
        const graphEl = document.getElementById('analytics-graph');
        if (graphEl) graphEl.innerHTML = getAnalyticsGraphSVG();
        initAnalytics();
      }, 50);
    }
    return result;
  };
}

// ═══════════ INIT ON LOAD ═══════════
window.addEventListener('load', () => {
  setTimeout(() => {
    if (document.getElementById('section-inventory')?.classList.contains('active')) {
      initInventory();
    }
  }, 100);
});
