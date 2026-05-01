import urllib.request
import urllib.error
import json
import time
from datetime import datetime

def get_relative_time(timestamp):
    """Convert a UNIX timestamp to a relative 'days ago' format."""
    now = time.time()
    diff = now - timestamp
    days = int(diff / (60 * 60 * 24))
    if days == 0:
        return "today"
    elif days == 1:
        return "1 day ago"
    else:
        return f"{days} days ago"

def scrape_reddit(subreddit="sleep", limit=25, time_filter="month"):
    print(f"Fetching real data from r/{subreddit}...")
    
    # Reddit blocks default python-urllib user agents. 
    # We must provide a custom one to pretend we are a real browser/bot.
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    url = f"https://www.reddit.com/r/{subreddit}/top.json?limit={limit}&t={time_filter}"
    req = urllib.request.Request(url, headers=headers)
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
    except urllib.error.URLError as e:
        print(f"Failed to fetch data: {e}")
        return

    posts = data.get('data', {}).get('children', [])
    
    formatted_posts = []
    
    for post in posts:
        post_data = post['data']
        
        # Skip stickied posts or empty text posts
        if post_data.get('stickied'):
            continue
            
        body = post_data.get('selftext', '').strip()
        if not body:
            continue
            
        formatted_post = {
            "title": post_data.get('title', ''),
            "author": f"u/{post_data.get('author', '[deleted]')}",
            "time": get_relative_time(post_data.get('created_utc', time.time())),
            "body": body,
            "upvotes": str(post_data.get('score', 0)),
            "downvotes": "0" # Reddit API doesn't expose exact downvotes anymore
        }
        
        formatted_posts.append(formatted_post)
        
    print(f"Successfully scraped {len(formatted_posts)} valid text posts.")
    
    # Save the data to our existing json file format
    output_file = "scraped_reddit.json"
    try:
        with open(output_file, "r", encoding="utf-8") as f:
            existing = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        existing = []
        
    existing.extend(formatted_posts)
    
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(existing, f, indent=4, ensure_ascii=False)
        
    print(f"Data saved successfully to {output_file}!")

if __name__ == "__main__":
    import sys
    target_subreddit = "sleep+Mattress"
    if len(sys.argv) > 1:
        target_subreddit = sys.argv[1]
    
    scrape_reddit(subreddit=target_subreddit, limit=100, time_filter="month")
