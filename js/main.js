// ============================================================
// main.js — Mustache template renderer + site behaviour
// ============================================================

(function () {
  const page = document.body.dataset.page;
  if (!page || typeof Mustache === 'undefined' || typeof CONTENT === 'undefined') return;

  const ctx = Object.assign(
    {},
    { site: CONTENT.site, nav: CONTENT.nav, footer: CONTENT.footer },
    { pageData: CONTENT[page] || {} }
  );

  // Render every inline Mustache template to its target element
  document.querySelectorAll('script[type="text/x-mustache"]').forEach(function(tpl) {
    var target = document.getElementById(tpl.dataset.target);
    if (target) target.innerHTML = Mustache.render(tpl.innerHTML, ctx);
  });

  // Mark the active nav link
  var current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function(a) {
    if (a.getAttribute('href') === current) a.classList.add('nav-active');
  });

  // Scroll-reactive header
  var header = document.getElementById('site-header');
  if (header) {
    var updateHeader = function() {
      if (window.scrollY > 20) {
        header.style.backgroundColor = 'hsl(40 30% 97% / 0.95)';
        header.style.backdropFilter  = 'blur(4px)';
        header.style.borderBottom    = '1px solid hsl(35 15% 85%)';
      } else {
        header.style.backgroundColor = 'transparent';
        header.style.backdropFilter  = 'none';
        header.style.borderBottom    = 'none';
      }
    };
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // Mobile menu toggle
  var mobileBtn = document.getElementById('mobile-menu-btn');
  var mobileMenu = document.getElementById('mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }
})();

// ============================================================
// CART LOGIC
// ============================================================
const CartState = {
  
  items: JSON.parse(localStorage.getItem('onemore_cart') || '[]'),
  
  _patchPrices: function() {
    let changed = false;
    this.items.forEach(item => {
      if (!item.price && typeof CONTENT !== 'undefined') {
        const prod = CONTENT.shop.products.find(p => p.id === item.id);
        if (prod && prod.price) {
          item.price = prod.price;
          changed = true;
        }
      }
    });
    if (changed) this.save();
  },

  
  save: function() {
    localStorage.setItem('onemore_cart', JSON.stringify(this.items));
    this.updateUI();
  },
  
  add: function(id, name, price, img) {
    this.items.push({ id, name, price, img });
    this.save();
    window.openCartDrawer();
  },
  
  remove: function(index) {
    this.items.splice(index, 1);
    this.save();
  },
  
  total: function() {
    return this.items.reduce((sum, item) => {
      const p = parseFloat(item.price.replace(/[^0-9.-]+/g,""));
      return sum + (isNaN(p) ? 0 : p);
    }, 0);
  },
  
  updateUI: function() {
    const countElements = document.querySelectorAll('.cart-count');
    
    const totalNumToCart = this.total();
    const formattedTotalToCart = '$' + totalNumToCart.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    countElements.forEach(el => {
      el.textContent = this.items.length + (this.items.length > 0 ? ' — ' + formattedTotalToCart : '');
    });

    
    const container = document.getElementById('cart-items-container');
    const subtotalEl = document.getElementById('cart-subtotal');
    
    if (container) {
      if (this.items.length === 0) {
        container.innerHTML = '<p class="text-muted-foreground text-center mt-6">your cart is empty.</p>';
        subtotalEl.textContent = '$0.00';
      } else {
        container.innerHTML = this.items.map((item, i) => `
          <div class="cart-item">
            <img src="${item.img}" class="cart-item-img" alt="${item.name}" />
            <div class="cart-item-details">
              <p class="cart-item-title">${item.name}</p>
              <p class="cart-item-price">${item.price}</p>
              <button class="cart-remove-btn" onclick="CartState.remove(${i})">remove</button>
            </div>
          </div>
        `).join('');
        
        const totalNum = this.total();
        subtotalEl.textContent = '$' + totalNum.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
      }
    }
    
    const totalNum = this.total();
    document.dispatchEvent(new CustomEvent('cart-loaded', { 
      detail: { 
        items: this.items, 
        totalFormatted: '$' + totalNum.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})
      } 
    }));
  }
};

window.addToCart = function(id, name, price, img) {
  CartState.add(id, name, price, img);
};

function initCartDOM() {
  if (document.getElementById('cart-drawer')) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  overlay.id = 'cart-overlay';
  
  const drawer = document.createElement('div');
  drawer.className = 'cart-drawer';
  drawer.id = 'cart-drawer';
  
  drawer.innerHTML = `
    <div class="cart-header">
      <h2 class="font-serif text-2xl text-foreground">your cart</h2>
      <button class="cart-close-btn text-2xl text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer">&times;</button>
    </div>
    <div class="cart-body" id="cart-items-container">
    </div>
    <div class="cart-footer">
      <div class="flex justify-between items-center mb-4">
        <span class="font-medium text-lg">subtotal</span>
        <span class="font-medium text-lg" id="cart-subtotal">$0.00</span>
      </div>
      <a href="checkout.html" class="btn-primary" style="width:100%; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box;">checkout</a>
    </div>
  `;
  
  document.body.appendChild(overlay);
  document.body.appendChild(drawer);
  
  window.openCartDrawer = function() {
    overlay.classList.add('open');
    drawer.classList.add('open');
  };
  
  window.closeCartDrawer = function() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
  };
  
  overlay.addEventListener('click', window.closeCartDrawer);
  drawer.querySelector('.cart-close-btn').addEventListener('click', window.closeCartDrawer);
  
  setTimeout(() => {
    document.querySelectorAll('.cart-btn-desktop, .cart-btn-mobile').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        window.openCartDrawer();
      });
    });
    CartState.updateUI();
  }, 100);
}

function initMarketerBar() {
  if (document.getElementById('marketer-admin-bar')) return;
  
  const bar = document.createElement('div');
  bar.id = 'marketer-admin-bar';
  bar.style.cssText = `
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    background: #1a1a1a;
    color: #ffffff;
    z-index: 9999;
    padding: 12px 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-sans, 'DM Sans', sans-serif);
    font-size: 13px;
    border-top: 2px solid #8c73ff;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
  `;
  
  bar.innerHTML = `
    <div style="display:flex; align-items:center; gap: 12px;">
      <span style="background: #8c73ff; color: white; width: 24px; height: 24px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; font-size: 12px;">M</span>
      <strong style="letter-spacing: 0.05em; text-transform: uppercase;">Marketer Admin</strong>
      <span style="opacity: 0.5;">|</span>
      <span style="opacity: 0.8;">Data Pipeline Connected</span>
    </div>
    <div style="display:flex; gap: 10px;">
      <a href="/audience-profiler.html" style="color: white; text-decoration: none; padding: 6px 14px; background: rgba(255,255,255,0.1); border-radius: 4px; transition: background 0.2s; font-weight: 500;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">Step 1: Audience Profiler</a>
      <a href="/campaign-generator.html" style="color: white; text-decoration: none; padding: 6px 14px; background: #8c73ff; border-radius: 4px; transition: opacity 0.2s; font-weight: 500;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Step 2: Campaign Engine</a>
    </div>
  `;
  
  document.body.appendChild(bar);
  
  // Add padding to body so footer content isn't hidden behind the bar
  document.body.style.paddingBottom = '50px';
}

document.addEventListener('DOMContentLoaded', () => {
  CartState._patchPrices();
  setTimeout(initCartDOM, 50);
  setTimeout(initMarketerBar, 100);
});
