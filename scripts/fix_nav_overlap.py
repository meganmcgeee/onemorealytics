import os
import re

dir_path = '.'

# 1. Update style.css
css_path = os.path.join(dir_path, 'css/style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

if '.ml-auto' not in css:
    css = css + '\n.ml-auto { margin-left: auto; }\n.mr-auto { margin-right: auto; }\n.flex-1 { flex: 1; }\n'

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Update all HTML files
html_files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

for fname in html_files:
    fpath = os.path.join(dir_path, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()

    # The desktop nav
    html = html.replace('<div class="hidden lg:flex items-center gap-10 lg:gap-14">',
                        '<div class="hidden lg:flex items-center gap-10 lg:gap-14 ml-auto">')
    
    # Just in case there's another occurrence without lg:gap-14
    html = html.replace('<div class="hidden lg:flex items-center gap-10">',
                        '<div class="hidden lg:flex items-center gap-10 ml-auto">')
    
    # Let's also add a right margin to the logo or wrapper to be ultra safe
    html = html.replace('class="font-serif text-xl lg:text-2xl tracking-tight text-foreground hover:opacity-70 transition-opacity"',
                        'class="font-serif text-xl lg:text-2xl tracking-tight text-foreground hover:opacity-70 transition-opacity mr-10"')

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)

print("Applied forced auto margin to separate the logo and navigation links.")
