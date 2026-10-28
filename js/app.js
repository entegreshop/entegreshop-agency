/**
 * ENTEGRE SHOP - Digital Growth & E-Commerce Platform Engine
 * Inspired by Qukasoft UX: Live countdown timer, interactive tabs, FAQ accordions,
 * Medusa v2 cart engine, promo codes, and checkout pipeline.
 */

// Package Catalog Definition (Medusa v2 Compatible)
const PACKAGES_CATALOG = {
  // 1. Digital Advertising Packages
  'ad-meta': {
    id: 'ad-meta',
    title: 'Meta Ads (Instagram & Facebook) Danışmanlığı',
    category: 'Dijital Reklam',
    monthlyPrice: 12500,
    quarterlyPrice: 31875, // 15% discount
    badge: 'CAPI & Advantage+ Entegre',
    desc: 'Yüksek dönüşümlü e-ticaret satış hunisi, Meta CAPI Server-Side dönüşüm kurulumu ve haftalık A/B kreatif testleri.'
  },
  'ad-google': {
    id: 'ad-google',
    title: 'Google Ads (Performance Max & Search) Danışmanlığı',
    category: 'Dijital Reklam',
    monthlyPrice: 12500,
    quarterlyPrice: 31875,
    badge: 'Yüksek ROAS Hedefli',
    desc: 'Performance Max, Google Merchant Alışveriş (Shopping), dinamik yeniden pazarlama ve negatif bütçe filtresi.'
  },
  'ad-tiktok': {
    id: 'ad-tiktok',
    title: 'TikTok Ads & Viral Video Reklam Danışmanlığı',
    category: 'Dijital Reklam',
    monthlyPrice: 10000,
    quarterlyPrice: 25500,
    badge: 'Gen-Z & Viral Büyüme',
    desc: 'Spark Ads, trend video kurgu rehberliği, TikTok Pixel e-ticaret huni kurulumu ve katalog satışları.'
  },
  'ad-openai-full': {
    id: 'ad-openai-full',
    title: 'OpenAI Destekli Çok Kanallı Reklam Masası (Full-Stack)',
    category: 'Dijital Reklam',
    monthlyPrice: 24500,
    quarterlyPrice: 62475,
    badge: 'OpenAI Robot & Büyüme Masası 🤖',
    desc: 'Meta + Google + TikTok reklamlarının tek merkezden, OpenAI GPT-4o dinamik metin ve akıllı bütçe dağıtım robotuyla yönetimi.'
  },

  // 2. Corporate Web Package
  'web-corporate-onepage': {
    id: 'web-corporate-onepage',
    title: 'OnePage Modern Kurumsal Web Sitesi Paketi',
    category: 'Kurumsal Web',
    oneTimePrice: 8500,
    badge: 'Hızlı Kurulum & < 0.8s Hız',
    desc: 'Tek sayfa akışkan kurumsal web sitesi, %100 mobil uyumlu, SEO optimize altyapı, WhatsApp & form entegrasyonu, 1 yıl hosting dahil.'
  },
  'web-corporate-pro': {
    id: 'web-corporate-pro',
    title: 'Çok Sayfalı & Dinamik Kurumsal Web Paketi',
    category: 'Kurumsal Web',
    oneTimePrice: 18500,
    badge: 'Çok Sayfa & Özel CMS',
    desc: 'Hakkımızda, Hizmetler, Projeler, İletişim sayfaları, özel CMS içerik/blog yönetim paneli, kurumsal e-posta ve 1 yıl hosting.'
  },

  // 3. E-Commerce Packages
  'ecom-onepage': {
    id: 'ecom-onepage',
    title: 'OnePage E-Ticaret Paketi (Tek Ürün / Viral Satış)',
    category: 'E-Ticaret',
    oneTimePrice: 14500,
    badge: 'Tek Ürün Satış Hunisi',
    desc: 'Tek ürün veya özel koleksiyon satışı için optimize edilmiş, tek tıkla ödeme (Express Checkout) destekli Entegre AI Studio altyapısı.'
  },
  'ecom-standard': {
    id: 'ecom-standard',
    title: 'Standart Çoklu Ürün E-Ticaret Paketi',
    category: 'E-Ticaret',
    oneTimePrice: 24500,
    badge: 'Entegre AI Studio Çekirdek',
    desc: '1.000 ürüne kadar varyant yönetimi, iyzico/PayTR sanal pos entegrasyonu, kargo takip modülü ve yönetim paneli.'
  },
  'ecom-professional': {
    id: 'ecom-professional',
    title: 'Profesyonel Çoklu Ürün E-Ticaret Paketi',
    category: 'E-Ticaret',
    oneTimePrice: 38500,
    badge: 'Next.js 14 App Router + Entegre AI Studio',
    desc: 'Next.js 14 ultra hızlı Storefront, terk edilmiş sepet kurtarma botu, Meta CAPI & GA4 data layer tam entegrasyonu.'
  },
  'ecom-premium': {
    id: 'ecom-premium',
    title: 'Premium E-Ticaret Paketi (Global & B2B Entegre)',
    category: 'E-Ticaret',
    oneTimePrice: 58500,
    badge: '🌟 En Popüler / Önerilen',
    desc: 'Çoklu para birimi ve çoklu dil (e-ihracat), B2B bayi fiyatlandırma modülü, OpenAI ürün tavsiye motoru ve 7/24 VIP destek.'
  }
};

// Application State
let currentBillingCycle = 'monthly'; // 'monthly' | 'quarterly'
let currentPricingTab = 'all'; // 'all' | 'ads' | 'ecom' | 'web'
let cart = [];
let appliedDiscountPercent = 0;

document.addEventListener('DOMContentLoaded', () => {
  initCountdownTimer();
  loadCartFromStorage();
  initCartDrawer();
  initBillingToggle();
  initPricingTabs();
  initFaqAccordion();
  initAddToCartButtons();
  initDirectBuyButtons();
  initCheckoutModal();
  initLeadForm();
  initCallbackTriggers();
  updateCartBadge();
  initTracking();
});

/* -------------------------------------------------------------
 * 1. Live Countdown Timer (Qukasoft Signature Top Bar)
 * ------------------------------------------------------------- */
function initCountdownTimer() {
  // Set target date 6 days, 18 hours from now
  const savedEndTime = localStorage.getItem('entegre_promo_endtime');
  let endTime = savedEndTime ? parseInt(savedEndTime, 10) : 0;

  if (!endTime || endTime < Date.now()) {
    endTime = Date.now() + (6 * 24 * 3600 + 18 * 3600 + 45 * 60) * 1000;
    localStorage.setItem('entegre_promo_endtime', endTime.toString());
  }

  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minutesEl = document.getElementById('timer-minutes');
  const secondsEl = document.getElementById('timer-seconds');

  function updateTimer() {
    const now = Date.now();
    const diff = Math.max(0, endTime - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/* -------------------------------------------------------------
 * 2. FAQ Accordion (Qukasoft 2-Column Collapsible)
 * ------------------------------------------------------------- */
function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-accordion-item');
  items.forEach(item => {
    const header = item.querySelector('.faq-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close other accordions in the same column
      const parentCol = item.closest('.faq-col');
      if (parentCol) {
        parentCol.querySelectorAll('.faq-accordion-item').forEach(other => {
          if (other !== item) other.classList.remove('active');
        });
      }
      item.classList.toggle('active', !isActive);
    });
  });
}

/* -------------------------------------------------------------
 * 3. Pricing Tab Filter (All | Reklam | E-Ticaret | Kurumsal)
 * Each tab has its own dedicated URL hash:
 * - #tum-paketler
 * - #e-ticaret-paketleri
 * - #kurumsal-web
 * - #dijital-reklam
 * ------------------------------------------------------------- */
const PRICING_TAB_HASH_MAP = {
  'all': '#tum-paketler',
  'ecom': '#e-ticaret-paketleri',
  'web': '#kurumsal-web',
  'ads': '#dijital-reklam'
};

const HASH_TO_PRICING_TAB = {
  '#tum-paketler': 'all',
  '#paketler': 'all',
  '#paketler-fiyatlar': 'all',
  '#fiyatlar': 'all',
  '#e-ticaret-paketleri': 'ecom',
  '#e-ticaret': 'ecom',
  '#eticaret': 'ecom',
  '#kurumsal-web': 'web',
  '#kurumsal-web-paketleri': 'web',
  '#kurumsal': 'web',
  '#dijital-reklam': 'ads',
  '#dijital-reklam-danismanligi': 'ads',
  '#reklam': 'ads'
};

window.setPricingTab = function(targetCategory, updateUrl = true) {
  currentPricingTab = targetCategory;

  const tabBtns = document.querySelectorAll('.pricing-tab-btn');
  const cards = document.querySelectorAll('.pricing-card-item');
  const billingWrapper = document.getElementById('ad-billing-toggle-wrapper');

  // Update button styling
  tabBtns.forEach(b => {
    const tabKey = b.getAttribute('data-tab');
    if (tabKey === targetCategory) {
      b.classList.add('active', 'bg-blue-600', 'text-white', 'shadow-md');
      b.classList.remove('bg-white', 'text-slate-600', 'hover:bg-slate-50', 'border-slate-200');
      b.style.setProperty('background-color', '#2563eb', 'important');
      b.style.setProperty('color', '#ffffff', 'important');
      b.style.setProperty('border-color', '#2563eb', 'important');
    } else {
      b.classList.remove('active', 'bg-blue-600', 'text-white', 'shadow-md');
      b.classList.add('bg-white', 'text-slate-600', 'hover:bg-slate-50', 'border-slate-200');
      b.style.setProperty('background-color', '#ffffff', 'important');
      b.style.setProperty('color', '#475569', 'important');
      b.style.setProperty('border-color', '#e2e8f0', 'important');
    }
  });

  // Filter package card items
  cards.forEach(card => {
    const cat = card.getAttribute('data-category');
    if (targetCategory === 'all' || cat === targetCategory) {
      card.classList.remove('hidden');
      card.style.setProperty('display', 'flex', 'important');
    } else {
      card.classList.add('hidden');
      card.style.setProperty('display', 'none', 'important');
    }
  });

  // Toggle billing cycle toggle (only relevant for ads and all)
  if (billingWrapper) {
    if (targetCategory === 'ecom' || targetCategory === 'web') {
      billingWrapper.style.setProperty('display', 'none', 'important');
    } else {
      billingWrapper.style.setProperty('display', 'flex', 'important');
    }
  }

  // Update browser URL hash if requested (separate URL per tab)
  if (updateUrl && PRICING_TAB_HASH_MAP[targetCategory]) {
    const targetHash = PRICING_TAB_HASH_MAP[targetCategory];
    if (window.location.hash !== targetHash) {
      history.pushState({ pricingTab: targetCategory }, '', targetHash);
    }
  }
};

function parseHashForPricingTab() {
  const hash = (window.location.hash || '').toLowerCase();
  if (HASH_TO_PRICING_TAB[hash]) {
    return HASH_TO_PRICING_TAB[hash];
  }
  return null;
}

function initPricingTabs() {
  const tabBtns = document.querySelectorAll('.pricing-tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCategory = btn.getAttribute('data-tab');
      window.setPricingTab(targetCategory, true);
    });
  });

  // Listen to browser navigation (back/forward or external hash link)
  window.addEventListener('popstate', () => {
    const cat = parseHashForPricingTab();
    if (cat) {
      window.setPricingTab(cat, false);
    }
  });
  window.addEventListener('hashchange', () => {
    const cat = parseHashForPricingTab();
    if (cat) {
      window.setPricingTab(cat, false);
    }
  });

  // Check URL hash on page load
  const initialFromHash = parseHashForPricingTab();
  if (initialFromHash) {
    window.setPricingTab(initialFromHash, false);
    setTimeout(() => {
      const section = document.getElementById('paketler-fiyatlar');
      if (section) section.scrollIntoView({ behavior: 'smooth' });
    }, 200);
  } else {
    window.setPricingTab(currentPricingTab || 'all', false);
  }
}

/* -------------------------------------------------------------
 * 4. Billing Cycle Toggle (Monthly vs. 3-Months)
 * ------------------------------------------------------------- */
function initBillingToggle() {
  const toggleMonthly = document.getElementById('btn-billing-monthly');
  const toggleQuarterly = document.getElementById('btn-billing-quarterly');

  if (!toggleMonthly || !toggleQuarterly) return;

  toggleMonthly.addEventListener('click', () => {
    currentBillingCycle = 'monthly';
    toggleMonthly.classList.replace('bg-white', 'bg-blue-600');
    toggleMonthly.classList.replace('text-slate-700', 'text-white');
    toggleQuarterly.classList.replace('bg-blue-600', 'bg-white');
    toggleQuarterly.classList.replace('text-white', 'text-slate-700');
    updateAdPricesDisplay();
  });

  toggleQuarterly.addEventListener('click', () => {
    currentBillingCycle = 'quarterly';
    toggleQuarterly.classList.replace('bg-white', 'bg-blue-600');
    toggleQuarterly.classList.replace('text-slate-700', 'text-white');
    toggleMonthly.classList.replace('bg-blue-600', 'bg-white');
    toggleMonthly.classList.replace('text-white', 'text-slate-700');
    updateAdPricesDisplay();
  });
}

function updateAdPricesDisplay() {
  const priceElements = document.querySelectorAll('.ad-pkg-price');
  priceElements.forEach(el => {
    const pkgId = el.getAttribute('data-pkg-id');
    const pkg = PACKAGES_CATALOG[pkgId];
    if (pkg && pkg.monthlyPrice) {
      if (currentBillingCycle === 'quarterly') {
        el.innerHTML = `
          <div class="space-y-0.5">
            <span class="text-xs line-through text-slate-400 font-mono block">${(pkg.monthlyPrice * 3).toLocaleString('tr-TR')} ₺</span>
            <div class="text-3xl font-extrabold text-slate-900 font-mono pkg-amount" style="color: #0f172a !important;">${pkg.quarterlyPrice.toLocaleString('tr-TR')} ₺</div>
            <span class="text-[11px] text-emerald-600 font-bold font-mono block">3 Aylık Toplam (-%15)</span>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div class="space-y-0.5">
            <div class="text-3xl font-extrabold text-slate-900 font-mono pkg-amount" style="color: #0f172a !important;">${pkg.monthlyPrice.toLocaleString('tr-TR')} ₺</div>
            <span class="text-[11px] text-slate-500 font-mono block">/ Ay</span>
          </div>
        `;
      }
    }
  });
}

/* -------------------------------------------------------------
 * 5. Cart Storage & Operations (Medusa v2 Compatible)
 * ------------------------------------------------------------- */
function loadCartFromStorage() {
  try {
    const raw = localStorage.getItem('entegreshop_cart');
    cart = raw ? JSON.parse(raw) : [];
  } catch (e) {
    cart = [];
  }
}

function saveCartToStorage() {
  try {
    localStorage.setItem('entegreshop_cart', JSON.stringify(cart));
  } catch (e) {}
  updateCartBadge();
  renderCartItems();
}

function addToCart(pkgId) {
  const pkg = PACKAGES_CATALOG[pkgId];
  if (!pkg) return;

  let price = 0;
  let billingText = '';

  if (pkg.category === 'Dijital Reklam') {
    if (currentBillingCycle === 'quarterly') {
      price = pkg.quarterlyPrice;
      billingText = '3 Aylık Peşin (-%15 İndirimli)';
    } else {
      price = pkg.monthlyPrice;
      billingText = 'Aylık Düzenli';
    }
  } else {
    price = pkg.oneTimePrice;
    billingText = 'Tek Seferlik Kurulum';
  }

  const existingIdx = cart.findIndex(item => item.id === pkgId && item.billingText === billingText);

  if (existingIdx > -1) {
    cart[existingIdx].qty += 1;
  } else {
    cart.push({
      id: pkg.id,
      title: pkg.title,
      category: pkg.category,
      badge: pkg.badge,
      price: price,
      billingText: billingText,
      qty: 1
    });
  }

  saveCartToStorage();
  openCartDrawer();
  showToast(`"${pkg.title}" sepete eklendi!`);

  // Multi-Channel Tracking: AddToCart
  if (window.trackConversionEvent) {
    window.trackConversionEvent('AddToCart', {
      content_name: pkg.title,
      content_ids: [pkg.id],
      content_type: 'product',
      value: price,
      currency: 'TRY'
    });
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCartToStorage();
}

function clearCart() {
  cart = [];
  appliedDiscountPercent = 0;
  saveCartToStorage();
}

/* -------------------------------------------------------------
 * 6. UI: Cart Drawer & Rendering
 * ------------------------------------------------------------- */
function initCartDrawer() {
  const cartBtn = document.getElementById('cart-open-btn');
  const cartMobileBtn = document.getElementById('cart-mobile-btn');
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  const closeBtn = document.getElementById('cart-close-btn');

  if (cartBtn) cartBtn.addEventListener('click', openCartDrawer);
  if (cartMobileBtn) cartMobileBtn.addEventListener('click', openCartDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeCartDrawer);
  if (backdrop) backdrop.addEventListener('click', closeCartDrawer);

  const promoBtn = document.getElementById('apply-promo-btn');
  if (promoBtn) {
    promoBtn.addEventListener('click', applyPromoCode);
  }
}

function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    renderCartItems();
    drawer.classList.add('open');
    backdrop.classList.add('open');
    document.body.classList.add('overflow-hidden');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const backdrop = document.getElementById('cart-backdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    document.body.classList.remove('overflow-hidden');
  }
}

function updateCartBadge() {
  const count = cart.reduce((acc, item) => acc + item.qty, 0);
  const badges = document.querySelectorAll('.cart-count-badge');
  badges.forEach(b => {
    b.textContent = count;
    b.classList.toggle('hidden', count === 0);
  });
}

function renderCartItems() {
  const container = document.getElementById('cart-items-list');
  const emptyState = document.getElementById('cart-empty-state');
  const footer = document.getElementById('cart-drawer-footer');
  const subtotalEl = document.getElementById('cart-subtotal');
  const vatEl = document.getElementById('cart-vat');
  const discountEl = document.getElementById('cart-discount-row');
  const discountValEl = document.getElementById('cart-discount-val');
  const totalEl = document.getElementById('cart-total');
  const waDirectBtn = document.getElementById('cart-wa-checkout-btn');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('hidden');
    if (footer) footer.classList.add('hidden');
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (footer) footer.classList.remove('hidden');

  container.innerHTML = cart.map((item, index) => `
    <div class="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 relative group">
      <div class="flex items-start justify-between gap-3">
        <div>
          <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
            ${item.category}
          </span>
          <h4 class="text-xs font-bold text-white mt-1.5 leading-snug font-heading">${item.title}</h4>
          <span class="text-[11px] text-slate-400 font-mono block mt-0.5">${item.billingText}</span>
        </div>
        <button onclick="removeFromCart(${index})" class="text-slate-500 hover:text-rose-400 p-1" title="Kaldır">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
        <span class="text-slate-400">Adet: <strong class="text-slate-200">${item.qty}</strong></span>
        <span class="text-sky-400 font-bold">${(item.price * item.qty).toLocaleString('tr-TR')} ₺</span>
      </div>
    </div>
  `).join('');

  // Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  let discountAmount = 0;

  if (appliedDiscountPercent > 0) {
    discountAmount = (rawSubtotal * appliedDiscountPercent) / 100;
    if (discountEl) discountEl.classList.remove('hidden');
    if (discountValEl) discountValEl.textContent = `-${discountAmount.toLocaleString('tr-TR')} ₺ (%${appliedDiscountPercent})`;
  } else {
    if (discountEl) discountEl.classList.add('hidden');
  }

  const subtotalAfterDiscount = rawSubtotal - discountAmount;
  const vat = subtotalAfterDiscount * 0.20; // %20 KDV
  const grandTotal = subtotalAfterDiscount + vat;

  if (subtotalEl) subtotalEl.textContent = `${subtotalAfterDiscount.toLocaleString('tr-TR')} ₺`;
  if (vatEl) vatEl.textContent = `${vat.toLocaleString('tr-TR')} ₺`;
  if (totalEl) totalEl.textContent = `${Math.round(grandTotal).toLocaleString('tr-TR')} ₺`;

  // WhatsApp link
  if (waDirectBtn) {
    const itemsSummary = cart.map(i => `• ${i.title} (${i.qty} adet) - ${i.billingText}: ${(i.price * i.qty).toLocaleString('tr-TR')} ₺`).join('\n');
    const waText = encodeURIComponent(
      `Merhaba Entegre Shop,\nSepetimdeki paketleri satın almak ve danışmanlık sürecini başlatmak istiyorum:\n\n${itemsSummary}\n\nToplam Tutar (KDV Dahil): ${Math.round(grandTotal).toLocaleString('tr-TR')} ₺\nBilgi rica ederim.`
    );
    waDirectBtn.href = `https://wa.me/905000000000?text=${waText}`;
  }
}

function applyPromoCode() {
  const input = document.getElementById('promo-code-input');
  const msg = document.getElementById('promo-msg');
  if (!input) return;

  const code = input.value.trim().toUpperCase();
  if (code === 'ENTEGRE10' || code === 'MEDUSA10' || code === 'QUKA10') {
    appliedDiscountPercent = 10;
    if (msg) {
      msg.textContent = '🎉 %10 Entegre Hoş Geldin İndirimi Uygulandı!';
      msg.className = 'text-xs font-mono text-emerald-400 mt-1 block';
    }
  } else if (code === '') {
    appliedDiscountPercent = 0;
    if (msg) msg.className = 'hidden';
  } else {
    appliedDiscountPercent = 0;
    if (msg) {
      msg.textContent = 'Geçersiz indirim kodu.';
      msg.className = 'text-xs font-mono text-rose-400 mt-1 block';
    }
  }
  renderCartItems();
}

/* -------------------------------------------------------------
 * 7. Buttons & Direct Buy
 * ------------------------------------------------------------- */
function initAddToCartButtons() {
  const addButtons = document.querySelectorAll('.btn-add-to-cart');
  addButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pkgId = btn.getAttribute('data-pkg');
      addToCart(pkgId);
    });
  });
}

function initDirectBuyButtons() {
  const buyButtons = document.querySelectorAll('.btn-direct-buy');
  buyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const pkgId = btn.getAttribute('data-pkg');
      addToCart(pkgId);
      openCheckoutModal();
    });
  });
}

/* -------------------------------------------------------------
 * 8. Checkout Modal & Order Submission
 * ------------------------------------------------------------- */
function initCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  const openBtn = document.getElementById('cart-proceed-checkout-btn');
  const closeBtn = document.getElementById('checkout-modal-close');
  const backdrop = document.getElementById('checkout-modal-backdrop');
  const form = document.getElementById('checkout-order-form');
  const successBox = document.getElementById('checkout-success-box');
  const orderRefEl = document.getElementById('checkout-order-ref');
  const waCompleteBtn = document.getElementById('checkout-wa-complete-btn');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      closeCartDrawer();
      openCheckoutModal();
    });
  }

  function openCheckoutModal() {
    if (!modal) return;
    modal.classList.add('active');
    document.body.classList.add('overflow-hidden');
    updateCheckoutSummary();
  }

  function closeCheckoutModal() {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.classList.remove('overflow-hidden');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeCheckoutModal);
  if (backdrop) backdrop.addEventListener('click', closeCheckoutModal);

  window.openCheckoutModal = openCheckoutModal;

  const frameBackBtn = document.getElementById('paytr-frame-back-btn');
  if (frameBackBtn) {
    frameBackBtn.addEventListener('click', () => {
      document.getElementById('checkout-paytr-frame-box')?.classList.add('hidden');
      form.classList.remove('hidden');
    });
  }

  // Payment method radio style updater
  const methodRadios = document.querySelectorAll('input[name="orderPaymentMethod"]');
  methodRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      document.querySelectorAll('.payment-method-label').forEach(label => {
        label.classList.remove('border-emerald-500/80', 'border-emerald-400');
        label.classList.add('border-slate-800');
      });
      const activeLabel = radio.closest('.payment-method-label');
      if (activeLabel) {
        activeLabel.classList.remove('border-slate-800');
        activeLabel.classList.add('border-emerald-500/80');
      }
      const submitText = document.querySelector('#checkout-submit-btn span');
      if (submitText) {
        submitText.textContent = radio.value === 'paytr' 
          ? 'Siparişi Onayla & Güvenli Ödemeye Geç' 
          : 'Siparişi Onayla & WhatsApp ile Başla';
      }
    });
  });

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('order-name')?.value.trim();
      const company = document.getElementById('order-company')?.value.trim();
      const phone = document.getElementById('order-phone')?.value.trim();
      const email = document.getElementById('order-email')?.value.trim();
      const taxId = document.getElementById('order-tax')?.value.trim() || 'Belirtilmedi';
      const address = document.getElementById('order-address')?.value.trim() || 'Belirtilmedi';
      const notes = document.getElementById('order-notes')?.value.trim() || '';
      const paymentMethod = document.querySelector('input[name="orderPaymentMethod"]:checked')?.value || 'paytr';

      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>İşlem Hazırlanıyor...</span>`;
      }

      const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const discount = (rawSubtotal * appliedDiscountPercent) / 100;
      const subtotalAfterDiscount = rawSubtotal - discount;
      const grandTotal = Math.round(subtotalAfterDiscount * 1.20);

      let orderNumber = 'ENT-ORD-' + Math.floor(100000 + Math.random() * 900000);

      // PAYTR TOKEN CHECKOUT FLOW
      if (paymentMethod === 'paytr') {
        try {
          if (submitBtn) submitBtn.innerHTML = `<span>PayTR 3D Secure Başlatılıyor...</span>`;
          const paytrRes = await fetch('/api/paytr/create-token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: orderNumber,
              customer: { name, company, phone, email, taxId, address, notes },
              items: cart,
              total: grandTotal
            })
          });
          const paytrData = await paytrRes.json();
          if (paytrData.success && paytrData.iframeUrl) {
            // Save pending order record in backend
            fetch('/api/cart/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                customer: { name, company, phone, email, taxId, address, notes },
                items: cart,
                discountPercent: appliedDiscountPercent,
                total: grandTotal,
                orderId: paytrData.orderId,
                paymentStatus: 'PayTR 3D Secure Bekleniyor'
              })
            }).catch(() => {});

            // Multi-channel tracking
            if (window.trackConversionEvent) {
              window.trackConversionEvent('InitiateCheckout', {
                order_id: paytrData.orderId,
                value: grandTotal,
                currency: 'TRY',
                num_items: cart.length
              }, { email, phone, name });
            }

            // Display PayTR secure iFrame
            form.classList.add('hidden');
            const frameBox = document.getElementById('checkout-paytr-frame-box');
            const frameWrapper = document.getElementById('paytr-iframe-wrapper');
            if (frameBox && frameWrapper) {
              frameWrapper.innerHTML = `<iframe src="${paytrData.iframeUrl}" id="paytriframe" frameborder="0" scrolling="no" style="width: 100%; min-height: 580px; border: 0;"></iframe>`;
              frameBox.classList.remove('hidden');
            }
            clearCart();
            return;
          } else {
            console.warn('PayTR token fallback:', paytrData.error);
            alert('Bilgi: ' + (paytrData.error || 'Sanal POS bilgileri tamamlanmadığı için siparişiniz oluşturularak danışman hattına yönlendiriliyorsunuz.'));
          }
        } catch (err) {
          console.warn('PayTR request fallback:', err);
        }
      }

      // STANDARD ORDER / WHATSAPP FALLBACK FLOW
      try {
        const res = await fetch('/api/cart/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customer: { name, company, phone, email, taxId, address, notes },
            items: cart,
            discountPercent: appliedDiscountPercent,
            total: grandTotal
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.orderId) orderNumber = data.orderId;
        }
      } catch (err) {
        console.warn('API fallback active:', err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Siparişi Onayla & Güvenli Ödemeye Geç</span>`;
        }
      }

      if (orderRefEl) orderRefEl.textContent = orderNumber;

      // Multi-Channel Tracking: Purchase
      if (window.trackConversionEvent) {
        window.trackConversionEvent('Purchase', {
          order_id: orderNumber,
          value: grandTotal,
          currency: 'TRY',
          num_items: cart.length,
          contents: cart.map(i => ({ id: i.id, name: i.title, quantity: i.qty, item_price: i.price }))
        }, {
          email: email,
          phone: phone,
          name: name
        });
      }

      if (waCompleteBtn) {
        const waText = encodeURIComponent(
          `Merhaba Entegre Shop,\n${orderNumber} numaralı siparişimi oluşturdum.\nFirma/Yetkili: ${name} (${company || '-'})\nTel: ${phone}\nTutar: ${grandTotal.toLocaleString('tr-TR')} ₺\nÖdeme ve başlangıç adımları için iletişime geçmenizi rica ederim.`
        );
        waCompleteBtn.href = `https://wa.me/905000000000?text=${waText}`;
      }

      form.classList.add('hidden');
      if (successBox) successBox.classList.remove('hidden');
      clearCart();
    });
  }
}

function updateCheckoutSummary() {
  const listEl = document.getElementById('checkout-items-summary');
  const totalEl = document.getElementById('checkout-grand-total');
  if (!listEl) return;

  const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const discount = (rawSubtotal * appliedDiscountPercent) / 100;
  const grandTotal = Math.round((rawSubtotal - discount) * 1.20);

  listEl.innerHTML = cart.map(item => `
    <div class="flex justify-between items-center text-xs py-1 border-b border-slate-800 font-mono">
      <span class="text-slate-300 truncate max-w-[240px]">${item.title} (x${item.qty})</span>
      <span class="text-sky-400 font-bold">${(item.price * item.qty).toLocaleString('tr-TR')} ₺</span>
    </div>
  `).join('');

  if (totalEl) totalEl.textContent = `${grandTotal.toLocaleString('tr-TR')} ₺ (KDV Dahil)`;
}

/* -------------------------------------------------------------
 * 9. Lead / Callback Form
 * ------------------------------------------------------------- */
function initLeadForm() {
  const form = document.getElementById('lead-analysis-form');
  const successBox = document.getElementById('lead-success-box');
  const resetBtn = document.getElementById('lead-reset-btn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('lead-name')?.value.trim();
    const company = document.getElementById('lead-company')?.value.trim();
    const phone = document.getElementById('lead-phone')?.value.trim();
    const website = document.getElementById('lead-website')?.value.trim() || 'Yok';
    const budget = document.getElementById('lead-budget')?.value;
    const interest = document.getElementById('lead-interest')?.value;

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, company, phone, website, budget, interest })
      });

      // Multi-Channel Tracking: Lead
      if (window.trackConversionEvent) {
        window.trackConversionEvent('Lead', {
          content_name: interest || 'Ücretsiz Büyüme Analizi',
          currency: 'TRY',
          value: 500
        }, {
          phone: phone,
          name: name,
          company: company
        });
      }
    } catch (e) {}

    form.classList.add('hidden');
    if (successBox) successBox.classList.remove('hidden');
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      form.classList.remove('hidden');
      if (successBox) successBox.classList.add('hidden');
    });
  }
}

function initCallbackTriggers() {
  const callbackBtns = document.querySelectorAll('.btn-trigger-callback');
  callbackBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const formEl = document.getElementById('ucretsiz-analiz');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          document.getElementById('lead-phone')?.focus();
        }, 500);
      }
    });
  });
}

/* -------------------------------------------------------------
 * 10. Toast Notification Helper
 * ------------------------------------------------------------- */
function showToast(text) {
  let toast = document.getElementById('app-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'fixed bottom-6 left-6 z-50 px-4 py-3 rounded-2xl bg-slate-900 border border-blue-500/50 text-white text-xs font-mono shadow-2xl backdrop-blur-xl flex items-center gap-2 transform translate-y-20 opacity-0 transition-all duration-300';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
    <span>${text}</span>
  `;
  toast.classList.remove('translate-y-20', 'opacity-0');

  setTimeout(() => {
    toast.classList.add('translate-y-20', 'opacity-0');
  }, 2800);
}

/* -------------------------------------------------------------
 * 11. Multi-Channel Tracking Engine (Meta CAPI, GA4, GTM, TikTok)
 * ------------------------------------------------------------- */
let activeTrackingSettings = null;

async function initTracking() {
  try {
    const res = await fetch('/api/settings/tracking');
    const data = await res.json();
    if (!data.success || !data.settings) return;

    activeTrackingSettings = data.settings;
    const { meta, google, tiktok, customScripts } = activeTrackingSettings;

    // 1. Google Tag Manager (GTM)
    if (google?.enabled && google?.gtmId) {
      const gtmScript = document.createElement('script');
      gtmScript.innerHTML = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${google.gtmId}');`;
      document.head.appendChild(gtmScript);

      const noscript = document.createElement('noscript');
      noscript.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${google.gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
      document.body.insertBefore(noscript, document.body.firstChild);
    }

    // 2. Google Analytics 4 (GA4) & Ads
    if (google?.enabled && google?.ga4Id) {
      const gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${google.ga4Id}`;
      document.head.appendChild(gaScript);

      window.dataLayer = window.dataLayer || [];
      window.gtag = function() { window.dataLayer.push(arguments); };
      window.gtag('js', new Date());
      window.gtag('config', google.ga4Id);

      if (google.adsConversionId) {
        window.gtag('config', google.adsConversionId);
      }
    }

    // 3. Meta (Facebook & Instagram) Pixel
    if (meta?.enabled && meta?.pixelId) {
      !(function(f,b,e,v,n,t,s) {
        if(f.fbq) return;
        n=f.fbq=function() { n.callMethod ? n.callMethod.apply(n,arguments) : n.queue.push(arguments); };
        if(!f._fbq) f._fbq=n;
        n.push=n; n.loaded=!0; n.version='2.0';
        n.queue=[];
        t=b.createElement(e); t.async=!0;
        t.src=v;
        s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s);
      })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      fbq('init', meta.pixelId);
      fbq('track', 'PageView');
    }

    // 4. TikTok Pixel
    if (tiktok?.enabled && tiktok?.pixelId) {
      !(function (w, d, t) {
        w.TiktokAnalyticsObject = t;
        var ttq = (w[t] = w[t] || []);
        ttq.methods = [
          "page", "track", "identify", "instances", "debug", "on", "off", "once", "ready", "alias", "group", "enableCookie", "disableCookie"
        ];
        ttq.setAndDefer = function (t, e) {
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        };
        for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
        ttq.load = function (e, n) {
          var r = "https://analytics.tiktok.com/i18n/pixel/events.js";
          ttq._i = ttq._i || {};
          ttq._i[e] = [];
          ttq._i[e]._u = r;
          ttq._t = ttq._t || {};
          ttq._t[e] = +new Date();
          ttq._o = ttq._o || {};
          ttq._o[e] = n || {};
          var o = document.createElement("script");
          o.type = "text/javascript";
          o.async = !0;
          o.src = r + "?sdkid=" + e + "&lib=" + t;
          var a = document.getElementsByTagName("script")[0];
          a.parentNode.insertBefore(o, a);
        };
        ttq.load(tiktok.pixelId);
        ttq.page();
      })(window, document, "ttq");
    }

    // 5. Custom Scripts Injection
    if (customScripts?.headerScripts) {
      const container = document.createElement('div');
      container.innerHTML = customScripts.headerScripts;
      Array.from(container.querySelectorAll('script')).forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        document.head.appendChild(newScript);
      });
    }

    if (customScripts?.footerScripts) {
      const container = document.createElement('div');
      container.innerHTML = customScripts.footerScripts;
      Array.from(container.querySelectorAll('script')).forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        document.body.appendChild(newScript);
      });
    }

  } catch (err) {
    console.error('Tracking init error:', err);
  }
}

window.trackConversionEvent = function(eventName, eventData = {}, userData = {}) {
  const eventId = 'ent-' + Date.now() + '-' + Math.floor(Math.random() * 10000);

  // 1. Meta Pixel (Browser)
  if (window.fbq) {
    try {
      window.fbq('track', eventName, eventData, { eventID: eventId });
    } catch (e) {}
  }

  // 2. Google Analytics 4 & Ads (Browser)
  if (window.gtag) {
    try {
      window.gtag('event', eventName, eventData);
      if (eventName === 'Purchase' && activeTrackingSettings?.google?.adsConversionId && activeTrackingSettings?.google?.adsConversionLabel) {
        window.gtag('event', 'conversion', {
          send_to: `${activeTrackingSettings.google.adsConversionId}/${activeTrackingSettings.google.adsConversionLabel}`,
          value: eventData.value || 0,
          currency: eventData.currency || 'TRY',
          transaction_id: eventData.order_id || eventId
        });
      }
    } catch (e) {}
  }

  // 3. Google Tag Manager DataLayer
  if (window.dataLayer) {
    try {
      window.dataLayer.push({
        event: eventName,
        eventId: eventId,
        ...eventData
      });
    } catch (e) {}
  }

  // 4. TikTok Pixel (Browser)
  if (window.ttq) {
    try {
      window.ttq.track(eventName, eventData, { event_id: eventId });
    } catch (e) {}
  }

  // 5. Server-Side Conversions API (Meta CAPI & TikTok Server Dispatch)
  try {
    fetch('/api/tracking/capi-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: eventName,
        eventId: eventId,
        eventSourceUrl: window.location.href,
        userData: userData,
        customData: eventData
      })
    }).catch(() => {});
  } catch (e) {}
};
