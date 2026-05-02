import sys

file_path = "campaign-generator.html"
with open(file_path, "r") as f:
    content = f.read()

old_select = """                        <label>Primary Creative</label>
                        <select id="lp-creative-select" onchange="updateLPPreview()">
                            <option value="/img/hero-bed.jpg">Hero Bed</option>
                            <option value="/img/lifestyle-family.jpg">Lifestyle Family</option>
                            <option value="/img/mattress-layers.jpg">Mattress Layers</option>
                            <option value="/img/mattress-overhead.jpg">Mattress Overhead</option>
                        </select>"""

new_gallery = """                        <label>Primary Creative</label>
                        <div class="media-gallery" id="media-gallery-container">
                            <div class="gallery-item active" onclick="selectCreative('/img/hero-bed.jpg', this)">
                                <img src="/img/hero-bed.jpg" alt="Hero Bed">
                            </div>
                            <div class="gallery-item" onclick="selectCreative('/img/lifestyle-family.jpg', this)">
                                <img src="/img/lifestyle-family.jpg" alt="Family">
                            </div>
                            <div class="gallery-item" onclick="selectCreative('/img/mattress-layers.jpg', this)">
                                <img src="/img/mattress-layers.jpg" alt="Layers">
                            </div>
                            <div class="gallery-item" onclick="selectCreative('/img/mattress-overhead.jpg', this)">
                                <img src="/img/mattress-overhead.jpg" alt="Overhead">
                            </div>
                            <div class="gallery-item upload-btn" onclick="document.getElementById('upload-creative-input').click()">
                                <i class="fas fa-plus" style="margin-bottom: 4px;"></i>
                                <span>Upload</span>
                            </div>
                        </div>
                        <input type="file" id="upload-creative-input" style="display: none;" accept="image/*" onchange="handleCreativeUpload(event)">"""
content = content.replace(old_select, new_gallery)


css_to_add = """
        .media-gallery { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 0.5rem; }
        .gallery-item { aspect-ratio: 1; border-radius: 4px; border: 2px solid transparent; overflow: hidden; cursor: pointer; transition: 0.2s; position: relative; background: #f3f4f6; }
        .gallery-item img { width: 100%; height: 100%; object-fit: cover; }
        .gallery-item.active { border-color: var(--accent); }
        .gallery-item.upload-btn { background: var(--background); border: 1px dashed var(--border); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--muted-foreground); gap: 0.2rem; font-size: 0.75rem; font-family: var(--font-sans); }
        .gallery-item.upload-btn:hover { border-color: var(--accent); color: var(--accent); }
"""
content = content.replace("    </style>", css_to_add + "    </style>")


js_to_add = """        let currentCreative = '/img/hero-bed.jpg';

        function selectCreative(src, el) {
            currentCreative = src;
            document.querySelectorAll('.gallery-item').forEach(item => item.classList.remove('active'));
            el.classList.add('active');
            updateLPPreview();
        }

        function handleCreativeUpload(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const newSrc = e.target.result;
                    const gallery = document.getElementById('media-gallery-container');
                    const uploadBtn = gallery.querySelector('.upload-btn');
                    
                    const newItem = document.createElement('div');
                    newItem.className = 'gallery-item';
                    newItem.onclick = function() { selectCreative(newSrc, this); };
                    newItem.innerHTML = `<img src="${newSrc}" alt="Uploaded Image">`;
                    
                    gallery.insertBefore(newItem, uploadBtn);
                    selectCreative(newSrc, newItem);
                };
                reader.readAsDataURL(file);
            }
        }
"""
content = content.replace("        function updateLPPreview() {", js_to_add + "\n        function updateLPPreview() {")


old_updateLP = """        function updateLPPreview() {
            const personaIndex = document.getElementById('lp-persona-select').value;
            const tone = document.getElementById('lp-tone-select').value;
            const pageType = document.getElementById('lp-type-select').value;
            const creative = document.getElementById('lp-creative-select').value;
            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType, creative);
        }"""

new_updateLP = """        function updateLPPreview() {
            const personaIndex = document.getElementById('lp-persona-select').value;
            const tone = document.getElementById('lp-tone-select').value;
            const pageType = document.getElementById('lp-type-select').value;
            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType, currentCreative);
        }"""
content = content.replace(old_updateLP, new_updateLP)

with open(file_path, "w") as f:
    f.write(content)

