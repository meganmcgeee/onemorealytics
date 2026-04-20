# one more — Editable Static Site

## Project Structure

```
one-more/
├── content.js        ← ✏️  EDIT ALL CONTENT HERE
├── index.html        ← Home page
├── mattress.html     ← Mattress product page
├── shop.html         ← Full shop / all products
├── why.html          ← Why One More philosophy
├── about.html        ← About the company
├── css/
│   └── style.css     ← All styles & design tokens
├── js/
│   └── main.js       ← Mustache renderer + site behaviour
└── img/              ← Image assets (download from site or replace)
    ├── hero-bed.jpg
    ├── mattress-overhead.jpg
    ├── mattress-layers.jpg
    ├── sheets-product.jpg
    ├── pillows-product.jpg
    ├── frame-product.jpg
    ├── lifestyle-family.jpg
    └── about-team.jpg
```

## How Content Editing Works

All copy, prices, headlines, links, and product data live in **`content.js`** — one JavaScript object called `CONTENT`.

### To edit text:
Open `content.js` and find the section you want to change. For example, to change the hero headline on the home page:

```js
home: {
  hero: {
    headline: "one more",       // ← change this
    subheadline: "always room for one more",  // ← or this
    body: "a wider, smarter mattress...",
    ctaText: "shop the mattress",
    ctaHref: "shop.html",
    ...
  }
```

### To change prices:
```js
shop: {
  products: [
    {
      name: "the one more mattress",
      ctaText: "add to cart — $2,495",   // ← update price here
      ...
    }
```

### To change images:
Replace the image files in the `img/` folder (keep the same filenames), or update the `img` path in `content.js`:
```js
hero: {
  img: "img/hero-bed.jpg",  // ← update path here
```

## Templating: Mustache.js

Pages use [Mustache.js](https://github.com/janl/mustache.js) for templating. Templates are embedded in `<script type="text/x-mustache">` tags and rendered into the page by `js/main.js`.

- `{{variable}}` outputs a value from `content.js`
- `{{#array}}...{{/array}}` loops over an array
- `{{#block}}...{{/block}}` renders a conditional block

Mustache.js is loaded from a CDN (no build step needed).

## Getting Images

The site references images that should be downloaded from the live site and placed in the `img/` folder:

| File | URL |
|------|-----|
| hero-bed.jpg | https://onemoreathome.com/assets/hero-bed-D6Y4kybx.jpg |
| mattress-overhead.jpg | https://onemoreathome.com/assets/mattress-overhead-B9hC2tRI.jpg |
| mattress-layers.jpg | https://onemoreathome.com/assets/mattress-layers-BVIZrbK9.jpg |
| sheets-product.jpg | https://onemoreathome.com/assets/sheets-product-CtRbVKrP.jpg |
| pillows-product.jpg | https://onemoreathome.com/assets/pillows-product-CLfxfE55.jpg |
| frame-product.jpg | https://onemoreathome.com/assets/frame-product-BDbLNXMw.jpg |
| lifestyle-family.jpg | https://onemoreathome.com/assets/lifestyle-family-BQxxYed7.jpg |
| about-team.jpg | https://onemoreathome.com/assets/about-team-ARpm6kLB.jpg |

## Running Locally

Open any HTML file directly in a browser, or use a simple static server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

> **Note:** Open via a server (not file://) to ensure scripts load correctly in all browsers.

## Design Tokens

Edit colours, fonts and spacing in `css/style.css` under `:root { ... }`:

```css
:root {
  --background:    40 30% 97%;   /* warm off-white */
  --foreground:    30 10% 15%;   /* near-black charcoal */
  --cream-dark:    38 25% 92%;   /* section background */
  --font-serif: "Playfair Display", Georgia, serif;
  --font-sans:  "DM Sans", system-ui, sans-serif;
  --section-padding:   clamp(4rem, 10vw, 8rem);
  --container-padding: clamp(1.5rem, 5vw, 4rem);
}
```
