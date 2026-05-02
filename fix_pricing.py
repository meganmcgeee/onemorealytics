import sys

file_path = "campaign-generator.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Update the price calculation logic
old_card = """                                                <div class="res-product-card">
                                                    ${discountOffer ? `<div style="position: absolute; top: 0.5rem; right: 0.5rem; background: var(--accent); color: var(--primary-foreground); padding: 0.25rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: bold; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${discountOffer}</div>` : ''}
                                                    <img src="/${p.img}" alt="${p.imgAlt}" class="res-product-img">
                                                    <div class="res-product-info">
                                                        <div class="res-product-name">${p.name}</div>
                                                        <div class="res-product-price">${discountOffer ? `<s>${p.price}</s> <span style="color: var(--accent); font-weight: bold; margin-left: 4px;">Sale</span>` : p.price}</div>
                                                    </div>
                                                </div>"""

new_card = """                                                ${(() => {
                                                    let newPrice = p.price;
                                                    let isDiscounted = false;
                                                    if (discountOffer) {
                                                        let originalNum = parseFloat(p.price.replace(/[^0-9.]/g, ''));
                                                        let discountNum = parseFloat(discountOffer.replace(/[^0-9.]/g, ''));
                                                        if (!isNaN(originalNum) && !isNaN(discountNum)) {
                                                            let newNum = originalNum;
                                                            if (discountOffer.includes('%')) {
                                                                newNum = originalNum * (1 - (discountNum / 100));
                                                            } else {
                                                                newNum = originalNum - discountNum;
                                                            }
                                                            if (newNum < 0) newNum = 0;
                                                            newPrice = '$' + Math.round(newNum).toLocaleString('en-US');
                                                            isDiscounted = true;
                                                        } else if (discountOffer.toLowerCase().includes('free')) {
                                                            newPrice = 'Free';
                                                            isDiscounted = true;
                                                        }
                                                    }
                                                    return `
                                                    <div class="res-product-card">
                                                        ${discountOffer ? `<div style="position: absolute; top: 0.5rem; right: 0.5rem; background: var(--accent); color: var(--primary-foreground); padding: 0.25rem 0.6rem; border-radius: 1rem; font-size: 0.75rem; font-weight: bold; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${discountOffer}</div>` : ''}
                                                        <img src="/${p.img}" alt="${p.imgAlt}" class="res-product-img">
                                                        <div class="res-product-info">
                                                            <div class="res-product-name">${p.name}</div>
                                                            <div class="res-product-price">
                                                                ${isDiscounted ? `<s>${p.price}</s> <span style="color: var(--accent); font-weight: bold; margin-left: 6px;">${newPrice}</span>` : p.price}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    `;
                                                })()}"""

content = content.replace(old_card, new_card)

# 2. Fix the layout to look good for 1 product or 2 products
old_css1 = ".res-product-grid { display: flex; flex-wrap: wrap; justify-content: center; gap: 1.5rem; margin-bottom: 1.5rem; }"
old_css2 = ".res-product-card { border: 1px solid var(--border); border-radius: 0.5rem; overflow: hidden; background: var(--card); flex: 0 1 240px; max-width: 100%; position: relative; }"

new_css1 = ".res-product-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem; max-width: 600px; margin-left: auto; margin-right: auto; }"
new_css2 = ".res-product-card { border: 1px solid var(--border); border-radius: 0.5rem; overflow: hidden; background: var(--card); width: 100%; position: relative; display: flex; flex-direction: column; }"
content = content.replace(old_css1, new_css1)
content = content.replace(old_css2, new_css2)

with open(file_path, "w") as f:
    f.write(content)
