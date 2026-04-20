import os
import re

dir_path = '.'

# 1. Update style.css
css_path = os.path.join(dir_path, 'css/style.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Add button reset
if 'button { background: transparent;' not in css:
    css = css.replace('img, video { display: block; max-width: 100%; height: auto; }',
                      'img, video { display: block; max-width: 100%; height: auto; }\nbutton { background: transparent; border: none; font-family: inherit; color: inherit; cursor: pointer; padding: 0; outline: none; appearance: none; }')

# Fix line heights
css = css.replace('.leading-tight  { line-height: 1.25; }', '.leading-tight  { line-height: 1.35; }')
css = css.replace('.leading-\\[1\\.1\\]{ line-height: 1.1; }', '.leading-\\[1\\.1\\]{ line-height: 1.25; }')

# Add missing variants
if '.lg\\:gap-10' not in css:
    css = css.replace('.lg\\:gap-8  { gap: 2rem; }', 
                      '.lg\\:gap-8  { gap: 2rem; }\n  .lg\\:gap-10 { gap: 2.5rem; }\n  .lg\\:gap-14 { gap: 3.5rem; }')

# Ensure container-padding handles edge cases safely
if '.container-padding{' in css:
    css = css.replace('.container-padding{ padding-left: var(--container-padding); padding-right: var(--container-padding); }',
                      '.container-padding{ padding-left: var(--container-padding); padding-right: var(--container-padding); box-sizing: border-box; width: 100%; }')

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)


# 2. Update HTML Files
html_files = [f for f in os.listdir(dir_path) if f.endswith('.html')]
for fname in html_files:
    fpath = os.path.join(dir_path, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        html = f.read()

    # Nav spacing fix: Add w-full to the inner nav div to ensure flex layout spreads across the whole width
    html = html.replace('<div class="flex items-center justify-between h-20 lg:h-24">',
                        '<div class="flex items-center justify-between h-20 lg:h-24 w-full">')

    # Home Page specific fixes
    if fname == 'index.html':
        html = html.replace('text-6xl md:text-8xl text-foreground leading-[1.1]', 'text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight')

    # About Page specific fixes
    if fname == 'about.html':
        html = html.replace('<div class="flex flex-col justify-center">', '<div class="flex flex-col justify-center lg:pl-8">')

    # Landing Page specific fixes (increase whitespace)
    if fname.startswith('landing-'):
        html = html.replace('mb-6"', 'mb-10"')
        html = html.replace('mb-8"', 'mb-12"')
        # Wrap the whole layout in some more padding if desired
        html = html.replace('section-padding', 'section-padding py-20 lg:py-28')
        
        # In landing-score: fix the "Chasing a number?" spacing
        # It's already handled by mb-10 instead of mb-6.
    
    # Footer specific fix: keep the signature line contained by adding max-w-full
    html = html.replace('<div class="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">',
                        '<div class="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full max-w-[100%] overflow-hidden">')

    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(html)

print("Enriched pages and cleaned up CSS rules.")
