import os
import re

dir_path = '.'

# 1. Update style.css to ensure utility classes exist
css_path = os.path.join(dir_path, 'css/style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

if '.mr-10' not in css:
    css += '\n.mr-10 { margin-right: 2.5rem; }\n.ml-auto { margin-left: auto; }\n'

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Update JavaScript to add subtotal to cart buttons
js_path = os.path.join(dir_path, 'js/main.js')
with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Replace the simple cart count logic
old_count_logic = "countElements.forEach(el => el.textContent = this.items.length);"
new_count_logic = """
    const totalNumToCart = this.total();
    const formattedTotalToCart = '$' + totalNumToCart.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    countElements.forEach(el => {
      el.textContent = this.items.length + (this.items.length > 0 ? ' — ' + formattedTotalToCart : '');
    });
"""
if old_count_logic in js:
    js = js.replace(old_count_logic, new_count_logic)
elif 'formattedTotalToCart' not in js:
    # If it was already replaced or customized elsewhere, inject it safely
    js = re.sub(r"countElements\.forEach\(el => el\.textContent[\s\S]*?\);", new_count_logic, js)

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

# 3. Cache bust all HTML files and ensure the cart button rendering
html_files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

for fname in html_files:
    fpath = os.path.join(dir_path, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Cache bust css
    html = re.sub(r'href="css/style\.css(\?v=\d+)?"', 'href="css/style.css?v=3"', html)

    # Force ml-auto on desktop nav if missing, or guarantee mr-10 on brand logo
    if 'mr-10' not in html and 'site.brand' in html:
        html = html.replace('class="font-serif text-xl lg:text-2xl tracking-tight text-foreground hover:opacity-70 transition-opacity"',
                            'class="font-serif text-xl lg:text-2xl tracking-tight text-foreground hover:opacity-70 transition-opacity mr-10"')

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)

print("Updated subtotal in nav cart buttons and cache-busted the CSS.")
