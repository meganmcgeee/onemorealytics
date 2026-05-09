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
  var closeMobileMenu = document.getElementById('close-mobile-menu');
  if (mobileBtn && mobileMenu) {
    mobileBtn.addEventListener('click', function() {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }
  if (closeMobileMenu && mobileMenu) {
    closeMobileMenu.addEventListener('click', function() {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
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
    
    // GTM DataLayer Push
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'add_to_cart',
      ecommerce: {
        items: [{ item_id: id, item_name: name, price: price }]
      }
    });

    window.openCartDrawer();
  },
  
  remove: function(index) {
    const item = this.items[index];
    
    // GTM DataLayer Push
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'remove_from_cart',
      ecommerce: {
        items: [{ item_id: item.id, item_name: item.name, price: item.price }]
      }
    });

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
      <a href="checkout.html" class="btn-primary" style="width:100%; display:inline-flex; align-items:center; justify-content:center; box-sizing:border-box;" onclick="window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: 'begin_checkout', ecommerce: { value: CartState.total(), items: CartState.items.map(i => ({ item_id: i.id, item_name: i.name, price: i.price })) } });">checkout</a>
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
    padding: 8px 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-sans, 'DM Sans', sans-serif);
    font-size: 12px;
    border-top: 2px solid #8c73ff;
    box-shadow: 0 -4px 12px rgba(0,0,0,0.15);
  `;
  
  bar.innerHTML = `
    <div style="display:flex; align-items:center; gap: 8px;">
      <span style="background: #8c73ff; color: white; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; border-radius: 50%; font-weight: bold; font-size: 10px;">M</span>
      <strong style="letter-spacing: 0.05em; text-transform: uppercase;">Admin</strong>
    </div>
    <div style="display:flex; gap: 8px;">
      <a href="/audience-profiler.html" style="color: white; text-decoration: none; padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 4px; transition: background 0.2s; font-weight: 500;" onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">Profiler</a>
      <a href="/campaign-generator.html" style="color: white; text-decoration: none; padding: 4px 10px; background: #8c73ff; border-radius: 4px; transition: opacity 0.2s; font-weight: 500;" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">Campaigns</a>
    </div>
  `;
  document.body.appendChild(bar);
  
  // Add padding to body so footer content isn't hidden behind the bar
  document.body.style.paddingBottom = '50px';
}

/* ── ONBOARDING MODAL ────────────────────────────────────────────── */
function initOnboardingModal() {
  if (sessionStorage.getItem('onboarding_seen')) return;
  
  const overlay = document.createElement('div');
  overlay.className = 'onboarding-overlay';
  
  overlay.innerHTML = `
    <div class="onboarding-modal">
      <button class="onboarding-close" aria-label="Close">✕</button>
      
      <!-- Step 1 -->
      <div class="onboarding-step active" data-step="0">
        <p class="eyebrow mb-2">Welcome to One More</p>
        <h3 class="font-serif text-2xl md:text-3xl text-foreground mb-4">A Premium Ecosystem</h3>
        <p class="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
          We've completely rebuilt the storefront architecture. It's now lightning-fast, fully SEO optimized, and features buttery-smooth animations for a true luxury experience.
        </p>
        <button class="btn-primary w-full next-step-btn">Next: Full Product Line</button>
      </div>

      <!-- Step 2 -->
      <div class="onboarding-step" data-step="1">
        <p class="eyebrow mb-2">Expanded Catalog</p>
        <h3 class="font-serif text-2xl md:text-3xl text-foreground mb-4">Dedicated PDPs</h3>
        <p class="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
          The single landing page is gone. We've built out dedicated, SEO-friendly Product Detail Pages for the Mattress, Sheets, Pillows, and Bed Frame to enable highly targeted ad routing.
        </p>
        <button class="btn-primary w-full next-step-btn">Next: Marketing Tools</button>
      </div>

      <!-- Step 3 -->
      <div class="onboarding-step" data-step="2">
        <p class="eyebrow mb-2">The Back-End</p>
        <h3 class="font-serif text-2xl md:text-3xl text-foreground mb-4">Marketing Powerhouse</h3>
        <p class="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
          Meet your new tools: The <strong>Audience Profiler</strong> synthesizes precise customer personas, and the <strong>Campaign Generator</strong> instantly outputs multi-channel ad copy based on those personas.
        </p>
        <button class="btn-primary w-full next-step-btn">Next: Mobile Ecosystem</button>
      </div>

      <!-- Step 4 -->
      <div class="onboarding-step" data-step="3">
        <p class="eyebrow mb-2">Post-Purchase</p>
        <h3 class="font-serif text-2xl md:text-3xl text-foreground mb-4">iOS Sleep Tracker</h3>
        <p class="text-sm md:text-base text-muted-foreground leading-relaxed mb-8">
          To build long-term retention, we initiated development of a companion <strong>iOS Sleep Tracker</strong> app. It allows users to log their habits and sync sleep data, turning a one-time mattress purchase into a daily digital touchpoint.
        </p>
        <button class="btn-primary w-full close-onboarding-btn">Explore The Site</button>
      </div>

      <div class="onboarding-progress">
        <div class="onboarding-dot active" data-dot="0"></div>
        <div class="onboarding-dot" data-dot="1"></div>
        <div class="onboarding-dot" data-dot="2"></div>
        <div class="onboarding-dot" data-dot="3"></div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  const steps = overlay.querySelectorAll('.onboarding-step');
  const dots = overlay.querySelectorAll('.onboarding-dot');
  let currentStep = 0;

  function showStep(index) {
    steps.forEach((s, i) => s.classList.toggle('active', i === index));
    dots.forEach((d, i) => d.classList.toggle('active', i === index));
  }

  overlay.querySelectorAll('.next-step-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  const closeBtn = overlay.querySelector('.onboarding-close');
  const closeCTA = overlay.querySelector('.close-onboarding-btn');
  
  const closeModal = () => {
    overlay.classList.remove('active');
    sessionStorage.setItem('onboarding_seen', 'true');
    setTimeout(() => overlay.remove(), 500);
  };

  closeBtn.addEventListener('click', closeModal);
  closeCTA.addEventListener('click', closeModal);

  setTimeout(() => {
    overlay.classList.add('active');
  }, 600);
}

/* ── VARIANT SELECTORS ────────────────────────────────────────────── */
function initVariantSelectors() {
  const modelRadios = document.querySelectorAll('input[name="model"]');
  if (modelRadios.length === 0) return;

  const chkSheets = document.getElementById("chk-sheets");
  const chkPillows = document.getElementById("chk-pillows");
  const chkFrame = document.getElementById("chk-frame");
  const checkboxes = [chkSheets, chkPillows, chkFrame].filter(Boolean);

  modelRadios.forEach((radio, index) => {
    radio.addEventListener('change', (e) => {
      // Toggle visual styles for labels
      modelRadios.forEach(r => {
        const label = r.closest('label');
        if (r.checked) {
          label.classList.add('border-brand', 'border-[1.5px]', 'bg-lightBlue/30');
          label.classList.remove('border-cardBorder', 'bg-bgTheme');
        } else {
          label.classList.remove('border-brand', 'border-[1.5px]', 'bg-lightBlue/30');
          label.classList.add('border-cardBorder', 'bg-bgTheme');
        }
      });

      // Handle Bundle Selection (Index 1 is bundle, Index 0 is solo)
      const isBundle = index === 1;
      let changed = false;
      checkboxes.forEach(chk => {
        if (chk.checked !== isBundle) {
          chk.checked = isBundle;
          changed = true;
        }
      });
      
      // Trigger renderCart by dispatching change on the first available checkbox
      if (changed && checkboxes.length > 0) {
        checkboxes[0].dispatchEvent(new Event('change'));
      }
    });
  });

  // Sync back from checkboxes to radio
  checkboxes.forEach(chk => {
    chk.addEventListener('change', () => {
      const allChecked = checkboxes.every(c => c.checked);
      if (allChecked) {
         if (!modelRadios[1].checked) {
            modelRadios[1].checked = true;
            modelRadios[1].dispatchEvent(new Event('change'));
         }
      } else {
         if (!modelRadios[0].checked) {
            modelRadios[0].checked = true;
            modelRadios[0].dispatchEvent(new Event('change'));
         }
      }
    });
  });
}

/* ── DETAILED FEATURE TOUR ────────────────────────────────────────────── */
function initFeatureTour() {
   const insideSection = document.getElementById('inside');
   const addToCartBtn = document.getElementById('add-to-cart-btn');
   if (!insideSection || !addToCartBtn) return;

   // 1. Create a "Start Tour" button and inject it below the Add to Cart block
   const btn = document.createElement('button');
   btn.className = 'w-full btn-outline border-brand/20 text-brand mt-4 text-sm';
   btn.innerHTML = 'Take a Detailed Tour';
   
   // Insert it after the checkout panel
   const checkoutPanel = addToCartBtn.closest('.bg-lightBlue\\/30');
   if (checkoutPanel) {
      checkoutPanel.parentNode.insertBefore(btn, checkoutPanel.nextSibling);
      btn.addEventListener('click', startTour);
   }

   function startTour() {
      insideSection.scrollIntoView({ behavior: 'smooth' });
      
      const featureCards = insideSection.querySelectorAll('.grid > div');
      if (!featureCards.length) return;

      let step = 0;
      
      const overlay = document.createElement('div');
      overlay.className = 'fixed inset-0 bg-black/80 z-[100] transition-opacity duration-500 opacity-0';
      document.body.appendChild(overlay);

      const tooltip = document.createElement('div');
      tooltip.className = 'fixed z-[101] bg-white text-black p-6 rounded-lg shadow-2xl max-w-sm w-[90%] transition-all duration-500 opacity-0 transform translate-y-4';
      document.body.appendChild(tooltip);

      setTimeout(() => {
         overlay.classList.remove('opacity-0');
         showTourStep();
      }, 500);

      function showTourStep() {
         if (step >= featureCards.length) {
            endTour();
            return;
         }
         
         featureCards.forEach(c => {
            c.style.position = 'relative';
            c.style.zIndex = '1';
            c.classList.remove('ring-4', 'ring-brand', 'scale-105');
            c.classList.add('transition-all', 'duration-500');
         });

         const card = featureCards[step];
         card.style.zIndex = '101';
         card.classList.add('ring-4', 'ring-brand', 'scale-105');

         const rect = card.getBoundingClientRect();
         const title = card.querySelector('h4').innerText;
         const desc = card.querySelector('p').innerText;

         tooltip.innerHTML = `
            <p class="text-[10px] uppercase tracking-widest text-brand/50 mb-2">Feature ${step + 1} of ${featureCards.length}</p>
            <h3 class="font-serif text-2xl text-brand mb-2">${title}</h3>
            <p class="text-sm text-brand/80 mb-6 leading-relaxed">${desc}</p>
            <div class="flex justify-between items-center">
               <button class="text-xs text-brand/50 hover:text-brand underline tour-skip">Skip Tour</button>
               <button class="btn-primary py-2 px-6 text-xs tour-next">${step === featureCards.length - 1 ? 'Finish' : 'Next'}</button>
            </div>
         `;

         let top = rect.bottom + 20;
         let left = rect.left;
         
         // Center on mobile or if it goes off screen
         if (window.innerWidth < 1024 || left + 350 > window.innerWidth) {
            left = window.innerWidth / 2 - 175;
            if(left < 10) left = 10;
            
            // Adjust top to be above if it goes below screen
            if(top + 250 > window.innerHeight) {
               top = rect.top - 200;
            }
         } else {
            // Desktop right side
            top = rect.top + (rect.height / 2) - 100;
            left = rect.right + 20;
         }

         tooltip.style.top = `${top}px`;
         tooltip.style.left = `${left}px`;
         tooltip.classList.remove('opacity-0', 'translate-y-4');

         // Smooth scroll so the card and tooltip are in view
         window.scrollTo({
            top: window.scrollY + card.getBoundingClientRect().top - window.innerHeight / 3,
            behavior: 'smooth'
         });

         tooltip.querySelector('.tour-next').addEventListener('click', () => {
            step++;
            showTourStep();
         });
         tooltip.querySelector('.tour-skip').addEventListener('click', endTour);
      }

      function endTour() {
         overlay.classList.add('opacity-0');
         tooltip.classList.add('opacity-0');
         featureCards.forEach(c => {
            c.style.zIndex = '1';
            c.classList.remove('ring-4', 'ring-brand', 'scale-105');
         });
         setTimeout(() => {
            overlay.remove();
            tooltip.remove();
         }, 500);
      }
   }
}

document.addEventListener('DOMContentLoaded', () => {
  CartState._patchPrices();
  setTimeout(initCartDOM, 50);
  setTimeout(initMarketerBar, 100);
  setTimeout(initOnboardingModal, 150);
  setTimeout(initVariantSelectors, 200);
  setTimeout(initFeatureTour, 250);

  // GTM View Item / Page View
  const page = document.body.dataset.page;
  if (page) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_type: page
    });
    
    // If it's a product page, fire view_item
    if (['mattress', 'sheets', 'pillows', 'frame', 'pdp'].includes(page) && typeof CONTENT !== 'undefined' && CONTENT.shop) {
      // Find the first product that matches this page or just push a generic view_item
      const prod = CONTENT.shop.products.find(p => p.id === page || p.href.includes(page));
      if (prod) {
        window.dataLayer.push({
          event: 'view_item',
          ecommerce: {
            items: [{ item_id: prod.id, item_name: prod.name, price: prod.price }]
          }
        });
      }
    }
  }
});
