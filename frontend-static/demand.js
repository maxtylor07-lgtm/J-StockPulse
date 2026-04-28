// ═══════════════════════════════════════
// EXPLORE DEMAND — REDESIGNED JS
// ═══════════════════════════════════════

const demandImageMap = {
  'Smart Watch Pro': 'images/smart-watch-pro.png',
  'Running Shoes X1': 'images/running-shoes-x1.png',
  'Wireless Earbuds': 'images/wireless-earbuds.png',
  'Yoga Mat Premium': 'images/yoga-mat-premium.png',
  'Backpack Voyager': 'images/backpack-voyager.png',
  'Resistance Bands Set': 'images/resistance-bands.png',
  'Bluetooth Speaker': 'images/bluetooth-speaker.png',
  'LED Desk Lamp': 'images/desk-lamp-led.png',
  'Steel Water Bottle': 'images/water-bottle-steel.png',
  'Phone Case Armor': 'images/phone-case-armor.png',
};

const demandDatabase = {
  'smart watch':     { name:'Smart Watch Pro', emoji:'⌚', category:'Electronics', level:'high', trend:'Rising', price:'$89 – $149', insight:'Strong upward trajectory driven by wearable tech adoption. Holiday season typically sees a 40% spike in demand. Current market conditions are very favorable.', points:[20,25,30,28,35,42,50,55,60,58,65,72] },
  'running shoes':   { name:'Running Shoes X1', emoji:'👟', category:'Footwear', level:'high', trend:'Rising', price:'$65 – $120', insight:'Fitness season driving demand. Marathon events and social media fitness trends are key drivers. Expected to remain strong through Q2.', points:[30,28,32,35,40,45,50,55,62,68,72,78] },
  'wireless earbuds':{ name:'Wireless Earbuds', emoji:'🎧', category:'Electronics', level:'medium', trend:'Stable', price:'$29 – $79', insight:'Market is saturated but consistent. Brand differentiation and noise-canceling features drive premium pricing.', points:[40,42,38,41,39,43,40,42,44,41,43,42] },
  'yoga mat':        { name:'Yoga Mat Premium', emoji:'🧘', category:'Fitness', level:'medium', trend:'Rising', price:'$25 – $55', insight:'Growing interest in home fitness and wellness. Eco-friendly materials are a strong selling point in this segment.', points:[25,28,30,32,35,34,38,40,42,45,48,52] },
  'backpack':        { name:'Backpack Voyager', emoji:'🎒', category:'Bags', level:'low', trend:'Falling', price:'$45 – $89', insight:'Post-travel season decline in demand. Consider bundling with travel accessories or offering seasonal discounts.', points:[60,55,52,48,45,42,40,38,35,33,30,28] },
  'resistance bands':{ name:'Resistance Bands Set', emoji:'💪', category:'Fitness', level:'high', trend:'Rising', price:'$12 – $35', insight:'Home gym revolution continues to fuel demand. Social media fitness influencers are a major demand driver.', points:[15,20,25,30,35,42,50,58,65,70,75,82] },
  'bluetooth speaker':{ name:'Bluetooth Speaker', emoji:'🔊', category:'Electronics', level:'high', trend:'Rising', price:'$39 – $99', insight:'Outdoor entertainment season boosting demand. Waterproof and portable features are key purchase drivers.', points:[22,28,35,40,48,55,60,68,72,78,82,88] },
  'desk lamp':       { name:'LED Desk Lamp', emoji:'💡', category:'Home Office', level:'low', trend:'Stable', price:'$22 – $48', insight:'Stable niche market. Remote work adoption maintains baseline demand but growth is limited.', points:[20,22,21,23,20,22,21,19,20,22,21,23] },
  'water bottle':    { name:'Steel Water Bottle', emoji:'🍶', category:'Lifestyle', level:'medium', trend:'Rising', price:'$15 – $32', insight:'Sustainability consciousness driving demand for reusable bottles. Summer months show predictable peaks.', points:[30,32,35,38,40,42,45,48,50,52,55,58] },
  'phone case':      { name:'Phone Case Armor', emoji:'📱', category:'Accessories', level:'medium', trend:'Stable', price:'$12 – $25', insight:'Demand closely follows new phone release cycles. Compatible models drive periodic spikes.', points:[50,48,52,50,54,52,56,54,52,50,48,50] },
};

let demandSearched = false;

function initDemandPage() {
  const page = document.getElementById('demand-page');
  const result = document.getElementById('demand-result');
  if (!page) return;

  // Reset state
  demandSearched = false;
  page.classList.remove('searched');
  if (result) { result.classList.remove('visible'); result.innerHTML = ''; }

  setupDemandSearch();
  setupDemandHints();
}

function setupDemandSearch() {
  const input = document.getElementById('demand-search-input');
  if (!input) return;
  input.value = '';

  input.addEventListener('keydown', function handler(e) {
    if (e.key === 'Enter' && input.value.trim()) {
      performDemandSearch(input.value.trim());
    }
  });
}

function setupDemandHints() {
  document.querySelectorAll('.demand-hint').forEach(hint => {
    hint.onclick = () => {
      const input = document.getElementById('demand-search-input');
      if (input) {
        input.value = hint.textContent;
        performDemandSearch(hint.textContent);
      }
    };
  });
}

function performDemandSearch(query) {
  const page = document.getElementById('demand-page');
  const result = document.getElementById('demand-result');
  if (!page || !result) return;

  const key = query.toLowerCase();
  let product = null;

  // Fuzzy match
  for (const [k, v] of Object.entries(demandDatabase)) {
    if (key.includes(k) || k.includes(key)) {
      product = v;
      break;
    }
  }

  // Fallback to random
  if (!product) {
    const keys = Object.keys(demandDatabase);
    product = demandDatabase[keys[Math.floor(Math.random() * keys.length)]];
  }

  // Transition to searched state
  demandSearched = true;
  page.classList.add('searched');

  // Build result
  setTimeout(() => {
    result.innerHTML = buildDemandResult(product);
    result.classList.add('visible');
    result.style.animation = 'none';
    result.offsetHeight;
    result.style.animation = '';
  }, 300);
}

function buildDemandResult(p) {
  const chartPath = buildDemandChartPath(p.points, 700, 140);
  const fillPath = chartPath + ' L 700,140 L 0,140 Z';
  const lastPt = p.points[p.points.length - 1];
  const maxPt = Math.max(...p.points) * 1.1;
  const lastX = 700;
  const lastY = 140 - ((lastPt / maxPt) * 140 * 0.85) - 5;
  const color = p.level === 'high' ? '#00C9A7' : p.level === 'medium' ? '#F5A623' : '#8B909A';
  const fillColor = p.level === 'high' ? 'rgba(0,201,167,.12)' : p.level === 'medium' ? 'rgba(245,166,35,.12)' : 'rgba(139,144,154,.08)';
  const imgSrc = demandImageMap[p.name] || '';

  return `
    <div class="demand-product-header">
      <div class="demand-product-icon">
        ${imgSrc ? `<img src="${imgSrc}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;border-radius:20px" onerror="this.style.display='none';this.parentElement.textContent='${p.emoji}'" />` : p.emoji}
      </div>
      <div class="demand-product-info">
        <div class="demand-product-name">${p.name}</div>
        <div class="demand-product-cat">${p.category}</div>
      </div>
    </div>
    <div class="demand-level-section">
      <div class="demand-level-badge ${p.level}">
        <span class="demand-level-pulse"></span>
        ${p.level === 'high' ? 'High Demand' : p.level === 'medium' ? 'Medium Demand' : 'Low Demand'}
      </div>
    </div>
    <div class="demand-graph-card">
      <div class="demand-graph-title">Demand Trend — Last 12 Weeks</div>
      <div class="demand-graph-wrap">
        <svg viewBox="0 0 700 140" preserveAspectRatio="none">
          <line class="demand-graph-grid-line" x1="0" y1="35" x2="700" y2="35"/>
          <line class="demand-graph-grid-line" x1="0" y1="70" x2="700" y2="70"/>
          <line class="demand-graph-grid-line" x1="0" y1="105" x2="700" y2="105"/>
          <path class="demand-graph-fill" d="${fillPath}" fill="${fillColor}"/>
          <path class="demand-graph-line" d="${chartPath}" stroke="${color}"/>
          <circle class="demand-graph-dot" cx="${lastX}" cy="${lastY}" fill="${color}"/>
        </svg>
      </div>
      <div class="demand-graph-labels"><span>12w ago</span><span>8w</span><span>4w</span><span>Now</span></div>
    </div>
    <div class="demand-info-grid">
      <div class="demand-info-box">
        <div class="demand-info-label">Trend Direction</div>
        <div class="demand-info-value" style="color:${color}">${p.trend}</div>
        <div class="demand-info-sub">Based on 12-week analysis</div>
      </div>
      <div class="demand-info-box">
        <div class="demand-info-label">Price Range</div>
        <div class="demand-info-value">${p.price}</div>
        <div class="demand-info-sub">Market average pricing</div>
      </div>
    </div>
    <div class="demand-insight-card">
      <div class="inv-insight-title">Quick Insight</div>
      <div class="demand-insight-text">${p.insight}</div>
    </div>
  `;
}

function buildDemandChartPath(pts, w, h) {
  if (!pts.length) return '';
  const maxVal = Math.max(...pts) * 1.1;
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const ys = pts.map(p => h - ((p / maxVal) * h * 0.85) - h * 0.03);
  let d = `M ${xs[0]},${ys[0]}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (xs[i-1] + xs[i]) / 2;
    d += ` C ${cpx},${ys[i-1]} ${cpx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  return d;
}

// Init on load
window.addEventListener('load', () => {
  if (document.getElementById('section-demand')?.classList.contains('active')) {
    initDemandPage();
  }
});
