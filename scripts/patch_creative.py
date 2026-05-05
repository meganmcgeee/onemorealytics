import sys

file_path = "campaign-generator.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update updateLPPreview function
old_func = """        function updateLPPreview() {
            const personaIndex = document.getElementById('lp-persona-select').value;
            const tone = document.getElementById('lp-tone-select').value;
            const pageType = document.getElementById('lp-type-select').value;
            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType);
        }"""
new_func = """        function updateLPPreview() {
            const personaIndex = document.getElementById('lp-persona-select').value;
            const tone = document.getElementById('lp-tone-select').value;
            const pageType = document.getElementById('lp-type-select').value;
            const creative = document.getElementById('lp-creative-select').value;
            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType, creative);
        }"""
content = content.replace(old_func, new_func)

# 2. Update getBoilerplate signature
content = content.replace("function getBoilerplate(personaIndex, toneKey, pageType = 'sales') {", "function getBoilerplate(personaIndex, toneKey, pageType = 'sales', imageSrc = '/img/hero-bed.jpg') {")

# 3. Replace image tags in getBoilerplate
# We specifically want to target the image source
content = content.replace('img src="/img/mattress-layers.jpg"', 'img src="${imageSrc}"')
content = content.replace('img src="/img/hero-bed.jpg"', 'img src="${imageSrc}"')
# If we replaced the second image in the sales boilerplate to imageSrc, let's keep it or it's fine if it's the same image for the mockup.

with open(file_path, "w") as f:
    f.write(content)

