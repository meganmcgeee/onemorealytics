import sys

file_path = "campaign-generator.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add the UI block for selecting products
old_select_block = """                    <div class="form-group">
                        <label>Landing Page Type</label>
                        <select id="lp-type-select" onchange="updateLPPreview()">
                            <option value="sales">Sales Landing Page / Hero Page</option>
                            <option value="squeeze">Squeeze Page / Lead Capture</option>
                            <option value="reservation">Pre-Sale Reservation Flow</option>
                            <option value="clickthrough">Click-Through Landing Page</option>
                            <option value="launch">Product Launch Page</option>
                            <option value="advertorial">Advertorial Landing Page</option>
                            <option value="quiz">Quiz Page</option>
                            <option value="thankyou">Thank You / Confirmation Page</option>
                        </select>
                    </div>"""

new_select_block = """                    <div class="form-group">
                        <label>Landing Page Type</label>
                        <select id="lp-type-select" onchange="updateLPPreview()">
                            <option value="sales">Sales Landing Page / Hero Page</option>
                            <option value="squeeze">Squeeze Page / Lead Capture</option>
                            <option value="reservation">Pre-Sale Reservation Flow</option>
                            <option value="clickthrough">Click-Through Landing Page</option>
                            <option value="launch">Product Launch Page</option>
                            <option value="advertorial">Advertorial Landing Page</option>
                            <option value="quiz">Quiz Page</option>
                            <option value="thankyou">Thank You / Confirmation Page</option>
                        </select>
                    </div>
                    
                    <div class="form-group" id="reservation-products-group" style="display: none;">
                        <label>Included Products</label>
                        <div id="reservation-products-list" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
                            <!-- Populated dynamically -->
                        </div>
                    </div>"""
content = content.replace(old_select_block, new_select_block)


# 2. Update updateLPPreview function
old_updateLP = """        function updateLPPreview() {
            const personaIndex = document.getElementById('lp-persona-select').value;
            const tone = document.getElementById('lp-tone-select').value;
            const pageType = document.getElementById('lp-type-select').value;
            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType, currentCreative);
        }"""

new_updateLP = """        function updateLPPreview() {
            const personaIndex = document.getElementById('lp-persona-select').value;
            const tone = document.getElementById('lp-tone-select').value;
            const pageType = document.getElementById('lp-type-select').value;
            
            const resGroup = document.getElementById('reservation-products-group');
            if (resGroup) {
                resGroup.style.display = (pageType === 'reservation') ? 'block' : 'none';
            }
            
            const selectedProductIds = [];
            document.querySelectorAll('#reservation-products-list input[type="checkbox"]:checked').forEach(cb => {
                selectedProductIds.push(cb.value);
            });

            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType, currentCreative, selectedProductIds);
        }"""
content = content.replace(old_updateLP, new_updateLP)


# 3. Add population logic on load
old_init = """        window.addEventListener('DOMContentLoaded', () => {"""
new_init = """        window.addEventListener('DOMContentLoaded', () => {
            // Populate reservation products
            const productList = document.getElementById('reservation-products-list');
            if (typeof CONTENT !== 'undefined' && CONTENT.shop && CONTENT.shop.products) {
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
content = content.replace(old_init, new_init)


# 4. Update getBoilerplate signature
content = content.replace("function getBoilerplate(personaIndex, toneKey, pageType = 'sales', imageSrc = '/img/hero-bed.jpg') {", "function getBoilerplate(personaIndex, toneKey, pageType = 'sales', imageSrc = '/img/hero-bed.jpg', selectedProductIds = null) {")


# 5. Update the template to use the selected products
old_res_template = """                                        <div class="res-product-grid">
                                            ${CONTENT.shop.products.map((p, index) => `
                                                <div class="res-product-card ${index === 0 ? 'selected' : ''}" onclick="document.querySelectorAll('.res-product-card').forEach(c=>c.classList.remove('selected')); this.classList.add('selected');">
                                                    <img src="/${p.img}" alt="${p.imgAlt}" class="res-product-img">
                                                    <div class="res-product-info">
                                                        <div class="res-product-name">${p.name}</div>
                                                        <div class="res-product-price">${p.price}</div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>"""

new_res_template = """                                        <div class="res-product-grid">
                                            ${CONTENT.shop.products.filter(p => selectedProductIds === null || selectedProductIds.length === 0 || selectedProductIds.includes(p.id)).map((p, index) => `
                                                <div class="res-product-card ${index === 0 ? 'selected' : ''}" onclick="document.querySelectorAll('.res-product-card').forEach(c=>c.classList.remove('selected')); this.classList.add('selected');">
                                                    <img src="/${p.img}" alt="${p.imgAlt}" class="res-product-img">
                                                    <div class="res-product-info">
                                                        <div class="res-product-name">${p.name}</div>
                                                        <div class="res-product-price">${p.price}</div>
                                                    </div>
                                                </div>
                                            `).join('')}
                                        </div>"""
content = content.replace(old_res_template, new_res_template)

with open(file_path, "w") as f:
    f.write(content)

