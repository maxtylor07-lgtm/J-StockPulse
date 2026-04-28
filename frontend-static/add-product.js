// ═══════════════════════════════════════
// ADD PRODUCT — JS
// ═══════════════════════════════════════

let apQuickMode = false;
let apTags = [];
let apUploadedFiles = [];
let apPredictedStock = 120;

// ─── Category-to-Emoji map ───
const categoryEmojis = {
  'Electronics': '💻', 'Fitness': '💪', 'Footwear': '👟',
  'Accessories': '🔌', 'Bags': '🎒', 'Home Office': '💡',
  'Lifestyle': '🍶', 'Food': '🥜', 'Fashion': '👗'
};

// ─── Demand predictions by category ───
const categoryPredictions = {
  'Electronics': { stock: 150, text: 'Recommended stock: <strong>150 units</strong> (electronics demand is rising +18% this quarter)' },
  'Fitness': { stock: 120, text: 'Recommended stock: <strong>120 units</strong> (fitness season approaching, +28% demand expected)' },
  'Footwear': { stock: 80, text: 'Recommended stock: <strong>80 units</strong> (steady demand with seasonal peaks ahead)' },
  'Accessories': { stock: 200, text: 'Recommended stock: <strong>200 units</strong> (high-volume, low-cost — keep surplus)' },
  'Bags': { stock: 45, text: 'Recommended stock: <strong>45 units</strong> (demand declining post-travel season)' },
  'Home Office': { stock: 60, text: 'Recommended stock: <strong>60 units</strong> (stable remote work demand)' },
  'Lifestyle': { stock: 90, text: 'Recommended stock: <strong>90 units</strong> (sustainability trend boosting interest)' },
  'Food': { stock: 180, text: 'Recommended stock: <strong>180 units</strong> (fast-moving, perishable — maintain flow)' },
  'Fashion': { stock: 70, text: 'Recommended stock: <strong>70 units</strong> (seasonal demand, new trends emerging)' },
};

// ─── Generate SKU ───
function generateSKU() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let sku = 'DOS-';
  for (let i = 0; i < 6; i++) sku += chars.charAt(Math.floor(Math.random() * chars.length));
  return sku;
}

// ─── Open / Close Panel ───
function openAddProduct() {
  const overlay = document.getElementById('ap-overlay');
  const panel = document.getElementById('ap-panel');
  const fab = document.getElementById('ap-fab');
  if (!overlay || !panel) return;

  resetAddProductForm();
  overlay.classList.add('visible');
  panel.classList.add('visible');
  if (fab) fab.classList.add('active');
  document.body.style.overflow = 'hidden';

  // Auto-generate SKU
  document.getElementById('ap-sku').value = generateSKU();

  // Focus name field after animation
  setTimeout(() => {
    const nameInput = document.getElementById('ap-name');
    if (nameInput) nameInput.focus();
  }, 450);
}

function closeAddProduct() {
  const overlay = document.getElementById('ap-overlay');
  const panel = document.getElementById('ap-panel');
  const fab = document.getElementById('ap-fab');
  if (!overlay || !panel) return;

  overlay.classList.remove('visible');
  panel.classList.remove('visible');
  if (fab) fab.classList.remove('active');
  document.body.style.overflow = '';
}

// ─── Reset Form ───
function resetAddProductForm() {
  ['ap-name', 'ap-price', 'ap-cost', 'ap-stock', 'ap-threshold', 'ap-supplier', 'ap-expiry'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.value = ''; el.classList.remove('error'); }
  });
  const cat = document.getElementById('ap-category');
  if (cat) cat.value = '';
  const unit = document.getElementById('ap-unit');
  if (unit) unit.value = 'pcs';
  document.getElementById('ap-sku').value = generateSKU();

  // Reset toggles
  const trackToggle = document.getElementById('ap-track-toggle');
  if (trackToggle) trackToggle.classList.add('on');
  const demandToggle = document.getElementById('ap-demand-toggle');
  if (demandToggle) demandToggle.classList.remove('on');
  const predictCard = document.getElementById('ap-predict-card');
  if (predictCard) predictCard.classList.remove('visible');

  // Reset tags
  apTags = [];
  renderTags();

  // Reset uploads
  apUploadedFiles = [];
  const thumbs = document.getElementById('ap-thumbnails');
  if (thumbs) thumbs.innerHTML = '';

  // Reset advanced
  const advTrigger = document.getElementById('ap-adv-trigger');
  const advBody = document.getElementById('ap-adv-body');
  if (advTrigger) advTrigger.classList.remove('open');
  if (advBody) advBody.classList.remove('open');

  // Reset quick mode
  if (apQuickMode) {
    apQuickMode = false;
    const qt = document.getElementById('ap-quick-toggle');
    if (qt) qt.classList.remove('on');
    applyQuickMode();
  }

  // Reset buttons
  updateSaveButtons();

  // Re-trigger section animations
  document.querySelectorAll('.ap-section').forEach(sec => {
    sec.style.animation = 'none';
    sec.offsetHeight;
    sec.style.animation = '';
  });
}

// ─── Quick Mode ───
function toggleQuickMode() {
  apQuickMode = !apQuickMode;
  const toggle = document.getElementById('ap-quick-toggle');
  if (toggle) toggle.classList.toggle('on', apQuickMode);
  applyQuickMode();
}

function applyQuickMode() {
  // In quick mode: hide .ap-advanced-field and .ap-full-field sections (except basic & inventory stock)
  const advancedFields = document.querySelectorAll('.ap-advanced-field');
  const fullSections = document.querySelectorAll('.ap-full-field');
  advancedFields.forEach(el => {
    el.style.display = apQuickMode ? 'none' : '';
  });
  fullSections.forEach(el => {
    el.style.display = apQuickMode ? 'none' : '';
  });
}

// ─── Demand Prediction ───
function toggleDemandPredict() {
  const toggle = document.getElementById('ap-demand-toggle');
  const card = document.getElementById('ap-predict-card');
  if (!toggle || !card) return;
  toggle.classList.toggle('on');
  const isOn = toggle.classList.contains('on');

  if (isOn) {
    updatePrediction();
    card.classList.add('visible');
    // Re-trigger animation
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = '';
  } else {
    card.classList.remove('visible');
  }
}

function updatePrediction() {
  const category = document.getElementById('ap-category')?.value;
  const predictText = document.getElementById('ap-predict-text');
  if (!predictText) return;

  if (category && categoryPredictions[category]) {
    const pred = categoryPredictions[category];
    apPredictedStock = pred.stock;
    predictText.innerHTML = pred.text;
  } else {
    apPredictedStock = 120;
    predictText.innerHTML = 'Recommended stock: <strong>120 units</strong> (based on average demand patterns)';
  }
}

function applyPrediction() {
  const stockInput = document.getElementById('ap-stock');
  if (stockInput) {
    stockInput.value = apPredictedStock;
    // Trigger glow effect
    stockInput.focus();
    stockInput.style.borderColor = 'rgba(0,201,167,.5)';
    stockInput.style.boxShadow = '0 0 0 3px rgba(0,201,167,.15), 0 0 20px rgba(0,201,167,.1)';
    setTimeout(() => {
      stockInput.style.borderColor = '';
      stockInput.style.boxShadow = '';
    }, 1500);
    updateSaveButtons();
  }
}

// ─── Tags ───
function addTag(tag) {
  tag = tag.trim().toLowerCase();
  if (!tag || apTags.includes(tag)) return;
  apTags.push(tag);
  renderTags();
}

function removeTag(tag) {
  apTags = apTags.filter(t => t !== tag);
  renderTags();
}

function renderTags() {
  const wrap = document.getElementById('ap-tags-wrap');
  const input = document.getElementById('ap-tags-input');
  if (!wrap || !input) return;

  // Remove existing tags (keep input)
  wrap.querySelectorAll('.ap-tag').forEach(t => t.remove());

  apTags.forEach(tag => {
    const el = document.createElement('span');
    el.className = 'ap-tag';
    el.innerHTML = `${tag}<button class="ap-tag-remove" onclick="event.stopPropagation();removeTag('${tag}')">✕</button>`;
    wrap.insertBefore(el, input);
  });
}

// ─── File Upload ───
function setupUploadZone() {
  const zone = document.getElementById('ap-upload-zone');
  const fileInput = document.getElementById('ap-file-input');
  if (!zone || !fileInput) return;

  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });
  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
    fileInput.value = ''; // Reset so same file can be re-added
  });
}

function handleFiles(files) {
  const thumbs = document.getElementById('ap-thumbnails');
  if (!thumbs) return;

  Array.from(files).forEach((file, i) => {
    if (!file.type.startsWith('image/')) return;
    apUploadedFiles.push(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      const thumb = document.createElement('div');
      thumb.className = 'ap-thumb';
      thumb.style.animationDelay = (i * 80) + 'ms';
      thumb.innerHTML = `<img src="${e.target.result}" alt="${file.name}" /><button class="ap-thumb-remove" onclick="removeThumb(this)">✕</button>`;
      thumbs.appendChild(thumb);
    };
    reader.readAsDataURL(file);
  });
}

function removeThumb(btn) {
  const thumb = btn.parentElement;
  const idx = Array.from(thumb.parentElement.children).indexOf(thumb);
  apUploadedFiles.splice(idx, 1);
  thumb.style.opacity = '0';
  thumb.style.transform = 'scale(.7)';
  setTimeout(() => thumb.remove(), 200);
}

// ─── Advanced Collapse ───
function toggleAdvancedSection() {
  const trigger = document.getElementById('ap-adv-trigger');
  const body = document.getElementById('ap-adv-body');
  if (!trigger || !body) return;
  trigger.classList.toggle('open');
  body.classList.toggle('open');
}

// ─── Validation & Button State ───
function updateSaveButtons() {
  const name = document.getElementById('ap-name')?.value.trim();
  const price = document.getElementById('ap-price')?.value;
  const stock = document.getElementById('ap-stock')?.value;
  const isValid = name && price && stock;

  const saveBtn = document.getElementById('ap-save');
  const saveAnotherBtn = document.getElementById('ap-save-another');
  if (saveBtn) saveBtn.disabled = !isValid;
  if (saveAnotherBtn) saveAnotherBtn.disabled = !isValid;
}

// ─── Save Product ───
function saveProduct(addAnother) {
  const nameInput = document.getElementById('ap-name');
  const name = nameInput?.value.trim();
  if (!name) {
    nameInput?.classList.add('error');
    nameInput?.focus();
    return;
  }

  const category = document.getElementById('ap-category')?.value || 'Uncategorized';
  const price = parseFloat(document.getElementById('ap-price')?.value) || 0;
  const stock = parseInt(document.getElementById('ap-stock')?.value) || 0;
  const threshold = parseInt(document.getElementById('ap-threshold')?.value) || 10;

  // Determine stock level
  let stockLevel = 'healthy';
  if (stock <= threshold) stockLevel = 'critical';
  else if (stock <= threshold * 3) stockLevel = 'low';

  // Saving animation
  const saveBtn = document.getElementById(addAnother ? 'ap-save-another' : 'ap-save');
  if (saveBtn) saveBtn.classList.add('saving');

  // ── Persist to backend (Firebase Firestore) ──
  const runSave = async () => {
    let savedId = null;
    try {
      if (window.api && window.Auth && window.Auth.isLoggedIn()) {
        const data = await window.api('/api/products/add', {
          method: 'POST',
          body: { name, category, price, quantity: stock, supplier: '', dailySales: 0, image: '' },
        });
        savedId = data && data.id;
      }
    } catch (err) {
      console.error('[add-product] API save failed:', err.message);
      if (typeof showErrorToast === 'function') showErrorToast('Could not save to server: ' + err.message);
      else alert('Could not save to server: ' + err.message);
    }

    const emoji = categoryEmojis[category] || '📦';
    const newProduct = {
      id: savedId || (inventoryProducts.length + 1 + Date.now()),
      name,
      emoji,
      category,
      stock,
      stockLevel,
      demand: 'medium',
      demandWord: 'Medium',
      trend: 'stable',
      price: [Math.round(price * 0.7), price],
      insight: `Newly added product. Demand data will be available after initial sales period.`,
      points: [30, 32, 35, 33, 36, 38, 35, 37, 40, 38, 41, 40],
    };

    inventoryProducts.unshift(newProduct);
    updateDashboardCounts();
    if (window.refreshLiveDashboard) window.refreshLiveDashboard();
    if (saveBtn) saveBtn.classList.remove('saving');

    if (addAnother) {
      showInlineSuccess(name);
      resetAddProductForm();
    } else {
      closeAddProduct();
      showSuccessAnimation(name);
    }

    setTimeout(() => {
      if (document.getElementById('section-inventory')?.classList.contains('active')) {
        if (invFocusedMode) exitFocusedMode();
        renderInventoryGrid();
        setTimeout(() => {
          const firstCard = document.querySelector('.inv-card');
          if (firstCard) firstCard.classList.add('just-added');
          setTimeout(() => {
            if (firstCard) firstCard.classList.remove('just-added');
          }, 2500);
        }, 100);
      }
    }, addAnother ? 0 : 600);
  };

  setTimeout(runSave, 400);
}

// ─── Success Animation ───
function showSuccessAnimation(productName) {
  const overlay = document.getElementById('ap-success-overlay');
  const sub = document.getElementById('ap-success-sub');
  if (!overlay) return;

  if (sub) sub.textContent = `"${productName}" has been added to your inventory.`;

  overlay.classList.add('visible');

  // Re-trigger check animation
  const svg = overlay.querySelector('.ap-success-check svg');
  if (svg) { svg.style.animation = 'none'; svg.offsetHeight; svg.style.animation = ''; }
  const ring = overlay.querySelector('.ap-success-check');
  if (ring) { ring.style.animation = 'none'; ring.offsetHeight; ring.style.animation = ''; }
  const card = overlay.querySelector('.ap-success-card');
  if (card) { card.style.animation = 'none'; card.offsetHeight; card.style.animation = ''; }

  setTimeout(() => {
    overlay.classList.remove('visible');
    // Switch to inventory to show the new product
    if (!document.getElementById('section-inventory')?.classList.contains('active')) {
      const navEl = document.getElementById('nav-inventory');
      if (typeof switchSection === 'function') switchSection('inventory', navEl);
    }
  }, 2200);
}

function showInlineSuccess(name) {
  const body = document.getElementById('ap-body');
  if (!body) return;

  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed; top: 80px; right: 40px; z-index: 1200;
    background: rgba(0,201,167,.15); border: 1px solid rgba(0,201,167,.3);
    border-radius: 12px; padding: 14px 20px; display: flex; align-items: center; gap: 10px;
    color: #00C9A7; font-size: 13px; font-weight: 600; font-family: 'Inter', sans-serif;
    backdrop-filter: blur(12px); animation: apSecIn 300ms var(--ease) both;
    box-shadow: 0 8px 32px rgba(0,201,167,.15);
  `;
  toast.innerHTML = `✅ "${name}" saved!`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    toast.style.transition = 'all 300ms';
    setTimeout(() => toast.remove(), 300);
  }, 1800);
}

// ─── Dashboard Integration ───
function updateDashboardCounts() {
  // Update total products stat
  const totalEl = document.querySelector('#stat-total-products .stat-value');
  if (totalEl) {
    const current = parseInt(totalEl.textContent) || 1248;
    if (typeof animateValue === 'function') {
      animateValue(totalEl, current, current + 1, 600);
    } else {
      totalEl.textContent = current + 1;
    }
  }

  // Update low stock count if applicable
  const lowStockEl = document.querySelector('#stat-low-stock .stat-value');
  if (lowStockEl) {
    const current = parseInt(lowStockEl.textContent) || 23;
    // Check if newly added product is low stock
    const latestProduct = inventoryProducts[0];
    if (latestProduct && (latestProduct.stockLevel === 'low' || latestProduct.stockLevel === 'critical')) {
      if (typeof animateValue === 'function') {
        animateValue(lowStockEl, current, current + 1, 600);
      }
    }
  }
}

// ─── Init Event Listeners ───
function initAddProduct() {
  // Input validation listeners
  ['ap-name', 'ap-price', 'ap-stock'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        el.classList.remove('error');
        updateSaveButtons();
      });
    }
  });

  // Category change -> update prediction
  const catSelect = document.getElementById('ap-category');
  if (catSelect) {
    catSelect.addEventListener('change', () => {
      const demandToggle = document.getElementById('ap-demand-toggle');
      if (demandToggle?.classList.contains('on')) {
        updatePrediction();
      }
    });
  }

  // Tags input
  const tagsInput = document.getElementById('ap-tags-input');
  if (tagsInput) {
    tagsInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addTag(tagsInput.value);
        tagsInput.value = '';
      }
      if (e.key === 'Backspace' && !tagsInput.value && apTags.length) {
        removeTag(apTags[apTags.length - 1]);
      }
    });
  }

  // Upload zone
  setupUploadZone();

  // Overlay click to close
  const overlay = document.getElementById('ap-overlay');
  if (overlay) {
    overlay.addEventListener('click', closeAddProduct);
  }

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const panel = document.getElementById('ap-panel');
      if (panel?.classList.contains('visible')) closeAddProduct();
    }
  });

  // Wire up existing "+ Add Product" button in inventory topbar
  const invAddBtn = document.getElementById('inv-add-btn');
  if (invAddBtn) {
    invAddBtn.onclick = (e) => {
      e.preventDefault();
      openAddProduct();
    };
  }
}

// Run on load
window.addEventListener('load', () => {
  setTimeout(initAddProduct, 150);
});
