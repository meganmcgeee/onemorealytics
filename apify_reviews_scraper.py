import sys
import json
from apify_client import ApifyClient

def scrape_amazon_reviews(asin="B012H0K93I", limit=30, output_file="scraped_reviews.json"):
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    # Using Zinus Green Tea Mattress ASIN as a proxy for mattress reviews
    APIFY_API_TOKEN = os.environ.get("APIFY_API_TOKEN")
    
    print(f"Starting Apify Amazon Reviews Scraper for ASIN: {asin}...")
    client = ApifyClient(APIFY_API_TOKEN)

    run_input = {
        "productUrls": [{"url": f"https://www.amazon.com/dp/{asin}"}],
        "maxReviews": limit,
    }

    try:
        print("Reviews Scraper started! Waiting for completion...")
        run = client.actor("junglee/amazon-reviews-scraper").call(run_input=run_input)
        
        formatted_posts = []
        for item in client.dataset(run["defaultDatasetId"]).iterate_items():
            text = item.get('reviewDescription', '')
            title = item.get('reviewTitle', '')
            if text:
                formatted_posts.append({
                    "source": "Store Review",
                    "author": "Verified Buyer",
                    "body": f"[{item.get('ratingScore', 5)} Stars] {title} - {text}",
                    "upvotes": str(item.get('helpfulCount', 0)),
                    "video_url": ""
                })
            
        print(f"Successfully scraped {len(formatted_posts)} Reviews.")
        
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
    scrape_amazon_reviews()
