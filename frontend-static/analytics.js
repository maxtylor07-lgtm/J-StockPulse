// ═══════════════════════════════════════
// ANALYTICS PAGE — JS
// ═══════════════════════════════════════

function initAnalytics() {
  animateAnalyticsBars();
  animateAnalyticsCounters();
}

function animateAnalyticsBars() {
  document.querySelectorAll('#section-analytics .an-cat-fill').forEach(bar => {
    const w = bar.dataset.width;
    if (w) setTimeout(() => { bar.style.width = w + '%'; }, 400);
  });
}

function animateAnalyticsCounters() {
  document.querySelectorAll('#section-analytics .analytics-stat-value[data-val]').forEach(el => {
    const target = el.dataset.val;
    // Simple text set with a slight delay for stagger effect
    setTimeout(() => { el.textContent = target; }, 300);
  });
}

function buildAnalyticsGraph() {
  // Sales data (past)
  const sales = [42,45,40,48,55,52,60,58,65,70,68,75,80,78,85];
  // Predicted data (future, starts from last sales point)
  const predicted = [null,null,null,null,null,null,null,null,null,null,null,null,80,88,95,102,98];

  const w = 700, h = 180;
  const allPts = sales;
  const mx = Math.max(...sales, ...predicted.filter(v=>v!==null)) * 1.15;

  // Sales line
  const sXs = allPts.map((_, i) => (i / (allPts.length - 1)) * w);
  const sYs = allPts.map(p => h - ((p / mx) * h * 0.85) - 8);
  let salesPath = `M ${sXs[0]},${sYs[0]}`;
  for (let i = 1; i < allPts.length; i++) {
    const cpx = (sXs[i-1]+sXs[i])/2;
    salesPath += ` C ${cpx},${sYs[i-1]} ${cpx},${sYs[i]} ${sXs[i]},${sYs[i]}`;
  }

  // Predicted line
  const predPts = predicted.filter(v => v !== null);
  const predStartIdx = predicted.indexOf(predPts[0]);
  const pXs = predPts.map((_, i) => ((predStartIdx + i) / (predicted.length - 1)) * w);
  const pYs = predPts.map(p => h - ((p / mx) * h * 0.85) - 8);
  let predPath = `M ${pXs[0]},${pYs[0]}`;
  for (let i = 1; i < predPts.length; i++) {
    const cpx = (pXs[i-1]+pXs[i])/2;
    predPath += ` C ${cpx},${pYs[i-1]} ${cpx},${pYs[i]} ${pXs[i]},${pYs[i]}`;
  }

  const salesFill = salesPath + ` L ${sXs[sXs.length-1]},${h} L ${sXs[0]},${h} Z`;

  return { salesPath, predPath, salesFill, w, h };
}

function getAnalyticsGraphSVG() {
  const g = buildAnalyticsGraph();
  return `<svg viewBox="0 0 ${g.w} ${g.h}" preserveAspectRatio="none">
    <line x1="0" y1="45" x2="${g.w}" y2="45" stroke="rgba(255,255,255,.03)"/>
    <line x1="0" y1="90" x2="${g.w}" y2="90" stroke="rgba(255,255,255,.03)"/>
    <line x1="0" y1="135" x2="${g.w}" y2="135" stroke="rgba(255,255,255,.03)"/>
    <path class="an-graph-fill" d="${g.salesFill}" fill="rgba(79,128,255,.1)"/>
    <path class="an-graph-line" d="${g.salesPath}" stroke="#4F80FF"/>
    <path class="an-graph-line predicted" d="${g.predPath}" stroke="#00C9A7"/>
  </svg>`;
}

// Build graph on init
window.addEventListener('load', () => {
  const graphEl = document.getElementById('analytics-graph');
  if (graphEl) graphEl.innerHTML = getAnalyticsGraphSVG();
});
