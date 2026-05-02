import sys
import re

file_path = "campaign-generator.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Fix the sidebar population (inject into document.addEventListener('DOMContentLoaded'))
populate_logic = """
        // Populate reservation products
        const productList = document.getElementById('reservation-products-list');
        if (typeof CONTENT !== 'undefined' && CONTENT.shop && CONTENT.shop.products && productList) {
            CONTENT.shop.products.forEach(p => {
                const label = document.createElement('label');
                label.style.display = 'flex';
                label.style.alignItems = 'center';
                label.style.gap = '0.5rem';
                label.style.fontSize = '0.85rem';
                label.style.cursor = 'pointer';
                label.innerHTML = `<input type="checkbox" value="${p.id}" checked onchange="updateLPPreview()"> ${p.name}`;
                productList.appendChild(label);
            });
        }
"""
# Find the DOMContentLoaded block
if "document.addEventListener('DOMContentLoaded', () => {" in content:
    content = content.replace("document.addEventListener('DOMContentLoaded', () => {", "document.addEventListener('DOMContentLoaded', () => {\n" + populate_logic)


# 2. Update the landing page to remove "xelection" (no hover/click/selected states, just static display)
old_grid = """                                    <div>
                                        <label class="block text-sm font-medium text-foreground mb-3 text-center sm:text-left">Select Product to Reserve</label>
                                        <div class="res-product-grid">
                                            ${CONTENT.shop.products.filter(p => selectedProductIds === null || selectedProductIds.length === 0 || selectedProductIds.includes(p.id)).map((p, index) => `
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

new_grid = """                                    <div class="mb-6">
                                        <label class="block text-sm font-medium text-foreground mb-3 text-center sm:text-left">Products in this Promotion</label>
                                        <div class="res-product-grid" style="pointer-events: none;">
                                            ${CONTENT.shop.products.filter(p => selectedProductIds === null || selectedProductIds.length === 0 || selectedProductIds.includes(p.id)).map((p, index) => `
                                                <div class="res-product-card">
                                                    <img src="/${p.img}" alt="${p.imgAlt}" class="res-product-img">
                                                    <div class="res-product-info">
                                                        <div class="res-product-name">${p.name}</div>
                                                        <div class="res-product-price">${p.price}</div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>"""
content = content.replace(old_grid, new_grid)

# Remove the CSS hover/selected effects from the boilerplate
content = content.replace(".res-product-card { border: 2px solid var(--border); border-radius: 0.5rem; overflow: hidden; cursor: pointer; transition: all 0.2s; background: var(--card); }", ".res-product-card { border: 1px solid var(--border); border-radius: 0.5rem; overflow: hidden; background: var(--card); opacity: 0.9; }")
content = content.replace(".res-product-card:hover { border-color: var(--muted-foreground); }", "")
content = content.replace(".res-product-card.selected { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }", "")


# 3. Simplify the label for the email input
content = content.replace("<label class=\"block text-sm font-medium text-foreground mb-1\">Where should we send your invite?</label>", "<label class=\"block text-sm font-medium text-foreground mb-1\">Where should we send your 1-click purchase link?</label>")


with open(file_path, "w") as f:
    f.write(content)

