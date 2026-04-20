import os
import re

dir_path = '.'

# 1. Add Data to content.js
content_append = """

// ── LANDING PAGES (SLEEP SCORE) ───────────────────────────────────────────

CONTENT['landing-score'] = {
  hero: {
    eyebrow: "the sleep score",
    headline: "chasing a number?\\nstart with the surface.",
    body: "your tracker tells you you're tossing and turning. it doesn't tell you why. the one more mattress is engineered to fix the physical variables that ruin your sleep score.",
    ctaText: "shop the mattress",
    ctaHref: "shop.html",
    img: "img/mattress-overhead.jpg",
    imgAlt: "the one more mattress"
  },
  metrics: {
    headline: "what actually moves the needle",
    items: [
      { num: "1", title: "temperature regulation", desc: "graphite-infused foam lowers your core temp to trigger deep sleep." },
      { num: "2", title: "uninterrupted cycles", desc: "advanced motion isolation means their movement doesn't kill your rem." },
      { num: "3", title: "zero pressure", desc: "zoned support eliminates the pressure points that cause midnight tossing." }
    ]
  }
};

CONTENT['landing-athlete'] = {
  hero: {
    eyebrow: "readiness starts here",
    headline: "recovery is a physical act.",
    body: "your sleep score is a mirror of your recovery. the one more mattress provides the foundation for maximum deep sleep and athletic readiness.",
    ctaText: "get the mattress",
    ctaHref: "mattress.html",
    img: "img/hero-bed.jpg",
    imgAlt: "athlete resting"
  }
};

CONTENT['landing-challenge'] = {
  hero: {
    headline: "the 120-night score challenge.",
    body: "we believe the one more mattress will fundamentally alter your sleep data. track your score for 120 nights. if it doesn't improve, send it back."
  },
  challenge: {
    title: "the guarantee",
    desc: "120 nights to see the data change. free shipping. free returns. no questions asked."
  }
};

CONTENT['landing-science'] = {
  science: {
    eyebrow: "the science of your score",
    headline: "why your sleep score is stuck.",
    pillars: [
      { title: "the temperature trap", body: "if your bed sleeps hot, your heart rate variability (hrv) plummets. our breathable cover and cooling layers pull heat away from the body." },
      { title: "micro-awakenings", body: "you don't remember them, but your tracker does. every time your partner moves on a standard spring mattress, your sleep cycle is interrupted. one more isolates motion perfectly." },
      { title: "cramped quarters", body: "we move 40+ times a night. when you're restricted by a standard king's footprint, your body tenses. our 20% wider footprint lets you naturally sprawl." }
    ]
  }
};

CONTENT['landing-couples'] = {
  couples: {
    headlineLeft: "their sleep score...",
    bodyLeft: "they go to bed late. they roll over constantly. they sleep incredibly warm. their habits dictate the mattress environment.",
    headlineRight: "...ruining your sleep score?",
    bodyRight: "the one more mattress is 84 inches wide with independent zoning and perfect motion isolation. so you can sleep in the same bed, but keep your sleep data to yourself."
  }
};

CONTENT['landing-minimal'] = {
  minimal: {
    headline: "good sleep shouldn't feel like a test you're failing.",
    body: "stop obsessing over the number on your wrist. start sleeping on a surface designed for actual human rest. wider, smarter, quieter."
  }
};
"""

content_js_path = os.path.join(dir_path, 'content.js')
with open(content_js_path, 'r', encoding='utf-8') as f:
    js_content = f.read()

if "LANDING PAGES (SLEEP SCORE)" not in js_content:
    with open(content_js_path, 'a', encoding='utf-8') as f:
        f.write(content_append)


# 2. Extract base template from index.html
with open(os.path.join(dir_path, 'index.html'), 'r', encoding='utf-8') as f:
    index_html = f.read()

# We want everything before <main>
header_part = index_html.split('<main>')[0]
# We want everything after </main>
footer_part = index_html.split('</main>')[1]

# 3. Define the 6 layouts inside <main>

layouts = {
    'landing-score.html': """
    <div id="page-content"></div>
    <script type="text/x-mustache" data-target="page-content">
    <section class="section-padding bg-background mt-20">
      <div class="container-padding max-w-6xl mx-auto">
        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <p class="eyebrow mb-4">{{pageData.hero.eyebrow}}</p>
            <h1 class="font-serif text-5xl lg:text-6xl text-foreground mb-6 leading-tight" style="white-space:pre-line">{{pageData.hero.headline}}</h1>
            <p class="text-lg text-muted-foreground mb-10 leading-relaxed">{{pageData.hero.body}}</p>
            <a href="{{pageData.hero.ctaHref}}" class="btn-primary">{{pageData.hero.ctaText}}</a>
          </div>
          <div>
            <img src="{{pageData.hero.img}}" alt="{{pageData.hero.imgAlt}}" class="w-full h-auto rounded-sm shadow-xl" />
          </div>
        </div>
      </div>
    </section>
    <section class="section-padding border-t border-border bg-cream-dark">
      <div class="container-padding max-w-5xl mx-auto">
        <h2 class="font-serif text-3xl md:text-4xl text-center mb-16">{{pageData.metrics.headline}}</h2>
        <div class="grid md:grid-cols-3 gap-12 text-center">
          {{#pageData.metrics.items}}
          <div class="p-8 bg-background rounded-sm shadow-sm border border-border">
            <div class="text-5xl font-serif text-foreground/20 mb-6">{{num}}</div>
            <h3 class="text-xl font-medium text-foreground mb-3">{{title}}</h3>
            <p class="text-sm text-muted-foreground leading-relaxed">{{desc}}</p>
          </div>
          {{/pageData.metrics.items}}
        </div>
      </div>
    </section>
    </script>
""",
    'landing-athlete.html': """
    <div id="page-content"></div>
    <script type="text/x-mustache" data-target="page-content">
    <section class="relative min-h-screen flex items-center bg-foreground text-background">
      <div class="absolute inset-0 z-0 bg-foreground/90">
        <img src="{{pageData.hero.img}}" alt="{{pageData.hero.imgAlt}}" class="w-full h-full object-cover mix-blend-multiply opacity-50" />
      </div>
      <div class="relative z-10 container-padding w-full text-center">
        <p class="eyebrow text-background/60 tracking-[0.2em] mb-6">{{pageData.hero.eyebrow}}</p>
        <h1 class="font-serif text-6xl md:text-8xl mb-8 text-background">{{pageData.hero.headline}}</h1>
        <p class="text-xl max-w-2xl mx-auto mb-12 text-background/80 leading-relaxed">{{pageData.hero.body}}</p>
        <a href="{{pageData.hero.ctaHref}}" class="btn-primary" style="background: hsl(var(--background)); color: hsl(var(--foreground));">{{pageData.hero.ctaText}}</a>
      </div>
    </section>
    </script>
""",
    'landing-challenge.html': """
    <div id="page-content"></div>
    <script type="text/x-mustache" data-target="page-content">
    <section class="section-padding bg-background min-h-screen flex items-center pt-32">
      <div class="container-padding w-full max-w-3xl mx-auto text-center">
         <h1 class="font-serif text-5xl md:text-7xl mb-8 leading-tight">{{pageData.hero.headline}}</h1>
         <p class="text-xl text-muted-foreground mb-16 leading-relaxed">{{pageData.hero.body}}</p>
         <div class="bg-cream-dark p-12 lg:p-16 border border-border rounded-sm shadow-sm relative overflow-hidden">
           <div class="absolute inset-x-0 top-0 h-1 bg-foreground"></div>
           <h2 class="text-3xl font-serif mb-6">{{pageData.challenge.title}}</h2>
           <p class="text-lg text-muted-foreground mb-10">{{pageData.challenge.desc}}</p>
           <a href="shop.html" class="btn-primary">start your 120 nights</a>
         </div>
      </div>
    </section>
    </script>
""",
    'landing-science.html': """
    <div id="page-content"></div>
    <script type="text/x-mustache" data-target="page-content">
    <section class="section-padding bg-cream-dark pt-40 min-h-screen">
      <div class="container-padding max-w-3xl mx-auto">
        <p class="eyebrow text-center mb-4">{{pageData.science.eyebrow}}</p>
        <h1 class="font-serif text-5xl md:text-6xl text-center mb-20">{{pageData.science.headline}}</h1>
        <div class="space-y-16">
          {{#pageData.science.pillars}}
          <div class="border-l-4 border-foreground pl-8 py-2">
            <h3 class="text-3xl font-serif mb-4 text-foreground">{{title}}</h3>
            <p class="text-lg text-muted-foreground leading-relaxed">{{body}}</p>
          </div>
          {{/pageData.science.pillars}}
        </div>
        <div class="mt-20 text-center">
          <a href="mattress.html" class="btn-primary">explore the mattress</a>
        </div>
      </div>
    </section>
    </script>
""",
    'landing-couples.html': """
    <div id="page-content"></div>
    <script type="text/x-mustache" data-target="page-content">
    <section class="min-h-screen bg-background flex flex-col pt-20">
      <div class="flex-1 grid lg:grid-cols-2">
         <div class="bg-foreground text-background p-12 lg:p-24 flex flex-col justify-center relative">
           <h1 class="font-serif text-5xl md:text-6xl mb-8 leading-tight">{{pageData.couples.headlineLeft}}</h1>
           <p class="text-xl text-background/70 leading-relaxed max-w-md">{{pageData.couples.bodyLeft}}</p>
         </div>
         <div class="bg-cream-dark p-12 lg:p-24 flex flex-col justify-center">
           <h1 class="font-serif text-5xl md:text-6xl text-foreground mb-8 leading-tight">{{pageData.couples.headlineRight}}</h1>
           <p class="text-xl text-muted-foreground mb-12 leading-relaxed max-w-md">{{pageData.couples.bodyRight}}</p>
           <div><a href="shop.html" class="btn-primary">fix your shared score</a></div>
         </div>
      </div>
    </section>
    </script>
""",
    'landing-minimal.html': """
    <div id="page-content"></div>
    <script type="text/x-mustache" data-target="page-content">
    <section class="h-screen flex items-center justify-center bg-background text-center px-4">
      <div class="max-w-4xl mx-auto">
        <h1 class="font-serif text-5xl md:text-7xl leading-tight mb-10">{{pageData.minimal.headline}}</h1>
        <p class="text-xl text-muted-foreground mb-16 max-w-2xl mx-auto">{{pageData.minimal.body}}</p>
        <a href="mattress.html" class="btn-outline">explore the mattress</a>
      </div>
    </section>
    </script>
"""
}

# 4. Write them all
for filename, main_content in layouts.items():
    dataset_page_name = filename.replace('.html', '')
    
    # Change body dataset-page
    custom_header = header_part.replace('data-page="home"', f'data-page="{dataset_page_name}"')
    
    # Fix the title
    custom_header = re.sub(r'<title>.*?</title>', f'<title>{dataset_page_name} | one more</title>', custom_header)

    final_html = custom_header + "\n  <main>\n" + main_content + "\n  </main>\n" + footer_part
    
    with open(os.path.join(dir_path, filename), 'w', encoding='utf-8') as f:
        f.write(final_html)

print("Generated 6 landing pages!")
