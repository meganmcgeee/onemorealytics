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

document.addEventListener('DOMContentLoaded', () => {
  CartState._patchPrices();
  setTimeout(initCartDOM, 50);
});
