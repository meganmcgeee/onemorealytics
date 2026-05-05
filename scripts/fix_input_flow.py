import sys

file_path = "campaign-generator.html"
with open(file_path, "r") as f:
    content = f.read()

# 1. Fix the CSS for the input
old_css = """    input[type="email"], input[type="text"], select { width: 100%; padding: 1.25rem 1.5rem; border: 1px solid var(--muted-foreground); border-radius: 0.5rem; background: #ffffff; font-family: inherit; font-size: 1.1rem; color: var(--foreground); box-sizing: border-box; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); transition: border-color 0.2s, box-shadow 0.2s; }
    input[type="email"]:focus, input[type="text"]:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 2px rgba(200, 100, 50, 0.2); }"""

new_css = """    input[type="email"], input[type="text"], select { width: 100%; padding: 1.25rem 1.5rem; border: 1px solid hsl(var(--border)); border-radius: 0.5rem; background: #ffffff; font-family: inherit; font-size: 1.1rem; color: hsl(var(--foreground)); box-sizing: border-box; box-shadow: 0 2px 5px rgba(0,0,0,0.05); transition: border-color 0.2s, box-shadow 0.2s; }
    input[type="email"]:focus, input[type="text"]:focus, select:focus { outline: none; border-color: hsl(var(--accent)); box-shadow: 0 0 0 2px hsla(var(--accent), 0.2); }"""

content = content.replace(old_css, new_css)


# 2. Update the HTML to have an ID for the form area, and add a javascript click handler for the button
old_form = """                                    <div class="px-2">
                                        <label class="block text-sm font-medium text-foreground mb-2 text-center">Where should we send your 1-click purchase link?</label>
                                        <input type="text" placeholder="Email or Mobile Number" class="w-full text-center">
                                    </div>
                                    <button class="btn-primary w-full py-4 text-lg editable mt-2" contenteditable="true">Hold My Mattress</button>
                                </div>
                                <p class="text-xs text-muted-foreground mt-4 text-center italic">No charge today. Guaranteed inventory for 24 hours when the sale starts.</p>"""

new_form = """                                    <div id="reservation-form-area" class="w-full flex flex-col gap-4">
                                        <div class="px-2">
                                            <label class="block text-sm font-medium text-foreground mb-2 text-center">Where should we send your 1-click purchase link?</label>
                                            <input type="text" id="reservation-contact" placeholder="Email or Mobile Number" class="w-full text-center mb-2 shadow-sm focus:ring-2 focus:ring-accent transition-all" style="background-color: white; border: 1px solid #ddd; padding: 1.25rem; border-radius: 0.5rem;">
                                        </div>
                                        <button onclick="submitReservation()" class="btn-primary w-full py-4 text-lg editable" contenteditable="true">Hold My Mattress</button>
                                        <p class="text-xs text-muted-foreground mt-2 text-center italic">No charge today. Guaranteed inventory for 24 hours when the sale starts.</p>
                                    </div>
                                    <div id="reservation-success-area" style="display: none;" class="w-full text-center py-6 px-4 bg-secondary rounded-lg border border-border">
                                        <i class="fa-solid fa-circle-check text-4xl text-accent mb-4"></i>
                                        <h3 class="font-serif text-2xl mb-2 text-foreground">You're Locked In</h3>
                                        <p class="text-muted-foreground">We've saved your spot. Watch your inbox/phone for your 1-click purchase link the moment the sale goes live.</p>
                                    </div>
                                    <script>
                                        function submitReservation() {
                                            const input = document.getElementById('reservation-contact');
                                            if (!input.value.trim()) {
                                                input.style.borderColor = 'red';
                                                input.placeholder = 'Please enter email or phone';
                                                return;
                                            }
                                            document.getElementById('reservation-form-area').style.display = 'none';
                                            document.getElementById('reservation-success-area').style.display = 'block';
                                        }
                                    </script>"""

content = content.replace(old_form, new_form)

with open(file_path, "w") as f:
    f.write(content)
