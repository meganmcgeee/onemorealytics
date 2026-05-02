import sys

file_path = "campaign-generator.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Add the select box
select_box = """                    <div class="form-group">
                        <label>Brand Voice</label>
                        <select id="lp-tone-select" onchange="updateLPPreview()">
                            <option value="inclusive">Inclusive & Expansive (Default)</option>
                            <option value="direct">Direct & Practical</option>
                            <option value="warm">Warm & Rebellious</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Landing Page Type</label>
                        <select id="lp-type-select" onchange="updateLPPreview()">
                            <option value="sales">Sales Landing Page / Hero Page</option>
                            <option value="squeeze">Squeeze Page / Lead Capture</option>
                            <option value="clickthrough">Click-Through Landing Page</option>
                            <option value="launch">Product Launch Page</option>
                            <option value="advertorial">Advertorial Landing Page</option>
                            <option value="quiz">Quiz Page</option>
                            <option value="thankyou">Thank You / Confirmation Page</option>
                        </select>
                    </div>"""

content = content.replace("""                    <div class="form-group">
                        <label>Brand Voice</label>
                        <select id="lp-tone-select" onchange="updateLPPreview()">
                            <option value="inclusive">Inclusive & Expansive (Default)</option>
                            <option value="direct">Direct & Practical</option>
                            <option value="warm">Warm & Rebellious</option>
                        </select>
                    </div>""", select_box)


# 2. Modify getBoilerplate signature
content = content.replace(
    "function getBoilerplate(personaIndex, toneKey) {",
    "function getBoilerplate(personaIndex, toneKey, pageType = 'sales') {"
)

# 3. Update updateLPPreview()
update_lp_preview = """        function updateLPPreview() {
            const personaIndex = document.getElementById('lp-persona-select').value;
            const tone = document.getElementById('lp-tone-select').value;
            const pageType = document.getElementById('lp-type-select').value;
            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone, pageType);
        }"""
content = content.replace("""        function updateLPPreview() {
            const personaIndex = document.getElementById('lp-persona-select').value;
            const tone = document.getElementById('lp-tone-select').value;
            const iframe = document.getElementById('lp-canvas');
            iframe.srcdoc = getBoilerplate(personaIndex, tone);
        }""", update_lp_preview)

# 4. Modify canvasCode logic
canvas_logic_start = """            const finalTitle = tone.title ? tone.title + title : title;
            
            const canvasCode = `"""

canvas_logic_replacement = """            const finalTitle = tone.title ? tone.title + title : title;
            
            let canvasCode = '';

            if (pageType === 'squeeze') {
                canvasCode = `
                    <section class="section-padding bg-background w-full min-h-screen flex items-center justify-center text-center">
                        <div class="max-w-2xl px-4">
                            <h1 class="font-serif text-4xl md:text-5xl text-foreground leading-tight mb-6 editable" contenteditable="true" id="lp-hero-title">${finalTitle}</h1>
                            <p class="text-xl text-muted-foreground mb-8 leading-relaxed editable" contenteditable="true" id="lp-hero-sub">${sub}</p>
                            <div class="bg-card p-8 border border-border shadow-lg rounded-lg mt-8">
                                <h3 class="font-serif text-2xl mb-4 editable" contenteditable="true">Get 10% Off Your First Order</h3>
                                <div class="flex flex-col sm:flex-row gap-4">
                                    <input type="email" placeholder="Enter your email address" class="w-full px-4 py-3 border border-border rounded-sm focus:outline-none focus:border-foreground bg-background">
                                    <button class="btn-primary w-full sm:w-auto whitespace-nowrap editable" contenteditable="true">Claim Discount</button>
                                </div>
                                <p class="text-xs text-muted-foreground mt-4 italic">No spam, just better sleep.</p>
                            </div>
                        </div>
                    </section>
                `;
            } else if (pageType === 'clickthrough') {
                canvasCode = `
                    <section class="section-padding bg-cream-dark w-full text-center border-b border-border">
                        <div class="max-w-3xl mx-auto px-4">
                            <p class="eyebrow editable block mb-4" contenteditable="true">The Secret to Better Rest</p>
                            <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6 editable" contenteditable="true" id="lp-hero-title">${finalTitle}</h1>
                            <p class="text-xl text-muted-foreground mb-8 leading-relaxed editable" contenteditable="true" id="lp-hero-sub">${sub}</p>
                        </div>
                    </section>
                    <section class="section-padding bg-background w-full">
                        <div class="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div class="w-full aspect-[4/3] rounded-sm overflow-hidden shadow-md border border-border">
                                <img src="/img/mattress-layers.jpg" alt="Mattress" class="w-full h-full object-cover">
                            </div>
                            <div>
                                <h3 class="font-serif text-2xl text-foreground mb-4 editable" contenteditable="true">Why This Works</h3>
                                <p class="text-muted-foreground mb-8 leading-relaxed editable" contenteditable="true">${(persona && persona.marketing_features && persona.marketing_features[0]) ? persona.marketing_features[0].description : "A longer explanation building up to the product reveal."}</p>
                                <button class="btn-primary w-full text-lg py-4 editable shadow-xl transform transition hover:-translate-y-1" contenteditable="true">${tone.cta} &rarr;</button>
                            </div>
                        </div>
                    </section>
                `;
            } else if (pageType === 'launch') {
                canvasCode = `
                    <section class="section-padding bg-foreground text-background w-full min-h-[80vh] flex items-center justify-center text-center">
                        <div class="max-w-3xl px-4">
                            <p class="eyebrow editable block mb-4 text-secondary" contenteditable="true">New Product Launch</p>
                            <h1 class="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 editable" contenteditable="true" id="lp-hero-title">${finalTitle}</h1>
                            <p class="text-xl text-muted mb-8 leading-relaxed editable" contenteditable="true" id="lp-hero-sub">${sub}</p>
                            
                            <div class="grid grid-cols-4 gap-4 max-w-lg mx-auto mb-10">
                                <div class="bg-background/10 p-4 rounded-sm border border-border/20"><div class="text-3xl font-serif">03</div><div class="text-xs uppercase tracking-widest mt-1">Days</div></div>
                                <div class="bg-background/10 p-4 rounded-sm border border-border/20"><div class="text-3xl font-serif">14</div><div class="text-xs uppercase tracking-widest mt-1">Hrs</div></div>
                                <div class="bg-background/10 p-4 rounded-sm border border-border/20"><div class="text-3xl font-serif">59</div><div class="text-xs uppercase tracking-widest mt-1">Min</div></div>
                                <div class="bg-background/10 p-4 rounded-sm border border-border/20"><div class="text-3xl font-serif">20</div><div class="text-xs uppercase tracking-widest mt-1">Sec</div></div>
                            </div>
                            
                            <button class="bg-secondary text-foreground px-8 py-3 font-medium uppercase tracking-widest hover:opacity-90 transition-opacity editable" contenteditable="true">Pre-Order Now for 20% Off</button>
                        </div>
                    </section>
                `;
            } else if (pageType === 'advertorial') {
                canvasCode = `
                    <section class="section-padding bg-background w-full">
                        <div class="max-w-3xl mx-auto px-4">
                            <div class="flex items-center gap-4 mb-8 pb-4 border-b border-border">
                                <span class="text-xs font-bold uppercase tracking-widest text-muted-foreground">Sponsored Post</span>
                                <span class="text-xs text-muted-foreground">| By Health & Sleep Editorial</span>
                            </div>
                            <h1 class="font-serif text-4xl md:text-5xl text-foreground leading-tight mb-6 editable" contenteditable="true" id="lp-hero-title">How One Company Is Rethinking The "King Size" Bed</h1>
                            <div class="w-full aspect-[16/9] mb-8 rounded-sm overflow-hidden shadow-sm">
                                <img src="/img/hero-bed.jpg" alt="Family Bed" class="w-full h-full object-cover">
                            </div>
                            <p class="text-lg text-foreground font-medium mb-6 leading-relaxed editable" contenteditable="true" id="lp-hero-sub">${finalTitle}. ${sub}</p>
                            <p class="text-muted-foreground mb-6 leading-relaxed editable" contenteditable="true">For decades, the standard King size mattress was the pinnacle of luxury. But as modern families evolved, bringing pets, kids, and different sleeping schedules into the mix, the 76-inch standard suddenly felt cramped.</p>
                            <p class="text-muted-foreground mb-10 leading-relaxed editable" contenteditable="true">${(persona && persona.marketing_features && persona.marketing_features[1]) ? persona.marketing_features[1].description : "This is where 'One More' steps in."}</p>
                            <div class="bg-cream-dark p-8 border border-border text-center">
                                <h3 class="font-serif text-2xl mb-4 editable" contenteditable="true">Ready to upgrade your sleep?</h3>
                                <button class="btn-primary w-full sm:w-auto editable" contenteditable="true">See If You Qualify For A Trial</button>
                            </div>
                        </div>
                    </section>
                `;
            } else if (pageType === 'quiz') {
                canvasCode = `
                    <section class="section-padding bg-cream-dark w-full min-h-[90vh] flex items-center justify-center">
                        <div class="max-w-2xl w-full px-4">
                            <div class="w-full bg-border h-2 rounded-full mb-10 overflow-hidden">
                                <div class="bg-foreground h-full w-1/4"></div>
                            </div>
                            <h1 class="font-serif text-3xl md:text-4xl text-foreground leading-tight mb-4 text-center editable" contenteditable="true" id="lp-hero-title">What's your sleep style?</h1>
                            <p class="text-center text-muted-foreground mb-10 editable" contenteditable="true" id="lp-hero-sub">Help us match you with the perfect setup.</p>
                            
                            <div class="space-y-4">
                                <div class="border border-border bg-background p-6 rounded-lg cursor-pointer hover:border-foreground transition-colors flex items-center gap-4 group">
                                    <div class="w-6 h-6 rounded-full border border-border group-hover:border-foreground flex items-center justify-center"></div>
                                    <span class="text-lg font-medium editable" contenteditable="true">I sleep alone but sprawl out.</span>
                                </div>
                                <div class="border border-foreground bg-background p-6 rounded-lg cursor-pointer flex items-center gap-4 relative overflow-hidden">
                                    <div class="absolute top-0 left-0 w-1 h-full bg-foreground"></div>
                                    <div class="w-6 h-6 rounded-full border-4 border-foreground flex items-center justify-center"></div>
                                    <span class="text-lg font-medium editable" contenteditable="true">I share the bed with a partner.</span>
                                </div>
                                <div class="border border-border bg-background p-6 rounded-lg cursor-pointer hover:border-foreground transition-colors flex items-center gap-4 group">
                                    <div class="w-6 h-6 rounded-full border border-border group-hover:border-foreground flex items-center justify-center"></div>
                                    <span class="text-lg font-medium editable" contenteditable="true">Kids/pets constantly end up in my bed.</span>
                                </div>
                            </div>
                            
                            <div class="mt-10 flex justify-between items-center">
                                <button class="text-muted-foreground font-medium uppercase tracking-widest text-sm hover:text-foreground">Back</button>
                                <button class="btn-primary editable" contenteditable="true">Next Question &rarr;</button>
                            </div>
                        </div>
                    </section>
                `;
            } else if (pageType === 'thankyou') {
                canvasCode = `
                    <section class="section-padding bg-background w-full min-h-[80vh] flex items-center justify-center text-center">
                        <div class="max-w-xl px-4">
                            <div class="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mx-auto mb-8">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                            </div>
                            <h1 class="font-serif text-4xl md:text-5xl text-foreground leading-tight mb-4 editable" contenteditable="true" id="lp-hero-title">Thank you for your order!</h1>
                            <p class="text-xl text-muted-foreground mb-8 leading-relaxed editable" contenteditable="true" id="lp-hero-sub">Your new One More bed is being prepared. Order #OM-${Math.floor(Math.random() * 9000) + 1000}.</p>
                            
                            <div class="bg-cream-dark border border-border p-8 rounded-lg mt-8 text-left mb-8">
                                <h4 class="font-serif text-xl mb-4">What happens next?</h4>
                                <ul class="space-y-3 text-muted-foreground">
                                    <li class="flex gap-3"><span class="font-bold text-foreground">1.</span> We will process your order within 24 hours.</li>
                                    <li class="flex gap-3"><span class="font-bold text-foreground">2.</span> You will receive a tracking link via email.</li>
                                    <li class="flex gap-3"><span class="font-bold text-foreground">3.</span> Our white-glove team will contact you for delivery.</li>
                                </ul>
                            </div>
                            
                            <button class="btn-secondary w-full sm:w-auto editable" contenteditable="true">Continue Shopping</button>
                        </div>
                    </section>
                `;
            } else {
                canvasCode = `"""

content = content.replace(canvas_logic_start, canvas_logic_replacement)

# Finally, close the backtick and semicolon where the original canvasCode ended.
# The original ended right before return `<!DOCTYPE html>...
canvas_end_start = """                            </section>
            `;"""

canvas_end_replacement = """                            </section>
                `;
            }"""

content = content.replace(canvas_end_start, canvas_end_replacement)

with open(file_path, "w") as f:
    f.write(content)

