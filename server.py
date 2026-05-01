import http.server
import socketserver
import json
import subprocess
import threading
import os

PORT = 3000

# Global state for progress tracking
status_lock = threading.Lock()
current_status = "Idle"
is_synthesizing = False

def update_status(msg):
    global current_status
    with status_lock:
        current_status = msg
        print(f"Status: {msg}")

def run_pipeline_async(sources):
    global is_synthesizing
    try:
        update_status("Initializing pipeline...")
        
        # 0. Clear out the scraped posts from the last run
        for file in ["scraped_posts.json", "scraped_reddit.json", "scraped_instagram.json", "scraped_tiktok.json", "scraped_reviews.json", "scraped_facebook.json"]:
            if os.path.exists(file):
                os.remove(file)
            
        # Build dynamic scanning string based on selected sources
        scanning_parts = []
        if "instagram" in sources: scanning_parts.append("Scanning IG")
        if "tiktok" in sources: scanning_parts.append("Scanning TikTok")
        if "facebook" in sources: scanning_parts.append("Scanning Facebook")
        if "reddit" in sources: scanning_parts.append("Scanning Reddit")
        if "reviews" in sources: scanning_parts.append("Scanning your customer reviews")
        
        scanning_msg = ", ".join(scanning_parts) + "..."
        update_status(scanning_msg)
        
        # 1. Start all scrapers in PARALLEL
        processes = []
        
        if "reddit" in sources:
            p = subprocess.Popen(['python3', 'live_reddit_scraper.py', 'sleep+Mattress'])
            processes.append(("Reddit", p))
            
        if "instagram" in sources:
            p = subprocess.Popen(['python3', 'apify_instagram_scraper.py', 'mattress'])
            processes.append(("Instagram", p))
            
        if "tiktok" in sources:
            p = subprocess.Popen(['python3', 'apify_tiktok_scraper.py', 'mattress'])
            processes.append(("TikTok", p))
            
        if "facebook" in sources:
            p = subprocess.Popen(['python3', 'apify_facebook_scraper.py', 'mattress'])
            processes.append(("Facebook", p))
            
        if "reviews" in sources:
            p = subprocess.Popen(['python3', 'apify_reviews_scraper.py'])
            processes.append(("Store Reviews", p))
            
        # Wait for all to finish
        for name, p in processes:
            p.wait()
            
        update_status("Merging scraped data...")
        all_posts = []
        for file in ["scraped_reddit.json", "scraped_instagram.json", "scraped_tiktok.json", "scraped_reviews.json", "scraped_facebook.json"]:
            if os.path.exists(file):
                try:
                    with open(file, "r", encoding="utf-8") as f:
                        all_posts.extend(json.load(f))
                except Exception as e:
                    print(f"Error reading {file}: {e}")
        
        with open("scraped_posts.json", "w", encoding="utf-8") as f:
            json.dump(all_posts, f, indent=4)
            
        # 2. Run Gemini AI
        update_status("Creating profile...")
        subprocess.run(['python3', 'gemini_synthesizer.py'], check=True)
        
        update_status("Complete")
    except Exception as e:
        update_status(f"Error: {e}")
    finally:
        is_synthesizing = False

class Handler(http.server.SimpleHTTPRequestHandler):
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
