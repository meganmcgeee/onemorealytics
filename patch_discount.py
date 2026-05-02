import sys

file_path = "campaign-generator.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add the UI for Discount Offer
old_ui = """                        <div id="reservation-products-list" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
                            <!-- Populated dynamically -->
                        </div>
                    </div>"""

new_ui = """                        <div id="reservation-products-list" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem; margin-bottom: 1rem;">
                            <!-- Populated dynamically -->
                        </div>
                        <label>Discount Badge (Optional)</label>
                        <input type="text" id="lp-discount-offer" placeholder="e.g. 20% Off" onkeyup="updateLPPreview()" style="width: 100%; padding: 0.5rem; border: 1px solid var(--border); border-radius: 4px; background: var(--background); color: var(--foreground); font-family: inherit; margin-top: 0.2rem;">
                    </div>"""
content = content.replace(old_ui, new_ui)

# 2. Update updateLPPreview function
old_iframe = """            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType, currentCreative, selectedProductIds);
        }"""
new_iframe = """            const discountOffer = document.getElementById('lp-discount-offer') ? document.getElementById('lp-discount-offer').value : '';
            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType, currentCreative, selectedProductIds, discountOffer);
        }"""
content = content.replace(old_iframe, new_iframe)

# 3. Update getBoilerplate signature
content = content.replace("function getBoilerplate(personaIndex, toneKey, pageType = 'sales', imageSrc = '/img/hero-bed.jpg', selectedProductIds = null) {", "function getBoilerplate(personaIndex, toneKey, pageType = 'sales', imageSrc = '/img/hero-bed.jpg', selectedProductIds = null, discountOffer = '') {")

# 4. Change the CSS for .res-product-grid and .res-product-card
old_css1 = ".res-product-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.5rem; }"
old_css2 = "@media (min-width: 640px) { .res-product-grid { grid-template-columns: repeat(4, 1fr); } }"
old_css3 = ".res-product-card { border: 1px solid var(--border); border-radius: 0.5rem; overflow: hidden; background: var(--card); opacity: 0.9; }"

new_css1 = ".res-product-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; margin-bottom: 1.5rem; }"
new_css2 = ""
new_css3 = ".res-product-card { border: 1px solid var(--border); border-radius: 0.5rem; overflow: hidden; background: var(--card); flex: 0 1 240px; max-width: 100%; position: relative; }"

content = content.replace(old_css1, new_css1)
content = content.replace(old_css2, new_css2)
content = content.replace(old_css3, new_css3)

# 5. Add the discount badge in the product rendering
old_card = """                                                <div class="res-product-card">
                                                    <img src="/${p.img}" alt="${p.imgAlt}" class="res-product-img">
                                                    <div class="res-product-info">
                                                        <div class="res-product-name">${p.name}</div>
                                                        <div class="res-product-price">${p.price}</div>
                                                    </div>
                                                </div>"""

new_card = """                                                <div class="res-product-card">
                                                    ${discountOffer ? `<div style="position: absolute; top: 0.5rem; right: 0.5rem; background: var(--accent); color: var(--primary-foreground); padding: 0.25rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: bold; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${discountOffer}</div>` : ''}
                                                    <img src="/${p.img}" alt="${p.imgAlt}" class="res-product-img">
                                                    <div class="res-product-info">
                                                        <div class="res-product-name">${p.name}</div>
                                                        <div class="res-product-price">${discountOffer ? `<s>${p.price}</s> <span style="color: var(--accent); font-weight: bold; margin-left: 4px;">Sale</span>` : p.price}</div>
                                                    </div>
                                                </div>"""
content = content.replace(old_card, new_card)


with open(file_path, "w") as f:
    f.write(content)
