import sys
import json
from apify_client import ApifyClient

def scrape_facebook_apify(keyword="mattress", limit=20, output_file="scraped_facebook.json"):
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    # Initialize the ApifyClient with your Apify API token
    APIFY_API_TOKEN = os.environ.get("APIFY_API_TOKEN")
    
    print(f"Starting Apify Facebook Scraper for keyword: {keyword}...")
    client = ApifyClient(APIFY_API_TOKEN)

    # Prepare the Actor input using apify/facebook-groups-scraper or posts scraper
    run_input = {
        "startUrls": [{"url": f"https://www.facebook.com/search/posts/?q={keyword}"}],
        "resultsLimit": limit,
    }

    print("Facebook Scraper started! Waiting for completion...")
    
    # Run the Actor and wait for it to finish
    # Using a common facebook scraper
    run = client.actor("apify/facebook-posts-scraper").call(run_input=run_input)
    
    print("Scraping completed!")
    
    formatted_posts = []
    
    # Fetch and format Actor results
    for item in client.dataset(run["defaultDatasetId"]).iterate_items():
        if item.get("text"):
            formatted_posts.append({
                "source": "Facebook",
                "author": item.get("user", {}).get("name", "Unknown"),
                "body": item.get("text", ""),
                "upvotes": str(item.get("likes", 0)),
                "url": item.get("url", "")
            })

    print(f"Successfully scraped {len(formatted_posts)} Facebook posts.")

    if len(formatted_posts) > 0:
        try:
            with open(output_file, "r", encoding="utf-8") as f:
                existing_data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            existing_data = []
            
        existing_data.extend(formatted_posts)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(existing_data, f, indent=4)

if __name__ == "__main__":
    target = sys.argv[1] if len(sys.argv) > 1 else "mattress"
    scrape_facebook_apify(keyword=target)
