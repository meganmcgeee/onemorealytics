// ============================================================
// content.js — ONE MORE DATA STORE
// Edit all site content here. Changes flow to all pages automatically.
// ============================================================

const CONTENT = {

  // ── SITE-WIDE ─────────────────────────────────────────────
  site: {
    brand: "one more",
    tagline: "always room for one more",
    year: "2026"
  },

  // ── NAVIGATION ────────────────────────────────────────────
  nav: {
    links: [
      { label: "home",         href: "index.html" },
      { label: "the mattress", href: "mattress.html" },
      { label: "shop",         href: "shop.html" },
      { label: "why one more", href: "why.html" },
      { label: "about",        href: "about.html" }
    ]
  },

  // ── FOOTER ────────────────────────────────────────────────
  footer: {
    tagline1: "always room for one more.",
    tagline2: "designed for how people actually sleep.",
    shopLinks: [
      { label: "all products",   href: "shop.html" },
      { label: "the mattress",   href: "mattress.html" },
      { label: "sheets",         href: "shop.html#sheets" },
      { label: "pillows",        href: "shop.html#pillows" },
      { label: "bed frame",      href: "shop.html#frame" }
    ],
    companyLinks: [
      { label: "about us",       href: "about.html" },
      { label: "why one more",   href: "why.html" },
      { label: "contact",        href: "#" },
      { label: "faq",            href: "#" }
    ],
    legalLinks: [
      { label: "privacy policy",     href: "#" },
      { label: "terms of service",   href: "#" },
      { label: "shipping & returns", href: "#" }
    ],
    copyright: "© 2026 one more. all rights reserved."
  },

  // ── HOME PAGE ─────────────────────────────────────────────
  home: {
    hero: {
      headline:    "one more",
      subheadline: "always room for one more",
      body:        "a wider, smarter mattress designed for how people actually sleep.",
      ctaText:     "shop the mattress",
      ctaHref:     "shop.html",
      footnote:    "designed by founders who've built mattresses before.",
      img:         "img/hero-bed.jpg",
      imgAlt:      "A luxurious wide bed in a serene bedroom with natural light"
    },
    philosophy: {
      eyebrow:  "the philosophy",
      headline: "beds were designed for two.\nweird flex, but okay.",
      intro:    "there is always one more:",
      body:     "one more partner. one more kid. one more dog. one more person you love.",
      closing:  "one more exists to make room—for all of it. whoever \"all of it\" includes."
    },
    collection: {
      eyebrow:  "the collection",
      headline: "a complete sleep system",
      products: [
        { name: "the mattress",  price: "$2,495", desc: "wider than king. smarter than the rest.",         img: "img/mattress-overhead.jpg", imgAlt: "the mattress",   href: "shop.html#mattress" },
        { name: "the sheets",    price: "$295",   desc: "custom-fit for extra room. breathable linen.",   img: "img/sheets-product.jpg",    imgAlt: "the sheets",    href: "shop.html#sheets" },
        { name: "the pillows",   price: "$195",   desc: "set of 3. because math.",                        img: "img/pillows-product.jpg",   imgAlt: "the pillows",   href: "shop.html#pillows" },
        { name: "the bed frame", price: "$1,195", desc: "minimal. modular. built to anchor a wider bed.", img: "img/frame-product.jpg",     imgAlt: "the bed frame", href: "shop.html#frame" }
      ],
      ctaText: "view all products",
      ctaHref: "shop.html"
    },
    features: {
      eyebrow:  "engineered for real life",
      headline: "designed for how people actually sleep",
      img:      "img/lifestyle-family.jpg",
      imgAlt:   "A family lounging comfortably on a wide mattress",
      items: [
        { num: "1", title: "wider than king",  desc: "extra room without feeling absurd" },
        { num: "2", title: "zoned support",    desc: "left, center, right—designed for different bodies" },
        { num: "3", title: "motion isolation", desc: "move without disturbing others" },
        { num: "4", title: "reinforced edges", desc: "no one feels like they're falling off" }
      ],
      ctaText: "explore the mattress",
      ctaHref: "mattress.html"
    }
  },

  // ── MATTRESS PAGE ─────────────────────────────────────────
  mattress: {
    hero: {
      eyebrow:  "the hero product",
      headline: "the one more mattress",
      body:     "wider than king. smarter than the rest. designed for however many people you share your bed with—partners, kids, pets, all of the above.",
      cta1Text: "shop now — $2,495",
      cta1Href: "shop.html",
      cta2Text: "learn more",
      cta2Href: "#features",
      img:      "img/mattress-overhead.jpg",
      imgAlt:   "Overhead view of the one more mattress"
    },
    features: {
      eyebrow:  "engineered for sharing",
      headline: "every layer, designed with intention",
      img:      "img/mattress-layers.jpg",
      imgAlt:   "Cross-section of the one more mattress showing support layers",
      items: [
        { title: "wider-than-king footprint", desc: "84 inches wide—20% more room than a standard king. enough space for everyone without feeling absurd." },
        { title: "three-zone support system", desc: "left zone, center zone, right zone. engineered for different bodies and sleep styles sharing the same surface." },
        { title: "advanced motion isolation", desc: "individually wrapped coils absorb movement. roll over, get up, or welcome a late-night visitor without disturbing anyone." },
        { title: "reinforced edge support",   desc: "high-density foam perimeter means no one feels like they're falling off the edge. every inch is usable." },
        { title: "cooling technology",        desc: "multiple sleepers generate more heat. graphite-infused memory foam and breathable cover keep everyone comfortable." }
      ]
    },
    specs: {
      eyebrow:  "specifications",
      headline: "the details",
      items: [
        { label: "dimensions",   value: '84" W × 80" L × 12" H' },
        { label: "weight",       value: "145 lbs" },
        { label: "firmness",     value: "medium (6/10)" },
        { label: "trial period", value: "120 nights" },
        { label: "warranty",     value: "lifetime limited" },
        { label: "shipping",     value: "free, compressed in box" }
      ]
    },
    cta: {
      headline: "ready to make room?",
      subline:  "120-night trial. free shipping. lifetime warranty.",
      ctaText:  "shop now — $2,495",
      ctaHref:  "shop.html",
      img:      "img/hero-bed.jpg",
      imgAlt:   "The one more mattress in a beautiful bedroom"
    }
  },

  // ── SHOP PAGE ─────────────────────────────────────────────
  shop: {
    hero: {
      headline: "the collection",
      body:     "a complete sleep system designed for how you actually rest—and whoever you rest with. everything works together. everything makes room."
    },
    products: [
      {
        id: "mattress",
        eyebrow: "the foundation of better (shared) sleep",
        name: "the one more mattress",
        body: "84 inches wide. zoned support for multiple sleepers—however many that means for you. motion isolation so nobody wakes up when someone rolls over. or joins late.",
        features: [
          'wider-than-king footprint (84" x 80")',
          "three-zone support system",
          "motion isolation technology",
          "reinforced edge support",
          "graphite-infused cooling foam"
        ],
        ctaText:  "add to cart — $2,495",
        price:    "$2,495",
        shipping: "free shipping · 120-night trial",
        img:      "img/mattress-overhead.jpg",
        imgAlt:   "the one more mattress",
        bg:       "bg-background"
      },
      {
        id: "sheets",
        eyebrow: "fit for the space you need",
        name: "the one more sheets",
        body: "custom-sized for the one more mattress. deep pockets that stay put. breathable, crisp organic cotton. available in warm, elevated neutrals.",
        features: [
          '84" width',
          '18" deep pockets',
          "100% organic cotton percale",
          "stays cool, stays tucked",
          "oeko-tex certified"
        ],
        ctaText:  "add to cart — $295",
        price:    "$295",
        shipping: "free shipping · 120-night trial",
        img:      "img/sheets-product.jpg",
        imgAlt:   "the one more sheets",
        bg:       "bg-cream-dark"
      },
      {
        id: "pillows",
        eyebrow: "set of three. because math.",
        name: "the one more pillows",
        body: "why stop at two? designed for multiple sleep positions and multiple sleepers. supportive but adaptable. meant to be shared, stacked, and fought over lovingly.",
        features: [
          "sold in sets of 3",
          "adjustable fill system",
          "fits all sleep positions",
          "organic cotton cover",
          "hypoallergenic materials"
        ],
        ctaText:  "add to cart — $195",
        price:    "$195",
        shipping: "free shipping · 120-night trial",
        img:      "img/pillows-product.jpg",
        imgAlt:   "the one more pillows",
        bg:       "bg-background"
      },
      {
        id: "frame",
        eyebrow: "anchor a wider bed",
        name: "the one more bed frame",
        body: "modular and minimal. built to support weight and movement. timeless design that anchors a wide bed beautifully. feels architectural, not trendy.",
        features: [
          "fits the one more mattress perfectly",
          "solid white oak construction",
          "tool-free assembly",
          "supports up to 1,200 lbs",
          "minimal, modular design"
        ],
        ctaText:  "add to cart — $1,195",
        price:    "$1,195",
        shipping: "free shipping · 120-night trial",
        img:      "img/frame-product.jpg",
        imgAlt:   "the one more bed frame",
        bg:       "bg-cream-dark"
      }
    ],
    bundle: {
      eyebrow:  "save when you bundle",
      headline: "the complete sleep system",
      body:     "mattress + sheets + pillows (3) + frame. everything you need for everyone you sleep with.",
      ctaText:  "shop the bundle — $3,995",
      savings:  "save $135 vs. buying separately"
    }
  },

  // ── WHY PAGE ──────────────────────────────────────────────
  why: {
    hero: {
      eyebrow:  "the philosophy",
      headline: "why one more",
      body:     "there is always one more: one more person. one more kid. one more dog. one more version of life."
    },
    story: {
      intro:    "we don't sleep the way we used to. families look different. relationships look different. love looks different. the rhythms of our nights have evolved. and yet, the beds we sleep in haven't kept pace.",
      headline: "sleep has changed",
      sections: [
        { title: "families have changed",    body: "kids climb in. pets claim their spot. partners—all of them—have different schedules, different needs. the boundaries of who shares a bed have expanded well beyond what any standard mattress was ever designed to accommodate." },
        { title: "relationships have changed",body: "some of us sleep with one partner. some with two. some with a rotating cast of humans and animals. some just really, really like to starfish. the old assumptions about what a bed is for—and who it's for—no longer apply." },
        { title: "beds haven't",             body: "king size was designed in the 1950s for a nuclear family that mostly no longer exists. california king added length, not width. the industry optimized for retail floors and delivery trucks, not for throuples or golden retrievers." }
      ]
    },
    solution: {
      eyebrow:  "the solution",
      headline: "one more makes room",
      items: [
        { label: "physical room:",  desc: "20% wider than a king. enough space for everyone who belongs there—however many that is." },
        { label: "emotional room:", desc: "designed without assumptions about who you are, who you love, how many people you love, or how you all sleep." },
        { label: "practical room:", desc: "engineered for the reality of multiple bodies, different schedules, and nights that don't follow anyone's script but yours." }
      ],
      ctaText: "explore the collection",
      ctaHref: "shop.html",
      img:     "img/lifestyle-family.jpg",
      imgAlt:  "A family comfortably sharing a wide bed"
    },
    quote: {
      text:   "we didn't set out to make a bigger mattress. we set out to make a mattress that fits how people actually live.",
      author: "— the one more team"
    }
  },

  // ── ABOUT PAGE ────────────────────────────────────────────
  about: {
    hero: {
      eyebrow:  "about one more",
      headline: "making room for modern life",
      body:     "we started one more because we saw a gap: the sleep industry wasn't designing for how people actually sleep. so we decided to build something better."
    },
    story: {
      eyebrow:  "our story",
      headline: "built by people who've done this before",
      body: [
        "one more was founded by an army of veterans—founders, operators, designers, and builders with deep experience in the sleep and direct-to-consumer space.",
        "we've launched mattresses before. we understand manufacturing, logistics, and customer trust. we know what works and what doesn't.",
        "this time, we're building with intention. not for everyone at once, but for the people who need what we make. a mattress designed for how people actually sleep."
      ],
      img:    "img/about-team.jpg",
      imgAlt: "The one more founding team working together"
    },
    values: {
      eyebrow:  "what we believe",
      headline: "our values",
      items: [
        { title: "intentional design",   desc: "every decision serves the person sleeping. no features for features' sake." },
        { title: "quiet confidence",     desc: "we let the product speak. no gimmicks, no loud claims, no borrowed credibility." },
        { title: "inclusive by default", desc: "designed for everyone—couples, throuples, families, and the pet that somehow ends up horizontal. room is room." },
        { title: "built to last",        desc: "materials and construction that age well. we're not interested in planned obsolescence." }
      ]
    },
    commitment: {
      headline: "our commitment",
      stats: [
        { value: "120",      label: "night trial" },
        { value: "free",     label: "shipping & returns" },
        { value: "lifetime", label: "limited warranty" }
      ],
      ctaText: "explore the collection",
      ctaHref: "shop.html"
    }
  }
};

// ── LANDING PAGES (SLEEP SCORE) ───────────────────────────────────────────

CONTENT['landing-score'] = {
  hero: {
    eyebrow: "the sleep score",
    headline: "chasing a number?\nstart with the surface.",
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
