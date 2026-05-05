import sys
import re

file_path = "campaign-generator.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Remove the text area from the UI
content = re.sub(
    r'<div class="form-group" id="reservation-products-group".*?</div>',
    '',
    content,
    flags=re.DOTALL
)

# 2. Update updateLPPreview function
old_updateLP = """        function updateLPPreview() {
            const personaIndex = document.getElementById('lp-persona-select').value;
            const tone = document.getElementById('lp-tone-select').value;
            const pageType = document.getElementById('lp-type-select').value;
            
            const resGroup = document.getElementById('reservation-products-group');
            if (resGroup) {
                resGroup.style.display = (pageType === 'reservation') ? 'block' : 'none';
            }
            const resProducts = document.getElementById('lp-reservation-products') ? document.getElementById('lp-reservation-products').value : '';

            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType, currentCreative, resProducts);
        }"""

new_updateLP = """        function updateLPPreview() {
            const personaIndex = document.getElementById('lp-persona-select').value;
            const tone = document.getElementById('lp-tone-select').value;
            const pageType = document.getElementById('lp-type-select').value;
            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType, currentCreative);
        }"""
content = content.replace(old_updateLP, new_updateLP)

# 3. Update getBoilerplate signature
content = content.replace("function getBoilerplate(personaIndex, toneKey, pageType = 'sales', imageSrc = '/img/hero-bed.jpg', resProducts = 'Queen, King') {", "function getBoilerplate(personaIndex, toneKey, pageType = 'sales', imageSrc = '/img/hero-bed.jpg') {")


# 4. Inject CSS styles into the boilerplate
css_addition = """
    /* Reservation Grid Styles */
    .res-product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
    @media (min-width: 640px) { .res-product-grid { grid-template-columns: repeat(4, 1fr); } }
    .res-product-card { border: 2px solid var(--border); border-radius: 0.5rem; overflow: hidden; cursor: pointer; transition: all 0.2s; background: var(--card); }
    .res-product-card:hover { border-color: var(--muted-foreground); }
    .res-product-card.selected { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
    .res-product-img { width: 100%; aspect-ratio: 1; object-fit: cover; }
    .res-product-info { padding: 0.75rem; text-align: center; }
    .res-product-name { font-family: var(--font-sans); font-size: 0.85rem; font-weight: 500; color: var(--foreground); margin-bottom: 0.25rem; }
    .res-product-price { font-size: 0.8rem; color: var(--muted-foreground); }
"""
content = content.replace("input[type=\"email\"]:focus, input[type=\"text\"]:focus, select:focus { outline: none; border-color: var(--foreground); }", "input[type=\"email\"]:focus, input[type=\"text\"]:focus, select:focus { outline: none; border-color: var(--foreground); }" + css_addition)


# 5. Update the reservation template html
old_res_template = """                                    <div>
                                        <label class="block text-sm font-medium text-foreground mb-1">Which size do you need?</label>
                                        <select class="w-full border border-border rounded-sm bg-background text-foreground" style="padding: 1rem 1.25rem; font-size: 1.1rem;">
                                            ${resProducts.split(',').map(p => `<option>${p.trim()}</option>`).join('')}
                                        </select>
                                    </div>"""

new_res_template = """                                    <div>
                                        <label class="block text-sm font-medium text-foreground mb-3 text-center sm:text-left">Select Product to Reserve</label>
                                        <div class="res-product-grid">
                                            ${window.CONTENT.shop.products.map((p, index) => `
                                                <div class="res-product-card ${index === 0 ? 'selected' : ''}" onclick="document.querySelectorAll('.res-product-card').forEach(c=>c.classList.remove('selected')); this.classList.add('selected');">
                                                    <img src="/${p.img}" alt="${p.imgAlt}" class="res-product-img">
                                                    <div class="res-product-info">
                                                        <div class="res-product-name">${p.name}</div>
                                                        <div class="res-product-price">${p.price}</div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>"""
content = content.replace(old_res_template, new_res_template)

# Also update the paragraph to match products rather than "exact size"
content = content.replace("Lock in your exact size today, and get a 1-click purchase link", "Lock in your specific product today, and get a 1-click purchase link")

with open(file_path, "w") as f:
    f.write(content)

