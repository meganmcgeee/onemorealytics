import os
import glob
import re

css_additions = """
/* Mobile Menu Overlay Classes */
.h-0\\.5 { height: 0.125rem; }
.w-5 { width: 1.25rem; }
.rounded-full { border-radius: 9999px; }
.mobile-menu-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: hsl(var(--background));
  z-index: 100;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  transform: translateX(100%);
  transition: transform 0.3s ease-in-out;
}
.mobile-menu-overlay.open {
  transform: translateX(0);
}
"""

with open("public/css/style.css", "a") as f:
    f.write(css_additions)

old_html = """      <!-- Mobile menu button -->
      <div class="lg:hidden flex items-center gap-4">
        <button class="nav-link text-sm tracking-wide text-foreground cart-btn-mobile" aria-label="cart">cart (<span class="cart-count">0</span>)</button>
        <button id="mobile-menu-btn" class="flex flex-col gap-1.5 p-2" aria-label="menu">
          <span class="w-6 h-px bg-foreground block transition-all"></span>
          <span class="w-6 h-px bg-foreground block transition-all"></span>
          <span class="w-4 h-px bg-foreground block transition-all"></span>
        </button>
      </div>
    </div>
  </nav>
  <!-- Mobile menu -->
  <div id="mobile-menu" class="hidden lg:hidden bg-background border-t border-border">
    <div class="container-padding py-6 flex flex-col gap-4">
      {{#nav.links}}
      <a href="{{href}}" class="nav-link text-sm tracking-wide text-foreground hover:opacity-60 transition-opacity">{{label}}</a>
              {{/nav.links}}
        <button class="nav-link text-sm tracking-wide transition-all duration-300 hover:opacity-60 text-muted-foreground cart-btn-desktop" aria-label="cart">cart (<span class="cart-count">0</span>)</button>
      </div>
  </div>"""

new_html = """      <!-- Mobile menu button -->
      <div class="lg:hidden flex items-center gap-4">
        <button class="nav-link text-sm tracking-wide text-foreground cart-btn-mobile" aria-label="cart">cart (<span class="cart-count">0</span>)</button>
        <button id="mobile-menu-btn" class="text-foreground flex flex-col gap-1.5 focus:outline-none p-1" aria-label="menu">
          <span class="block w-5 h-0.5 bg-foreground rounded-full"></span>
          <span class="block w-5 h-0.5 bg-foreground rounded-full"></span>
        </button>
      </div>
    </div>
  </nav>
  <!-- Mobile Menu Overlay -->
  <div id="mobile-menu" class="mobile-menu-overlay lg:hidden">
    <div class="flex justify-between items-center mb-12">
      <a href="/index.html" class="font-serif text-2xl text-foreground tracking-tight hover:opacity-70 transition-opacity">{{site.brand}}</a>
      <button id="close-mobile-menu" class="text-foreground p-2 focus:outline-none" aria-label="close menu">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"></path></svg>
      </button>
    </div>
    <nav class="flex flex-col gap-8 text-2xl font-serif text-foreground">
      {{#nav.links}}
      <a href="{{href}}" class="hover:opacity-70 transition-colors">{{label}}</a>
      {{/nav.links}}
    </nav>
  </div>"""

files = glob.glob("public/*.html")
count = 0
for file in files:
    if file == "public/pdp.html":
        continue
    with open(file, "r") as f:
        content = f.read()
    if old_html in content:
        content = content.replace(old_html, new_html)
        with open(file, "w") as f:
            f.write(content)
        count += 1
print(f"Replaced menu in {count} HTML files.")
