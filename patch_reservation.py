import sys

file_path = "campaign-generator.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add the text area in the UI
old_ui = """                    <div class="form-group">
                        <label>Landing Page Type</label>
                        <select id="lp-type-select" onchange="updateLPPreview()">"""

new_ui = """                    <div class="form-group">
                        <label>Landing Page Type</label>
                        <select id="lp-type-select" onchange="updateLPPreview()">"""
# Wait, I'll insert it AFTER the lp-type-select group

old_ui_block = """                    <div class="form-group">
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

new_ui_block = """                    <div class="form-group">
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
                        <label>Pre-Sale Products (Comma separated)</label>
                        <textarea id="lp-reservation-products" rows="2" onkeyup="updateLPPreview()">The One More Mattress - Queen, The One More Mattress - King</textarea>
                    </div>"""
content = content.replace(old_ui_block, new_ui_block)

# 2. Update updateLPPreview function to handle the toggle and passing the products
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
            const resProducts = document.getElementById('lp-reservation-products') ? document.getElementById('lp-reservation-products').value : '';

            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType, currentCreative, resProducts);
        }"""
content = content.replace(old_updateLP, new_updateLP)

# 3. Update getBoilerplate function signature
content = content.replace("function getBoilerplate(personaIndex, toneKey, pageType = 'sales', imageSrc = '/img/hero-bed.jpg') {", "function getBoilerplate(personaIndex, toneKey, pageType = 'sales', imageSrc = '/img/hero-bed.jpg', resProducts = 'Queen, King') {")

# 4. Update the reservation template inside getBoilerplate
old_res_template = """                                        <select class="w-full border border-border rounded-sm bg-background text-foreground" style="padding: 1rem 1.25rem; font-size: 1.1rem;">
                                            <option>Queen</option>
                                            <option>King</option>
                                            <option>California King</option>
                                            <option>Full</option>
                                            <option>Twin XL</option>
                                        </select>"""

new_res_template = """                                        <select class="w-full border border-border rounded-sm bg-background text-foreground" style="padding: 1rem 1.25rem; font-size: 1.1rem;">
                                            ${resProducts.split(',').map(p => `<option>${p.trim()}</option>`).join('')}
                                        </select>"""
content = content.replace(old_res_template, new_res_template)

with open(file_path, "w") as f:
    f.write(content)

