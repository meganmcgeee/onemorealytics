import os
import re

gtm_head = """<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-WNM4876N');</script>
<!-- End Google Tag Manager -->"""

gtm_body = """<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-WNM4876N"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->"""

directory = '/Users/meganmcgee/Downloads/one-more/public'

for root, _, files in os.walk(directory):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if already installed
            if 'GTM-WNM4876N' in content:
                print(f"Skipping {filepath}, GTM already installed.")
                continue

            # Insert after <head>
            head_pattern = re.compile(r'(<head[^>]*>)', re.IGNORECASE)
            
            # Insert after <body>
            body_pattern = re.compile(r'(<body[^>]*>)', re.IGNORECASE)

            modified = False
            if head_pattern.search(content):
                content = head_pattern.sub(rf'\1\n{gtm_head}', content, count=1)
                modified = True
            else:
                print(f"Warning: No <head> tag found in {filepath}")

            if body_pattern.search(content):
                content = body_pattern.sub(rf'\1\n{gtm_body}', content, count=1)
                modified = True
            else:
                print(f"Warning: No <body> tag found in {filepath}")

            if modified:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")
