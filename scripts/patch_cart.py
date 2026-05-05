import os

dir_path = '.'
js_path = os.path.join(dir_path, 'js/main.js')

with open(js_path, 'r', encoding='utf-8') as f:
    js = f.read()

patch_logic = """
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
"""

if '_patchPrices' not in js:
    js = js.replace("items: JSON.parse(localStorage.getItem('onemore_cart') || '[]'),", patch_logic)
    
    # ensure it gets called
    js = js.replace("setTimeout(initCartDOM, 50);", "CartState._patchPrices();\n  setTimeout(initCartDOM, 50);")

with open(js_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Added price-patch logic to JS file")
