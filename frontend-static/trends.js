// ═══════════════════════════════════════
// TRENDS PAGE — REDESIGNED JS
// ═══════════════════════════════════════

// Image map for all trend products
const trendImageMap = {
  'Smart Watch Pro': 'images/smart-watch-pro.png',
  'Wireless Earbuds': 'images/wireless-earbuds.png',
  'Bluetooth Speaker': 'images/bluetooth-speaker.png',
  'USB-C Hub': 'images/usbc-hub-ultra.png',
  '4K Webcam': 'images/webcam-4k.png',
  'Phone Case Armor': 'images/phone-case-armor.png',
  'Running Shoes X1': 'images/running-shoes-x1.png',
  'Yoga Mat Premium': 'images/yoga-mat-premium.png',
  'Resistance Bands': 'images/resistance-bands.png',
  'Protein Shaker': 'images/protein-shaker.png',
  'Oversized Hoodie': 'images/oversized-hoodie.png',
  'Canvas Sneakers': 'images/canvas-sneakers.png',
  'Crossbody Bag': 'images/crossbody-bag.png',
  'Cold Brew Coffee': 'images/cold-brew-coffee.png',
  'Protein Bars': 'images/protein-bars.png',
  'Trail Mix Organic': 'images/trail-mix-organic.png',
  'Desk Lamp LED': 'images/desk-lamp-led.png',
  'Ergonomic Chair': 'images/ergonomic-chair.png',
  'Water Bottle Steel': 'images/water-bottle-steel.png',
  'Backpack Voyager': 'images/backpack-voyager.png',
  'Journal Notebook': 'images/journal-notebook.png',
};

// SVG icons for categories (consistent line-icon system)
const trendCatIcons = {
  'all': '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  'electronics': '<svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  'fitness': '<svg viewBox="0 0 24 24"><path d="M6.5 6.5a1.5 1.5 0 1 1 3 0v11a1.5 1.5 0 0 1-3 0z"/><path d="M14.5 6.5a1.5 1.5 0 1 1 3 0v11a1.5 1.5 0 0 1-3 0z"/><line x1="9.5" y1="12" x2="14.5" y2="12"/><line x1="3" y1="9" x2="6.5" y2="9"/><line x1="3" y1="15" x2="6.5" y2="15"/><line x1="17.5" y1="9" x2="21" y2="9"/><line x1="17.5" y1="15" x2="21" y2="15"/></svg>',
  'fashion': '<svg viewBox="0 0 24 24"><path d="M12 2L8 6H4v4l-2 2 2 2v4h4l4 4 4-4h4v-4l2-2-2-2V6h-4L12 2z"/></svg>',
  'food': '<svg viewBox="0 0 24 24"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>',
  'home': '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  'lifestyle': '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><line x1="2" y1="12" x2="22" y2="12"/></svg>',
};

const trendCategories = [
  { id:'all', label:'All Categories' },
  { id:'electronics', label:'Electronics' },
  { id:'fitness', label:'Fitness' },
  { id:'fashion', label:'Fashion' },
  { id:'food', label:'Food & Grocery' },
  { id:'home', label:'Home & Office' },
  { id:'lifestyle', label:'Lifestyle' },
];

const trendProducts = [
  { name:'Smart Watch Pro', emoji:'⌚', cat:'electronics', demand:'high', tag:'rising', tagLabel:'🔥 Rising', reason:'Wearable tech adoption surging globally. Holiday season approaching with expected 40% demand spike.', price:'$89–$149', competition:'High', points:[20,25,30,28,35,42,50,55,60,58,65,72] },
  { name:'Wireless Earbuds', emoji:'🎧', cat:'electronics', demand:'medium', tag:'stable', tagLabel:'📊 Stable', reason:'Market is saturated but consistent. Noise-canceling models drive premium segment.', price:'$29–$79', competition:'Very High', points:[40,42,38,41,39,43,40,42,44,41,43,42] },
  { name:'Bluetooth Speaker', emoji:'🔊', cat:'electronics', demand:'high', tag:'viral', tagLabel:'🔥 Viral', reason:'Trending on social media. Waterproof portable models going viral on TikTok.', price:'$39–$99', competition:'Medium', points:[22,28,35,40,48,55,60,68,72,78,82,88] },
  { name:'USB-C Hub', emoji:'🔌', cat:'electronics', demand:'medium', tag:'stable', tagLabel:'📊 Stable', reason:'Steady demand from remote workers. New laptop releases drive periodic spikes.', price:'$35–$65', competition:'Medium', points:[45,43,44,46,45,47,44,46,45,43,44,46] },
  { name:'4K Webcam', emoji:'📹', cat:'electronics', demand:'medium', tag:'rising', tagLabel:'🔥 Rising', reason:'Streaming culture growth. Content creation tools seeing increased demand.', price:'$49–$129', competition:'Low', points:[30,32,35,38,42,45,48,52,55,58,62,65] },
  { name:'Phone Case Armor', emoji:'📱', cat:'electronics', demand:'medium', tag:'stable', tagLabel:'📊 Stable', reason:'Follows new phone release cycles. Compatible models drive periodic spikes.', price:'$12–$25', competition:'High', points:[50,48,52,50,54,52,56,54,52,50,48,50] },
  { name:'Running Shoes X1', emoji:'👟', cat:'fitness', demand:'high', tag:'rising', tagLabel:'🔥 Rising', reason:'Fitness season approaching. Marathon events and social media fitness trends key drivers.', price:'$65–$120', competition:'High', points:[30,28,32,35,40,45,50,55,62,68,72,78] },
  { name:'Yoga Mat Premium', emoji:'🧘', cat:'fitness', demand:'medium', tag:'rising', tagLabel:'📈 Growing', reason:'Home fitness trend continuing. Eco-friendly materials gaining market share.', price:'$25–$55', competition:'Medium', points:[25,28,30,32,35,34,38,40,42,45,48,52] },
  { name:'Resistance Bands', emoji:'💪', cat:'fitness', demand:'high', tag:'viral', tagLabel:'🔥 Viral', reason:'Home gym revolution. Fitness influencers driving massive social media demand.', price:'$12–$35', competition:'Low', points:[15,20,25,30,35,42,50,58,65,70,75,82] },
  { name:'Protein Shaker', emoji:'🥤', cat:'fitness', demand:'medium', tag:'stable', tagLabel:'📊 Stable', reason:'Consistent gym-goer demand. New designs with mixing balls trending.', price:'$8–$22', competition:'Medium', points:[35,37,36,38,37,39,38,36,37,39,38,40] },
  { name:'Oversized Hoodie', emoji:'🧥', cat:'fashion', demand:'high', tag:'viral', tagLabel:'🔥 Viral', reason:'Streetwear trend on social media. Seasonal demand spike with fall/winter approaching.', price:'$35–$75', competition:'High', points:[25,30,38,45,52,58,65,70,75,80,85,90] },
  { name:'Canvas Sneakers', emoji:'👟', cat:'fashion', demand:'medium', tag:'rising', tagLabel:'📈 Growing', reason:'Retro fashion comeback. Sustainable materials version gaining traction.', price:'$40–$85', competition:'High', points:[35,38,40,42,45,48,50,53,55,58,60,63] },
  { name:'Crossbody Bag', emoji:'👜', cat:'fashion', demand:'low', tag:'declining', tagLabel:'📉 Declining', reason:'Post-season decline. Smaller minimalist styles replacing larger models.', price:'$25–$60', competition:'Medium', points:[55,52,50,48,45,42,40,38,35,32,30,28] },
  { name:'Cold Brew Coffee', emoji:'☕', cat:'food', demand:'high', tag:'rising', tagLabel:'🔥 Rising', reason:'Summer season approaching. Ready-to-drink coffee market expanding rapidly.', price:'$3–$8', competition:'Medium', points:[28,32,35,40,45,50,55,60,65,70,75,80] },
  { name:'Protein Bars', emoji:'🍫', cat:'food', demand:'medium', tag:'stable', tagLabel:'📊 Stable', reason:'Health-conscious consumers maintain consistent demand. New flavors drive trial.', price:'$2–$5', competition:'High', points:[42,44,43,45,44,46,45,43,44,46,45,47] },
  { name:'Trail Mix Organic', emoji:'🥜', cat:'food', demand:'low', tag:'declining', tagLabel:'📉 Declining', reason:'Post-hiking season. Competition from newer snack alternatives increasing.', price:'$8–$18', competition:'Medium', points:[50,48,45,42,40,38,35,32,30,28,26,24] },
  { name:'Desk Lamp LED', emoji:'💡', cat:'home', demand:'low', tag:'stable', tagLabel:'📊 Stable', reason:'Remote work maintains baseline demand. Growth limited in mature market.', price:'$22–$48', competition:'Medium', points:[20,22,21,23,20,22,21,19,20,22,21,23] },
  { name:'Ergonomic Chair', emoji:'🪑', cat:'home', demand:'medium', tag:'rising', tagLabel:'📈 Growing', reason:'Work-from-home ergonomics awareness growing. Premium models trending.', price:'$150–$400', competition:'Medium', points:[30,32,35,38,40,43,45,48,50,53,55,58] },
  { name:'Water Bottle Steel', emoji:'🍶', cat:'lifestyle', demand:'medium', tag:'rising', tagLabel:'📈 Growing', reason:'Sustainability consciousness driving demand. Summer months show predictable peaks.', price:'$15–$32', competition:'Medium', points:[30,32,35,38,40,42,45,48,50,52,55,58] },
  { name:'Backpack Voyager', emoji:'🎒', cat:'lifestyle', demand:'low', tag:'declining', tagLabel:'📉 Declining', reason:'Post-travel season. Demand expected to recover with next vacation period.', price:'$45–$89', competition:'High', points:[60,55,52,48,45,42,40,38,35,33,30,28] },
  { name:'Journal Notebook', emoji:'📓', cat:'lifestyle', demand:'medium', tag:'rising', tagLabel:'📈 Growing', reason:'Mindfulness and productivity journaling trending. Leather-bound premium versions popular.', price:'$12–$30', competition:'Low', points:[28,30,33,35,38,40,42,45,48,50,52,55] },
];

const trendSections = [
  { id:'fast', title:'Fast Moving', emoji:'⚡', filter: p => p.demand === 'high' },
  { id:'viral', title:'Viral Products', emoji:'🔥', filter: p => p.tag === 'viral' || p.tag === 'rising' },
  { id:'profit', title:'High Profit Potential', emoji:'💰', filter: p => p.competition === 'Low' || p.competition === 'Medium' },
  { id:'ordered', title:'Most Popular This Week', emoji:'🛒', filter: p => p.demand !== 'low' },
  { id:'falling', title:'Falling Trends', emoji:'📉', filter: p => p.tag === 'declining' },
];

let currentTrendCat = 'all';

function initTrends() {
  renderTrendCategories();
  renderTrendSections();
}

function renderTrendCategories() {
  const list = document.getElementById('trends-cat-list');
  if (!list) return;
  list.innerHTML = '';
  trendCategories.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'trends-cat-item' + (c.id === currentTrendCat ? ' active' : '');
    btn.innerHTML = `<span class="trends-cat-icon">${trendCatIcons[c.id] || ''}</span><span>${c.label}</span>`;
    btn.onclick = () => { currentTrendCat = c.id; renderTrendCategories(); renderTrendSections(); };
    list.appendChild(btn);
  });
}

function renderTrendSections() {
  const main = document.getElementById('trends-sections');
  if (!main) return;
  main.innerHTML = '';

  const filtered = currentTrendCat === 'all' ? trendProducts : trendProducts.filter(p => p.cat === currentTrendCat);

  trendSections.forEach(sec => {
    const products = filtered.filter(sec.filter);
    if (!products.length) return;

    const section = document.createElement('div');
    section.className = 'trend-section';
    section.innerHTML = `<div class="trend-section-head"><span class="trend-section-emoji">${sec.emoji}</span><span class="trend-section-title">${sec.title}</span><span class="trend-section-count">${products.length} products</span></div>`;

    const railWrap = document.createElement('div');
    railWrap.className = 'trend-rail-wrap';

    const rail = document.createElement('div');
    rail.className = 'trend-rail';

    products.forEach(p => {
      const imgSrc = trendImageMap[p.name] || '';
      const card = document.createElement('div');
      card.className = 'trend-card';
      card.onclick = () => openTrendModal(p);
      card.innerHTML = `
        <div class="trend-card-img">
          <img src="${imgSrc}" alt="${p.name}" loading="lazy" onerror="this.style.display='none';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.parentElement.style.fontSize='44px';this.parentElement.insertAdjacentHTML('beforeend','${p.emoji}')" />
          <div class="trend-card-overlay">
            <div class="trend-card-overlay-name">${p.name}</div>
            <span class="trend-card-overlay-tag ${p.tag}">${p.tagLabel}</span>
            <div class="trend-card-overlay-actions">
              <button class="trend-card-overlay-btn view" onclick="event.stopPropagation();openTrendModal(trendProducts.find(x=>x.name==='${p.name.replace(/'/g,"\\'")}'))">View</button>
              <button class="trend-card-overlay-btn analyze" onclick="event.stopPropagation();openTrendModal(trendProducts.find(x=>x.name==='${p.name.replace(/'/g,"\\'")}'))">Analyze</button>
            </div>
          </div>
        </div>
        <div class="trend-card-body">
          <div class="trend-card-name">${p.name}</div>
          <span class="trend-tag ${p.tag}">${p.tagLabel}</span>
        </div>`;
      rail.appendChild(card);
    });

    // Arrow buttons
    const leftArrow = document.createElement('button');
    leftArrow.className = 'trend-rail-arrow left';
    leftArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>';
    leftArrow.onclick = () => { rail.scrollBy({ left: -300, behavior: 'smooth' }); };

    const rightArrow = document.createElement('button');
    rightArrow.className = 'trend-rail-arrow right';
    rightArrow.innerHTML = '<svg viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>';
    rightArrow.onclick = () => { rail.scrollBy({ left: 300, behavior: 'smooth' }); };

    railWrap.appendChild(leftArrow);
    railWrap.appendChild(rail);
    railWrap.appendChild(rightArrow);
    section.appendChild(railWrap);
    main.appendChild(section);

    // Enable mouse drag scrolling
    enableDragScroll(rail);
  });

  // Re-trigger animations
  main.style.animation = 'none';
  main.offsetHeight;
  main.style.animation = '';
}

// Mouse drag scrolling for rails
function enableDragScroll(el) {
  let isDown = false, startX, scrollLeft;
  el.addEventListener('mousedown', e => {
    if (e.target.closest('button')) return;
    isDown = true; el.style.cursor = 'grabbing';
    startX = e.pageX - el.offsetLeft;
    scrollLeft = el.scrollLeft;
  });
  el.addEventListener('mouseleave', () => { isDown = false; el.style.cursor = 'grab'; });
  el.addEventListener('mouseup', () => { isDown = false; el.style.cursor = 'grab'; });
  el.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft - (x - startX) * 1.5;
  });
}

function openTrendModal(p) {
  const overlay = document.getElementById('trend-modal-overlay');
  if (!overlay) return;
  const color = p.demand === 'high' ? '#00C9A7' : p.demand === 'medium' ? '#F5A623' : '#8B909A';
  const fillColor = p.demand === 'high' ? 'rgba(0,201,167,.12)' : p.demand === 'medium' ? 'rgba(245,166,35,.12)' : 'rgba(139,144,154,.08)';
  const chartPath = buildTrendChartPath(p.points, 480, 90);
  const fillPath = chartPath + ' L 480,90 L 0,90 Z';
  const imgSrc = trendImageMap[p.name] || '';

  overlay.innerHTML = `<div class="trend-modal" onclick="event.stopPropagation()">
    <div class="trend-modal-hero">
      <img src="${imgSrc}" alt="${p.name}" onerror="this.parentElement.style.background='var(--surface2)';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center';this.parentElement.innerHTML='<span style=\\'font-size:64px\\'>${p.emoji}</span>'" />
      <button class="trend-modal-close" onclick="closeTrendModal()">✕</button>
    </div>
    <div class="trend-modal-content">
      <div class="trend-modal-header">
        <div class="trend-modal-icon"><img src="${imgSrc}" alt="${p.name}" onerror="this.style.display='none';this.parentElement.style.fontSize='30px';this.parentElement.textContent='${p.emoji}'" /></div>
        <div><div class="trend-modal-name">${p.name}</div><div class="trend-modal-cat">${p.cat}</div></div>
      </div>
      <div class="trend-modal-section"><div class="trend-modal-label">Demand Level</div><div class="trend-modal-level ${p.demand}"><span class="trend-modal-pulse"></span>${p.demand === 'high' ? 'High Demand' : p.demand === 'medium' ? 'Medium Demand' : 'Low Demand'}</div></div>
      <div class="trend-modal-section"><div class="trend-modal-label">Demand Trend</div><div class="trend-modal-chart"><svg viewBox="0 0 480 90" preserveAspectRatio="none"><line x1="0" y1="22" x2="480" y2="22" stroke="rgba(255,255,255,.03)"/><line x1="0" y1="45" x2="480" y2="45" stroke="rgba(255,255,255,.03)"/><line x1="0" y1="67" x2="480" y2="67" stroke="rgba(255,255,255,.03)"/><path class="tm-chart-fill" d="${fillPath}" fill="${fillColor}"/><path class="tm-chart-line" d="${chartPath}" stroke="${color}"/></svg></div><div class="tm-chart-labels"><span>12w ago</span><span>8w</span><span>4w</span><span>Now</span></div></div>
      <div class="trend-modal-section"><div class="trend-modal-label">Why It's Trending</div><div class="trend-modal-reason">${p.reason}</div></div>
      <div class="trend-modal-section"><div class="trend-modal-stats"><div class="trend-modal-stat"><div class="trend-modal-stat-label">Price Range</div><div class="trend-modal-stat-value">${p.price}</div></div><div class="trend-modal-stat"><div class="trend-modal-stat-label">Competition</div><div class="trend-modal-stat-value">${p.competition}</div></div></div></div>
    </div>
  </div>`;

  overlay.classList.add('visible');
  overlay.onclick = closeTrendModal;
}

function closeTrendModal() {
  const overlay = document.getElementById('trend-modal-overlay');
  if (overlay) overlay.classList.remove('visible');
}

function buildTrendChartPath(pts, w, h) {
  if (!pts.length) return '';
  const mx = Math.max(...pts) * 1.1;
  const xs = pts.map((_, i) => (i / (pts.length - 1)) * w);
  const ys = pts.map(p => h - ((p / mx) * h * 0.85) - h * 0.05);
  let d = `M ${xs[0]},${ys[0]}`;
  for (let i = 1; i < pts.length; i++) { const cpx = (xs[i-1]+xs[i])/2; d += ` C ${cpx},${ys[i-1]} ${cpx},${ys[i]} ${xs[i]},${ys[i]}`; }
  return d;
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeTrendModal(); });
