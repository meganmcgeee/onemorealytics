import sys
import json
from apify_client import ApifyClient

def scrape_tiktok_apify(hashtag="mattress", limit=25, output_file="scraped_tiktok.json"):
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    # Initialize the ApifyClient with your Apify API token
    APIFY_API_TOKEN = os.environ.get("APIFY_API_TOKEN")
    
    if APIFY_API_TOKEN == "YOUR_APIFY_API_TOKEN":
        print("Apify API Token not found. Skipping TikTok data...")
        return False
        
    print(f"Starting Apify TikTok Scraper (clockworks/tiktok-scraper) for hashtag: #{hashtag}...")
    
    client = ApifyClient(APIFY_API_TOKEN)

    # Prepare the Actor input
    run_input = {
        "hashtags": [hashtag],
        "resultsPerPage": limit,
        "maxFollowersPerProfile": 0,
        "maxFollowingPerProfile": 0,
        "commentsPerPost": 0,
        "topLevelCommentsPerPost": 0,
        "maxRepliesPerComment": 0,
        "proxyCountryCode": "None",
    }

    try:
        # Run the Actor and wait for it to finish
        print("Scraper started! Waiting for completion... (this may take a minute or two)")
        run = client.actor("clockworks/tiktok-scraper").call(run_input=run_input)
        print("Scraping completed!")

        # Format the data similarly to our Reddit data so Gemini can read it
        formatted_posts = []
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            formatted_posts.append({
                "source": "TikTok",
                "author": f"@{item.get('authorMeta', {}).get('name', 'unknown')}",
                "body": item.get('text', ''),
                "upvotes": str(item.get('diggCount', 0)),
                "video_url": item.get('webVideoUrl', '')
            })
            
        print(f"Successfully scraped {len(formatted_posts)} TikToks.")
        
        # Save or append the data
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
    scrape_tiktok_apify(hashtag=target)
