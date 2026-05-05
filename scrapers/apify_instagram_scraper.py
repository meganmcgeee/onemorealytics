import sys
import json
from apify_client import ApifyClient

def scrape_instagram_apify(hashtag="mattress", limit=25, output_file="public/data/scraped_instagram.json"):
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    APIFY_API_TOKEN = os.environ.get("APIFY_API_TOKEN")
    
    print(f"Starting Apify Instagram Scraper for hashtag: #{hashtag}...")
    client = ApifyClient(APIFY_API_TOKEN)

    run_input = {
        "search": hashtag,
        "searchType": "hashtag",
        "resultsLimit": limit,
    }

    try:
        print("Instagram Scraper started! Waiting for completion...")
        run = client.actor("apify/instagram-scraper").call(run_input=run_input)
        
        formatted_posts = []
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            text = item.get('caption', '')
            if text:
                formatted_posts.append({
                    "source": "Instagram",
                    "author": f"@{item.get('ownerUsername', 'unknown')}",
                    "body": text,
                    "upvotes": str(item.get('likesCount', 0)),
                    "video_url": item.get('url', '')
                })
            
        print(f"Successfully scraped {len(formatted_posts)} Instagram posts.")
        
        try:
            with open(output_file, "r") as f:
                existing_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            existing_data = []
            
        existing_data.extend(formatted_posts)
        with open(output_file, "w") as f:
            json.dump(existing_data, f, indent=4)
            
        return True
    except Exception as e:
        print(f"Error communicating with Apify API: {e}")
        return False

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "mattress"
    scrape_instagram_apify(hashtag=target)
