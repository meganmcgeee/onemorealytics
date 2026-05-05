import sys

def replace_all(content, replacements):
    for old, new in replacements:
        content = content.replace(old, new)
    return content

# SHEETS
with open('sheets.html', 'r') as f:
    content = f.read()

replacements_sheets = [
    ('<title>the mattress | one more</title>', '<title>the sheets | one more</title>'),
    ('the one more mattress', 'the one more sheets'),
    ('wider than king. smarter than the rest.', 'custom-fit for extra room. breathable linen.'),
    ('$2,495', '$295'),
    ('img/mattress-overhead.jpg', 'img/sheets-product.jpg'),
    ('img/hero-bed.jpg', 'img/sheets-lifestyle.jpg'), # assuming this or just sheets-product.jpg
    ('img/mattress-layers.jpg', 'img/sheets-detail.jpg'),
    ('add to cart — $295', 'add to cart — $295'), # fix the price
    ('145 lbs', '4 lbs'),
    ('84" W × 80" L × 12" H', '84" W × 80" L x 18" D'),
    ('the hero product', 'fit for the space you need'),
    ('the standalone mattress.', 'the standalone sheets.')
]
content = replace_all(content, replacements_sheets)
with open('sheets.html', 'w') as f:
    f.write(content)

# PILLOWS
with open('pillows.html', 'r') as f:
    content = f.read()

replacements_pillows = [
    ('<title>the mattress | one more</title>', '<title>the pillows | one more</title>'),
    ('the one more mattress', 'the one more pillows'),
    ('wider than king. smarter than the rest.', 'set of 3. because math.'),
    ('$2,495', '$195'),
    ('img/mattress-overhead.jpg', 'img/pillows-product.jpg'),
    ('img/hero-bed.jpg', 'img/pillows-product.jpg'),
    ('img/mattress-layers.jpg', 'img/pillows-product.jpg'),
    ('145 lbs', '12 lbs'),
    ('84" W × 80" L × 12" H', 'Standard / King'),
    ('the hero product', 'set of three. because math.'),
    ('the standalone mattress.', 'the pillow set.')
]
content = replace_all(content, replacements_pillows)
with open('pillows.html', 'w') as f:
    f.write(content)

# FRAME
with open('frame.html', 'r') as f:
    content = f.read()

replacements_frame = [
    ('<title>the mattress | one more</title>', '<title>the bed frame | one more</title>'),
    ('the one more mattress', 'the one more bed frame'),
    ('wider than king. smarter than the rest.', 'minimal. modular. built to anchor a wider bed.'),
    ('$2,495', '$1,195'),
    ('img/mattress-overhead.jpg', 'img/frame-product.jpg'),
    ('img/hero-bed.jpg', 'img/frame-product.jpg'),
    ('img/mattress-layers.jpg', 'img/frame-product.jpg'),
    ('145 lbs', '180 lbs'),
    ('84" W × 80" L × 12" H', '88" W × 84" L × 14" H'),
    ('the hero product', 'anchor a wider bed'),
    ('the standalone mattress.', 'the standalone frame.')
]
content = replace_all(content, replacements_frame)
with open('frame.html', 'w') as f:
    f.write(content)

print("Done replacing data")
