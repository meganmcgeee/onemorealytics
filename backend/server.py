import http.server
import socketserver
import json
import subprocess
import threading
import os

PORT = int(os.environ.get("PORT", 3000))

# Global state for progress tracking
status_lock = threading.Lock()
current_status = "Idle"
is_synthesizing = False

def update_status(msg):
    global current_status
    with status_lock:
        current_status = msg
        print(f"Status: {msg}")

def run_persona_builder_async():
    try:
        update_status("Structuring 3 distinct personas based on your edits...")
        subprocess.run(['python3', 'backend/gemini_persona_builder.py'], check=True)
        update_status("Personas Generated!")
    except Exception as e:
        update_status(f"Error: {str(e)}")

def run_pipeline_async(sources):
    global is_synthesizing
    try:
        update_status("Initializing pipeline...")
        
        # 0. Clear out the scraped posts from the last run
        for file in ["public/data/scraped_posts.json", "public/data/scraped_reddit.json", "public/data/scraped_instagram.json", "public/data/scraped_tiktok.json", "public/data/scraped_reviews.json", "public/data/scraped_facebook.json"]:
            if os.path.exists(file):
                os.remove(file)
            
        # Parse source strings or dicts into normalized objects
        source_objects = []
        for s in sources:
            if isinstance(s, dict):
                source_objects.append(s)
            elif isinstance(s, str):
                if ":" in s:
                    sid, kw = s.split(":", 1)
                    source_objects.append({"id": sid, "keyword": kw})
                else:
                    source_objects.append({"id": s, "keyword": "mattress"})
                    
        source_ids = [s.get('id') for s in source_objects]
        
        # Build dynamic scanning string based on selected sources
        scanning_parts = []
        if "instagram" in source_ids: scanning_parts.append("Scanning IG")
        if "tiktok" in source_ids: scanning_parts.append("Scanning TikTok")
        if "facebook" in source_ids: scanning_parts.append("Scanning Facebook")
        if "reddit" in source_ids: scanning_parts.append("Scanning Reddit")
        if "amazon_reviews" in source_ids: scanning_parts.append("Scanning Amazon")
        if "onemore_reviews" in source_ids: scanning_parts.append("Scanning OneMore Store")
        
        scanning_msg = ", ".join(scanning_parts) + "..."
        update_status(scanning_msg)
        
        # 1. Start all scrapers in PARALLEL
        processes = []
        
        for source_obj in source_objects:
            sid = source_obj.get('id')
            kw = source_obj.get('keyword', 'mattress')
            
            if sid == "reddit":
                p = subprocess.Popen(['python3', 'scrapers/live_reddit_scraper.py', kw])
                processes.append(("Reddit", p))
                
            elif sid == "instagram":
                p = subprocess.Popen(['python3', 'scrapers/apify_instagram_scraper.py', kw])
                processes.append(("Instagram", p))
                
            elif sid == "tiktok":
                p = subprocess.Popen(['python3', 'scrapers/apify_tiktok_scraper.py', kw])
                processes.append(("TikTok", p))
                
            elif sid == "facebook":
                p = subprocess.Popen(['python3', 'scrapers/apify_facebook_scraper.py', kw])
                processes.append(("Facebook", p))
                
            elif sid == "amazon_reviews":
                p = subprocess.Popen(['python3', 'scrapers/apify_reviews_scraper.py', kw])
                processes.append(("Amazon Reviews", p))
                
            elif sid == "onemore_reviews":
                p = subprocess.Popen(['python3', 'scrapers/onemore_reviews_scraper.py'])
                processes.append(("OneMore Reviews", p))
            
        # Wait for all to finish
        for name, p in processes:
            p.wait()
            
        update_status("Merging scraped data...")
        all_posts = []
        for file in ["public/data/scraped_reddit.json", "public/data/scraped_instagram.json", "public/data/scraped_tiktok.json", "public/data/scraped_reviews.json", "public/data/scraped_facebook.json"]:
            if os.path.exists(file):
                try:
                    with open(file, "r", encoding="utf-8") as f:
                        all_posts.extend(json.load(f))
                except Exception as e:
                    print(f"Error reading {file}: {e}")
        
        with open("public/data/scraped_posts.json", "w", encoding="utf-8") as f:
            json.dump(all_posts, f, indent=4)
            
        # 2. Run Gemini AI
        update_status("Creating profile...")
        subprocess.run(['python3', 'backend/gemini_synthesizer.py'], check=True)
        
        update_status("Complete")
    except Exception as e:
        update_status(f"Error: {e}")
    finally:
        is_synthesizing = False

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory="public", **kwargs)
    def do_GET(self):
        global current_status
        
        # Status Polling Endpoint
        if self.path == '/api/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            with status_lock:
                self.wfile.write(json.dumps({"status": current_status}).encode())
            return
            
        # Automatically append .html for clean URLs, just like npx serve does
        if self.path != '/' and not '.' in self.path.split('/')[-1] and not self.path.startswith('/api/'):
            self.path += '.html'
        return super().do_GET()

    def do_POST(self):
        global is_synthesizing
        if self.path == '/api/synthesize':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data)
                sources = data.get('sources', [])
                
                if is_synthesizing:
                    self.send_response(400)
                    self.send_header('Access-Control-Allow-Origin', '*')
                    self.end_headers()
                    self.wfile.write(b'{"error": "Pipeline already running"}')
                    return
                
                is_synthesizing = True
                
                # Start the background thread
                threading.Thread(target=run_pipeline_async, args=(sources,)).start()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
                
            except Exception as e:
                is_synthesizing = False
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                
        elif self.path == '/api/generate_personas':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                edited_data = json.loads(post_data)
                with open("public/data/edited_profile.json", "w", encoding="utf-8") as f:
                    json.dump(edited_data, f, indent=4)
                    
                threading.Thread(target=run_persona_builder_async).start()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode())
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode())
                
        else:
            self.send_error(404, "Endpoint not found")

    def do_OPTIONS(self):
        # Handle CORS preflight requests
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

# Start the server
socketserver.TCPServer.allow_reuse_address = True
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Demo Server running on http://localhost:{PORT}")
    print("Press Ctrl+C to stop.")
    httpd.serve_forever()
