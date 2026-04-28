// ═══════════════════════════════════════
// ALERTS PAGE — REDESIGNED JS (FUNCTIONAL)
// ═══════════════════════════════════════

const alertsData = [
  { id:1, type:'low-stock', priority:'high', icon:'📦', title:'Running Shoes X1 — Critically Low', msg:'Only 12 units remaining. At current sell rate, stockout in ~2 days.', context:'This product has high demand (rising 34% this month). Stockout will result in estimated $1,440 lost revenue.', action:'Reorder 200 units immediately to maintain supply. Average delivery time is 3 business days.', product:'Running Shoes X1', stock:12, time:'2 min ago', actionBtns:[{label:'📦 Restock Now',cls:'primary',action:'restock'},{label:'Ignore',cls:'ghost',action:'dismiss'}] },
  { id:2, type:'demand-spike', priority:'high', icon:'🔮', title:'Cold Drinks — Demand Spike Incoming', msg:'Expected +60% sales in next 3 days due to weather forecast (35°C+).', context:'Historical data shows 2.5x sales during heatwaves. Current stock may not be sufficient.', action:'Increase stock by at least 150 units before the temperature spike on Thursday.', product:'Cold Drinks', stock:85, time:'15 min ago', actionBtns:[{label:'📦 Increase Stock',cls:'primary',action:'restock'},{label:'📊 View Analytics',cls:'secondary',action:'analytics'}] },
  { id:3, type:'overstock', priority:'medium', icon:'📉', title:'Trail Mix Organic — Overstocked', msg:'180 units in stock, only 4 sold in last 10 days. Inventory cost increasing.', context:'Demand has dropped 35% post-hiking season. Holding cost is $2.50/unit/week.', action:'Create a 20% discount bundle or reduce next order quantity by 50%.', product:'Trail Mix Organic', stock:180, time:'1 hour ago', actionBtns:[{label:'💰 Create Discount',cls:'primary',action:'discount'},{label:'📉 Reduce Orders',cls:'secondary',action:'reduce'}] },
  { id:4, type:'demand-drop', priority:'medium', icon:'📉', title:'Backpack Voyager — Sales Declining', msg:'Demand dropped by 38% over the last 4 weeks. Trend is accelerating.', context:'Travel season ended. Competitor launched similar product at 15% lower price point.', action:'Avoid restocking. Consider a clearance sale or bundle with travel accessories.', product:'Backpack Voyager', stock:67, time:'2 hours ago', actionBtns:[{label:'🏷️ Run Promotion',cls:'primary',action:'discount'},{label:'⏸️ Pause Restock',cls:'secondary',action:'pause'}] },
  { id:5, type:'expiry', priority:'high', icon:'⏳', title:'Protein Bars — Nearing Expiry', msg:'45 units expiring in 12 days. No sales in last 5 days for this batch.', context:'Expired inventory results in 100% loss. These units represent $225 in cost.', action:'Apply 40% discount immediately and move to featured promotions.', product:'Protein Bars', stock:45, time:'3 hours ago', actionBtns:[{label:'💰 Discount Now',cls:'primary',action:'discount'},{label:'Mark Resolved',cls:'ghost',action:'dismiss'}] },
  { id:6, type:'profit', priority:'info', icon:'💰', title:'Resistance Bands — Profit Opportunity', msg:'High demand + low competition = strong profit margins (62%). Currently understocked.', context:'Home fitness category growing 28% monthly. You are leaving money on the table.', action:'Increase stock by 100 units. Consider premium bundle with yoga mat.', product:'Resistance Bands', stock:28, time:'4 hours ago', actionBtns:[{label:'📦 Stock More',cls:'primary',action:'restock'},{label:'📊 View Analytics',cls:'secondary',action:'analytics'}] },
  { id:7, type:'risk', priority:'high', icon:'⚠️', title:'Smart Watch Pro — Risk of Lost Sales', msg:'Stock dropping while demand is rising. You may lose sales by end of this week.', context:'245 units remaining vs. projected 300 unit demand in the next 7 days.', action:'Place urgent restock order. Consider express shipping to avoid gaps.', product:'Smart Watch Pro', stock:245, time:'5 hours ago', actionBtns:[{label:'📦 Urgent Restock',cls:'primary',action:'restock'},{label:'Ignore',cls:'ghost',action:'dismiss'}] },
  { id:8, type:'low-stock', priority:'medium', icon:'📦', title:'Water Bottle Steel — Stock Running Low', msg:'Only 8 units left. Demand has been steadily increasing over 6 weeks.', context:'Sustainability trend driving purchases. Summer peak approaching.', action:'Order 75 units within 2 days to avoid stockout.', product:'Water Bottle Steel', stock:8, time:'6 hours ago', actionBtns:[{label:'📦 Restock Now',cls:'primary',action:'restock'},{label:'⏰ Remind Later',cls:'secondary',action:'remind'}] },
];

let currentAlertFilter = 'all';
let selectedAlertId = null;

function initAlerts() {
  renderAlertFilters();
  renderAlertList();
  renderAlertDetail();
}

function renderAlertFilters() {
  const container = document.getElementById('alerts-filters');
  if (!container) return;
  const counts = { all: alertsData.length, high: alertsData.filter(a=>a.priority==='high').length, medium: alertsData.filter(a=>a.priority==='medium').length, info: alertsData.filter(a=>a.priority==='info').length };
  const filters = [ {id:'all',label:'All Alerts'}, {id:'high',label:'🔴 Urgent'}, {id:'medium',label:'🟡 Medium'}, {id:'info',label:'🔵 Info'} ];
  container.innerHTML = '';
  filters.forEach(f => {
    const btn = document.createElement('button');
    btn.className = 'alert-filter-btn' + (f.id === currentAlertFilter ? ' active' : '');
    btn.innerHTML = `${f.label}<span class="filter-count">${counts[f.id]}</span>`;
    btn.onclick = () => { currentAlertFilter = f.id; renderAlertFilters(); renderAlertList(); if(selectedAlertId){ const exists = getFilteredAlerts().find(a=>a.id===selectedAlertId); if(!exists){selectedAlertId=null; renderAlertDetail();} } };
    container.appendChild(btn);
  });
}

function getFilteredAlerts() {
  if (currentAlertFilter === 'all') return alertsData;
  return alertsData.filter(a => a.priority === currentAlertFilter);
}

function renderAlertList() {
  const panel = document.getElementById('alerts-list');
  if (!panel) return;
  panel.innerHTML = '';
  const filtered = getFilteredAlerts();
  filtered.forEach(a => {
    const card = document.createElement('div');
    card.className = 'alert-card' + (selectedAlertId === a.id ? ' selected' : '');
    card.onclick = () => { selectedAlertId = a.id; renderAlertList(); renderAlertDetail(); };
    card.innerHTML = `<div class="alert-priority-bar ${a.priority}"></div><div class="alert-card-body"><div class="alert-card-top"><span class="alert-card-icon">${a.icon}</span><span class="alert-card-type ${a.priority}">${a.priority === 'high' ? 'URGENT' : a.priority === 'medium' ? 'MEDIUM' : 'INFO'}</span></div><div class="alert-card-msg">${a.title}</div><div class="alert-card-sub">${a.msg.substring(0,80)}${a.msg.length>80?'…':''}</div><div class="alert-card-time">${a.time}</div></div><div class="alert-card-badge ${a.priority}"></div>`;
    panel.appendChild(card);
  });
}

function renderAlertDetail() {
  const panel = document.getElementById('alerts-detail');
  if (!panel) return;
  if (!selectedAlertId) {
    panel.innerHTML = `<div class="alert-detail-empty"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#4E5463" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><h3>Select an alert</h3><p>Click on any alert to view details and take action.</p></div>`;
    return;
  }
  const a = alertsData.find(x => x.id === selectedAlertId);
  if (!a) return;

  const btns = a.actionBtns.map(b => {
    return `<button class="alert-action-btn ${b.cls}" onclick="event.stopPropagation();handleAlertAction('${b.action}', ${a.id})">${b.label}</button>`;
  }).join('');

  panel.innerHTML = `<div class="alert-detail-card"><div class="alert-detail-top"><div class="alert-detail-emoji ${a.priority}">${a.icon}</div><div><div class="alert-detail-title">${a.title}</div><div class="alert-detail-type ${a.priority}">${a.type.replace('-',' ')} · ${a.priority === 'high' ? 'URGENT' : a.priority === 'medium' ? 'MEDIUM' : 'INFO'}</div></div></div><div class="alert-detail-section"><div class="alert-detail-label">⚠ Problem</div><div class="alert-detail-problem">${a.msg}</div></div><div class="alert-detail-section"><div class="alert-detail-label">📊 Context</div><div class="alert-detail-context">${a.context}</div></div><div class="alert-detail-section"><div class="alert-detail-label">✅ Recommended Action</div><div class="alert-detail-action-text">${a.action}</div></div><div class="alert-detail-actions">${btns}<button class="alert-action-btn ghost" onclick="event.stopPropagation();handleAlertAction('resolve', ${a.id})">✓ Mark Resolved</button></div></div>`;
  
  const card = panel.querySelector('.alert-detail-card');
  if (card) { card.style.animation='none'; card.offsetHeight; card.style.animation=''; }
}

// ═══════════ FUNCTIONAL ACTION HANDLERS ═══════════

function handleAlertAction(action, alertId) {
  const alert = alertsData.find(a => a.id === alertId);
  if (!alert) return;

  switch(action) {
    case 'restock':
      openRestockModal(alert);
      break;
    case 'analytics':
      openAlertAnalytics(alert);
      break;
    case 'discount':
      openDiscountModal(alert);
      break;
    case 'dismiss':
    case 'resolve':
      resolveAlert(alertId);
      break;
    case 'reduce':
      showFeedback('📉 Order quantity reduced by 50% for ' + alert.product, 'success');
      break;
    case 'pause':
      showFeedback('⏸️ Restocking paused for ' + alert.product, 'success');
      break;
    case 'remind':
      showFeedback('⏰ Reminder set for ' + alert.product + ' in 24 hours', 'success');
      break;
  }
}

// ═══════════ RESTOCK MODAL ═══════════
function openRestockModal(alert) {
  removeExistingModal();
  const modal = document.createElement('div');
  modal.id = 'alert-modal-overlay';
  modal.className = 'alert-modal-overlay';
  modal.innerHTML = `
    <div class="alert-modal" onclick="event.stopPropagation()">
      <div class="alert-modal-header">
        <div class="alert-modal-icon">📦</div>
        <div>
          <div class="alert-modal-title">Restock ${alert.product}</div>
          <div class="alert-modal-sub">Current stock: ${alert.stock} units</div>
        </div>
        <button class="alert-modal-close" onclick="closeAlertModal()">✕</button>
      </div>
      <div class="alert-modal-body">
        <div class="alert-modal-field">
          <label class="alert-modal-label">Order Quantity</label>
          <div class="alert-modal-input-wrap">
            <button class="alert-modal-qty-btn" onclick="adjustQty(-10)">−</button>
            <input type="number" class="alert-modal-input" id="restock-qty" value="100" min="1" />
            <button class="alert-modal-qty-btn" onclick="adjustQty(10)">+</button>
          </div>
        </div>
        <div class="alert-modal-field">
          <label class="alert-modal-label">Delivery Priority</label>
          <div class="alert-modal-options">
            <button class="alert-modal-option active" onclick="selectOption(this)">🚀 Express (2 days)</button>
            <button class="alert-modal-option" onclick="selectOption(this)">📦 Standard (5 days)</button>
          </div>
        </div>
        <div class="alert-modal-info">
          <span>💡</span>
          <span>Estimated delivery cost: <strong>$24.00</strong></span>
        </div>
      </div>
      <div class="alert-modal-footer">
        <button class="alert-action-btn ghost" onclick="closeAlertModal()">Cancel</button>
        <button class="alert-action-btn primary" id="confirm-restock-btn" onclick="confirmRestock('${alert.product}')">
          <span id="restock-btn-text">Confirm Restock</span>
          <span class="alert-spinner" id="restock-spinner"></span>
        </button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('visible'));
  modal.onclick = closeAlertModal;
}

function adjustQty(delta) {
  const input = document.getElementById('restock-qty');
  if (!input) return;
  const val = Math.max(1, parseInt(input.value || 0) + delta);
  input.value = val;
}

function selectOption(el) {
  el.parentElement.querySelectorAll('.alert-modal-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
}

function confirmRestock(product) {
  const qty = document.getElementById('restock-qty')?.value || 100;
  const btn = document.getElementById('confirm-restock-btn');
  const text = document.getElementById('restock-btn-text');
  const spinner = document.getElementById('restock-spinner');
  if (btn) btn.disabled = true;
  if (text) text.textContent = 'Processing...';
  if (spinner) spinner.style.display = 'inline-block';
  
  setTimeout(() => {
    closeAlertModal();
    showFeedback(`✅ ${qty} units of ${product} ordered successfully!`, 'success');
  }, 1200);
}

// ═══════════ ANALYTICS VIEW ═══════════
function openAlertAnalytics(alert) {
  // Navigate to analytics section
  if (typeof switchSection === 'function') {
    switchSection('analytics', document.getElementById('nav-analytics'));
    showFeedback(`📊 Viewing analytics for ${alert.product}`, 'info');
  }
}

// ═══════════ DISCOUNT MODAL ═══════════
function openDiscountModal(alert) {
  removeExistingModal();
  const modal = document.createElement('div');
  modal.id = 'alert-modal-overlay';
  modal.className = 'alert-modal-overlay';
  modal.innerHTML = `
    <div class="alert-modal" onclick="event.stopPropagation()">
      <div class="alert-modal-header">
        <div class="alert-modal-icon">💰</div>
        <div>
          <div class="alert-modal-title">Discount ${alert.product}</div>
          <div class="alert-modal-sub">${alert.stock} units in stock</div>
        </div>
        <button class="alert-modal-close" onclick="closeAlertModal()">✕</button>
      </div>
      <div class="alert-modal-body">
        <div class="alert-modal-field">
          <label class="alert-modal-label">Discount Percentage</label>
          <div class="alert-modal-options">
            <button class="alert-modal-option" onclick="selectOption(this)">10%</button>
            <button class="alert-modal-option active" onclick="selectOption(this)">20%</button>
            <button class="alert-modal-option" onclick="selectOption(this)">30%</button>
            <button class="alert-modal-option" onclick="selectOption(this)">40%</button>
          </div>
        </div>
        <div class="alert-modal-field">
          <label class="alert-modal-label">Duration</label>
          <div class="alert-modal-options">
            <button class="alert-modal-option active" onclick="selectOption(this)">3 days</button>
            <button class="alert-modal-option" onclick="selectOption(this)">7 days</button>
            <button class="alert-modal-option" onclick="selectOption(this)">14 days</button>
          </div>
        </div>
        <div class="alert-modal-info">
          <span>💡</span>
          <span>Estimated revenue recovery: <strong>$156.00</strong></span>
        </div>
      </div>
      <div class="alert-modal-footer">
        <button class="alert-action-btn ghost" onclick="closeAlertModal()">Cancel</button>
        <button class="alert-action-btn primary" onclick="confirmDiscount('${alert.product}')">Apply Discount</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  requestAnimationFrame(() => modal.classList.add('visible'));
  modal.onclick = closeAlertModal;
}

function confirmDiscount(product) {
  closeAlertModal();
  showFeedback(`✅ Discount applied to ${product}!`, 'success');
}

// ═══════════ RESOLVE ALERT ═══════════
function resolveAlert(alertId) {
  const alert = alertsData.find(a => a.id === alertId);
  showFeedback(`✓ Alert resolved: ${alert ? alert.product : 'Alert'} marked as handled`, 'success');
}

// ═══════════ UTILITY ═══════════
function removeExistingModal() {
  const existing = document.getElementById('alert-modal-overlay');
  if (existing) existing.remove();
}

function closeAlertModal() {
  const modal = document.getElementById('alert-modal-overlay');
  if (modal) {
    modal.classList.remove('visible');
    setTimeout(() => modal.remove(), 300);
  }
}

// Feedback toast
function showFeedback(message, type) {
  const existing = document.querySelector('.feedback-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `feedback-toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('visible'));
  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
