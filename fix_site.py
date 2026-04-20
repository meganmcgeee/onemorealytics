import os
import re

dir_path = '.'
html_files = [f for f in os.listdir(dir_path) if f.endswith('.html') and f != 'checkout.html']

# 1. Update CSS
css_path = os.path.join(dir_path, 'css', 'style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

if '.gap-10' not in css:
    css = css.replace('.gap-8         { gap: 2rem; }',
                     '.gap-8         { gap: 2rem; }\n.gap-10        { gap: 2.5rem; }\n.gap-14        { gap: 3.5rem; }')

if '.cart-drawer' not in css:
    css += """
/* ── CART DRAWER ─────────────────────────────────────────────── */
.cart-overlay {
  position: fixed; inset: 0; z-index: 100;
  background-color: hsl(var(--foreground) / 0.4);
  opacity: 0; pointer-events: none;
  transition: opacity var(--transition-fast);
}
.cart-overlay.open {
  opacity: 1; pointer-events: auto;
}

.cart-drawer {
  position: fixed; top: 0; right: 0; bottom: 0; z-index: 101;
  width: 100%; max-width: 24rem;
  background-color: hsl(var(--background));
  border-left: 1px solid hsl(var(--border));
  box-shadow: -4px 0 24px rgba(0,0,0,0.1);
  transform: translateX(100%);
  transition: transform var(--transition-smooth);
  display: flex; flex-direction: column;
}
.cart-drawer.open {
  transform: translateX(0);
}

.cart-header {
  padding: 1.5rem;
  border-bottom: 1px solid hsl(var(--border));
  display: flex; justify-content: space-between; align-items: center;
}
.cart-body {
  flex: 1; overflow-y: auto; padding: 1.5rem;
  display: flex; flex-direction: column; gap: 1.5rem;
}
.cart-footer {
  padding: 1.5rem;
  border-top: 1px solid hsl(var(--border));
  background-color: hsl(var(--cream-dark));
}

.cart-item {
  display: flex; gap: 1rem; align-items: center;
}
.cart-item-img {
  width: 4rem; height: 4rem; object-fit: cover;
  border-radius: var(--radius); background-color: hsl(var(--secondary));
}
.cart-item-details { flex: 1; }
.cart-item-title { font-family: var(--font-serif); font-size: 1.125rem; }
.cart-item-price { font-size: 0.875rem; color: hsl(var(--muted-foreground)); }
.cart-remove-btn { font-size: 0.75rem; text-decoration: underline; cursor: pointer; color: hsl(var(--muted-foreground)); background: none; border: none; }
"""
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(css)

# 2. CREATE CHECKOUT PAGE
checkoutHtml = """<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>checkout | one more</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="css/style.css" />
  <script src="https://cdn.jsdelivr.net/npm/mustache@4.2.0/mustache.min.js"></script>
  <script src="content.js"></script>
</head>
<body data-page="home">
  <header class="border-b border-border bg-background">
    <div class="container-padding py-6 text-center">
      <a href="index.html" class="font-serif text-2xl tracking-tight text-foreground">one more</a>
    </div>
  </header>

  <main class="section-padding bg-cream-dark min-h-screen">
    <div class="container-padding max-w-2xl mx-auto">
      <h1 class="font-serif text-3xl md:text-4xl text-foreground mb-8 text-center">checkout</h1>
      
      <div class="bg-background p-8 rounded-sm border border-border shadow-sm mb-8" id="checkout-items-container">
        <!-- Rendered by JS -->
      </div>
      
      <div class="text-center">
        <button class="btn-primary" onclick="alert('thank you for pretending to buy!')">place order</button>
      </div>
    </div>
  </main>
  <script src="js/main.js"></script>
  <script>
    document.addEventListener('cart-loaded', function(e) {
      const state = e.detail;
      const c = document.getElementById('checkout-items-container');
      if (state.items.length === 0) {
        c.innerHTML = '<p class="text-center text-muted-foreground">your cart is empty.</p>';
      } else {
        let html = '<div class="space-y-6">';
        state.items.forEach(item => {
          html += `
            <div class="cart-item">
              <img src="${item.img}" class="cart-item-img" alt="product">
              <div class="cart-item-details">
                <p class="cart-item-title">${item.name}</p>
              </div>
              <div>${item.price}</div>
            </div>
          `;
        });
        html += `</div><div class="cart-footer mt-6 bg-transparent px-0 pb-0 border-t"><div class="flex justify-between"><strong>subtotal</strong><strong>${state.totalFormatted}</strong></div></div>`;
        c.innerHTML = html;
      }
    });
  </script>
</body>
</html>"""
with open(os.path.join(dir_path, 'checkout.html'), 'w', encoding='utf-8') as f:
    f.write(checkoutHtml)

# 3. UPDATE ALL HTML FILES
for f_name in html_files:
    f_path = os.path.join(dir_path, f_name)
    with open(f_path, 'r', encoding='utf-8') as f:
        content = f.read()

    if 'cart-btn-desktop' not in content:
        content = content.replace(
            '<div class="hidden lg:flex items-center gap-10">',
            '<div class="hidden lg:flex items-center gap-10 lg:gap-14">'
        )
        
        # Add cart link to desktop nav
        cart_desktop = r"""        {{/nav.links}}
        <button class="nav-link text-sm tracking-wide transition-all duration-300 hover:opacity-60 text-muted-foreground cart-btn-desktop" aria-label="cart">cart (<span class="cart-count">0</span>)</button>
      </div>"""
        content = re.sub(r'\{\{/nav\.links\}\}\s*</div>', cart_desktop, content)
        
    if 'cart-btn-mobile' not in content:
        mobile_btn = """      <div class="lg:hidden flex items-center gap-4">
        <button class="nav-link text-sm tracking-wide text-foreground cart-btn-mobile" aria-label="cart">cart (<span class="cart-count">0</span>)</button>
        <button id="mobile-menu-btn" class="flex flex-col gap-1.5 p-2" aria-label="menu">
          <span class="w-6 h-px bg-foreground block transition-all"></span>
          <span class="w-6 h-px bg-foreground block transition-all"></span>
          <span class="w-4 h-px bg-foreground block transition-all"></span>
        </button>
      </div>"""
        # Replace the entire existing mobile menu button
        content = re.sub(
            r'<!-- Mobile menu button -->\s*<button id="mobile-menu-btn"[\s\S]*?</button>',
            '<!-- Mobile menu button -->\n' + mobile_btn,
            content
        )

    if f_name in ['shop.html', 'mattress.html']:
        content = re.sub(
            r'onclick="alert\(\'Add to cart: \{\{name\}\}\'\)"',
            'onclick="window.addToCart(\'{{id}}\', \'{{name}}\', \'{{price}}\', \'{{img}}\')"',
            content
        )
        
    with open(f_path, 'w', encoding='utf-8') as f:
        f.write(content)

# 4. UPDATE JS
js_path = os.path.join(dir_path, 'js', 'main.js')
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

if 'Cart State' not in js:
    js += """

// ============================================================
// CART LOGIC
// ============================================================
const CartState = {
  items: JSON.parse(localStorage.getItem('onemore_cart') || '[]'),
  
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
    countElements.forEach(el => el.textContent = this.items.length);
    
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
  setTimeout(initCartDOM, 50);
});
"""
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(js)

print("Done updating site via python script!")
