import os
import re

dir_path = '.'

content_path = os.path.join(dir_path, 'content.js')
with open(content_path, 'r', encoding='utf-8') as f:
    js = f.read()

# Mattress
js = js.replace('ctaText:  "add to cart — $2,495",', 'ctaText:  "add to cart — $2,495",\n        price:    "$2,495",')

# Sheets
js = js.replace('ctaText:  "add to cart — $295",', 'ctaText:  "add to cart — $295",\n        price:    "$295",')

# Pillows
js = js.replace('ctaText:  "add to cart — $195",', 'ctaText:  "add to cart — $195",\n        price:    "$195",')

# Frame
js = js.replace('ctaText:  "add to cart — $1,195",', 'ctaText:  "add to cart — $1,195",\n        price:    "$1,195",')

with open(content_path, 'w', encoding='utf-8') as f:
    f.write(js)

print("Added missing price fields to shop products in content.js")
