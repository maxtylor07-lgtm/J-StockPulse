// ═══════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════
const ease = t => t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
function lerp(a, b, t) { return a + (b - a) * t; }

function animateValue(el, from, to, duration, suffix = '') {
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.round(lerp(from, to, ease(p))) + suffix;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ═══════════════════════════════════════
// GREETING
// ═══════════════════════════════════════
(function setGreeting() {
  const h = new Date().getHours();
  let greeting = 'Good evening';
  if (h < 12) greeting = 'Good morning';
  else if (h < 17) greeting = 'Good afternoon';
  const el = document.getElementById('page-title');
  if (el) el.textContent = greeting + ', Arjun';
})();

// Date display
(function setDate() {
  const el = document.getElementById('header-date');
  if (!el) return;
  const now = new Date();
  const opts = { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' };
  el.textContent = now.toLocaleDateString('en-US', opts);
})();

// ═══════════════════════════════════════
// PROFILE DROPDOWN
// ═══════════════════════════════════════
function toggleProfileDropdown() {
  document.getElementById('profile-section').classList.toggle('open');
}
document.addEventListener('click', function(e) {
  const ps = document.getElementById('profile-section');
  if (ps && !ps.contains(e.target)) ps.classList.remove('open');
});

// ═══════════════════════════════════════
// SECTION SWITCHING
// ═══════════════════════════════════════
function switchSection(name, navEl) {
  // Update nav
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (navEl) navEl.classList.add('active');

  // Update sections
  document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
  const section = document.getElementById('section-' + name);
  if (section) {
    section.classList.add('active');
    // Re-trigger animation
    section.style.animation = 'none';
    section.offsetHeight; // reflow
    section.style.animation = '';
  }

  // If overview, re-animate
  if (name === 'overview') {
    setTimeout(animateOverview, 100);
  }

  return false;
}

// ═══════════════════════════════════════
// STAT COUNTERS
// ═══════════════════════════════════════
function animateOverview() {
  // Animate stat values
  document.querySelectorAll('.stat-value').forEach(el => {
    const target = parseInt(el.dataset.target) || 0;
    animateValue(el, 0, target, 1200);
  });

  // Animate inventory bars
  document.querySelectorAll('.inv-bar-fill').forEach(bar => {
    const w = bar.dataset.width;
    setTimeout(() => { bar.style.width = w + '%'; }, 300);
  });

  // Animate bar values
  document.querySelectorAll('.inv-bar-val').forEach(el => {
    const target = parseInt(el.dataset.target) || 0;
    setTimeout(() => animateValue(el, 0, target, 900, '%'), 300);
  });
}

// ═══════════════════════════════════════
// TOP PRODUCTS
// ═══════════════════════════════════════
const topProducts = [
  { name: 'Smart Watches', demand: '91%', color: '#00C9A7', points: [35,30,24,18,12,8,4] },
  { name: 'Trail Runners', demand: '82%', color: '#4F80FF', points: [30,25,22,18,15,12,8] },
  { name: 'USB-C Hubs', demand: '76%', color: '#9D6FFF', points: [38,34,28,22,16,10,5] },
  { name: 'Resistance Bands', demand: '68%', color: '#F5A623', points: [40,36,30,24,18,12,8] },
];

function buildSparkPath(pts, w = 140, h = 36) {
  if (!pts.length) return '';
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const mn = Math.min(...pts), mx = Math.max(...pts);
  const ys = pts.map(p => h - ((p - mn) / (mx - mn || 1)) * h * 0.85 - h * 0.05);
  let d = `M ${xs[0]},${ys[0]}`;
  for (let i = 1; i < pts.length; i++) {
    const cpx = (xs[i-1] + xs[i]) / 2;
    d += ` C ${cpx},${ys[i-1]} ${cpx},${ys[i]} ${xs[i]},${ys[i]}`;
  }
  return d;
}

function renderTopProducts() {
  const row = document.getElementById('products-row');
  if (!row) return;
  topProducts.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-mini';
    card.innerHTML = `
      <svg class="product-mini-spark" viewBox="0 0 140 36" preserveAspectRatio="none">
        <path class="spark-path" d="${buildSparkPath(p.points)}" stroke="${p.color}"/>
      </svg>
      <div class="product-mini-name">${p.name}</div>
      <div class="product-mini-demand">${p.demand}</div>
      <div class="product-mini-label">Demand index</div>
    `;
    row.appendChild(card);
  });
}

// ═══════════════════════════════════════
// LIVE BACKEND METRICS & CHART.JS WIRING
// ═══════════════════════════════════════

// Update the 4 top stat cards from /api/analytics/dashboard
async function loadLiveMetrics() {
  if (!window.api || !window.Auth || !window.Auth.isLoggedIn()) return;
  try {
    const m = await window.api('/api/analytics/dashboard');
    const setStat = (selector, value) => {
      const el = document.querySelector(selector + ' .stat-value');
      if (!el) return;
      el.dataset.target = value;
      el.textContent = value;
    };
    setStat('#stat-total-products', m.totalProducts ?? 0);
    setStat('#stat-low-stock', m.lowStockProducts ?? 0);
    setStat('#stat-demand-up', m.fastMovingProducts ?? 0);
    setStat('#stat-alerts', m.lowStockProducts ?? 0);

    // Also show total value as the subtext under "Total Products"
    const change = document.querySelector('#stat-total-products .stat-change');
    if (change) {
      const v = Number(m.totalInventoryValue || 0);
      change.textContent = `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })} inventory value`;
      change.classList.remove('negative');
      change.classList.add('positive');
    }
  } catch (err) {
    console.error('[metrics] load failed:', err.message);
    if (err.status === 401 && window.Auth) window.Auth.logout();
  }
}

let _stockChart = null;
let _salesChart = null;

async function renderLiveCharts() {
  if (!window.api || !window.Auth || !window.Auth.isLoggedIn() || !window.Chart) return;

  // Shared theme
  Chart.defaults.color = 'rgba(230,230,235,0.75)';
  Chart.defaults.borderColor = 'rgba(255,255,255,0.08)';
  Chart.defaults.font.family = 'Inter, system-ui, sans-serif';

  // ── Stock by Category (doughnut)
  try {
    const s = await window.api('/api/analytics/stock-summary');
    const canvas = document.getElementById('chart-stock-summary');
    const empty = document.getElementById('chart-stock-empty');
    if (canvas) {
      const hasData = Array.isArray(s.data) && s.data.length > 0 && s.data.some(v => v > 0);
      canvas.style.display = hasData ? '' : 'none';
      if (empty) empty.style.display = hasData ? 'none' : '';
      if (hasData) {
        if (_stockChart) _stockChart.destroy();
        _stockChart = new Chart(canvas.getContext('2d'), {
          type: 'doughnut',
          data: {
            labels: s.labels,
            datasets: [{
              data: s.data,
              backgroundColor: ['#4F80FF','#00C9A7','#9D6FFF','#F5A623','#FF5E7A','#3DD5F3','#B8E986','#E94E77'],
              borderColor: 'rgba(15,17,21,0.9)',
              borderWidth: 2,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '62%',
            plugins: { legend: { position: 'bottom', labels: { usePointStyle: true, padding: 14 } } },
          },
        });
      }
    }
  } catch (err) {
    console.error('[stock-summary]', err.message);
  }

  // ── Monthly Sales (line)
  try {
    const s = await window.api('/api/analytics/monthly-sales');
    const canvas = document.getElementById('chart-monthly-sales');
    const empty = document.getElementById('chart-monthly-empty');
    if (canvas) {
      const hasData = Array.isArray(s.data) && s.data.length > 0;
      canvas.style.display = hasData ? '' : 'none';
      if (empty) empty.style.display = hasData ? 'none' : '';
      if (hasData) {
        if (_salesChart) _salesChart.destroy();
        _salesChart = new Chart(canvas.getContext('2d'), {
          type: 'line',
          data: {
            labels: s.labels,
            datasets: [{
              label: 'Units sold',
              data: s.data,
              borderColor: '#4F80FF',
              backgroundColor: 'rgba(79,128,255,0.15)',
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#4F80FF',
              pointRadius: 4,
              pointHoverRadius: 6,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              y: { beginAtZero: true, ticks: { precision: 0 } },
              x: { grid: { display: false } },
            },
          },
        });
      }
    }
  } catch (err) {
    console.error('[monthly-sales]', err.message);
  }
}

// Re-fetch after inventory changes (add/delete/edit)
window.refreshLiveDashboard = async function refreshLiveDashboard() {
  await loadLiveMetrics();
  await renderLiveCharts();
};

// ═══════════════════════════════════════
// INIT
// ═══════════════════════════════════════
window.addEventListener('load', () => {
  renderTopProducts();
  setTimeout(animateOverview, 200);
  // Kick off live backend wiring
  window.refreshLiveDashboard && window.refreshLiveDashboard();
});
