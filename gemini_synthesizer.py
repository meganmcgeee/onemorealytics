import json
import os
import sys

# Try to import the new Google GenAI SDK
try:
    from google import genai
except ImportError:
    print("Error: The 'google.genai' library is not installed.")
    print("Please install it by running: pip3 install google.genai")
    sys.exit(1)

def synthesize_audience(input_file="scraped_posts.json", output_file="ai_synthesized_profile.json"):
    import os
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: You need to paste your actual Gemini API key into the script.")
        print("Open gemini_synthesizer.py and edit line 15.")
        sys.exit(1)
        
    # Initialize the new Client
    client = genai.Client(api_key=api_key)
    
    # 2. Load the scraped Reddit data
    try:
        with open(input_file, "r", encoding="utf-8") as f:
            posts = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find {input_file}. Run the scraper first.")
        sys.exit(1)
        
    print(f"Loaded {len(posts)} posts. Sending to Gemini for analysis... (This takes a few seconds)")
    
    # 3. Construct the prompt for Gemini
    prompt = f"""
    You are an expert audience researcher and marketing strategist for a brand called "One More".
    "One More" is a premium lifestyle brand. Their tagline is "always room for one more."
    
    I will provide you with a JSON array of recent social media posts, comments, and reviews. 
    Analyze these posts deeply and synthesize a highly accurate "Audience Persona Profile" in JSON format, specifically tailored to show how "One More" can target these people based exactly on what they are discussing.
    
    Your JSON output MUST exactly match this structure:
    {{
      "persona": "A catchy title for this persona (e.g., The Exhausted Over-Researcher)",
      "demographics": {{
        "age_range": "Estimated age range based on context",
        "lifestyle": "A sentence describing their lifestyle, frustrations, and occupation trends"
      }},
      "core_problem": "A paragraph explaining their main overarching problem and emotional state",
      "pain_points": [ "Pain point 1", "Pain point 2", "Pain point 3", "Pain point 4", "Pain point 5" ],
      "desired_outcomes": [ "Outcome 1", "Outcome 2", "Outcome 3" ],
      "brand_angle": "How 'One More' specifically can position itself to solve their problem, referencing the brand ethos.",
      "power_phrases": [ "Exact quote 1 from the data", "Exact quote 2", "Exact quote 3", "Exact quote 4" ],
      "effective_community_solutions": [ "Solution 1", "Solution 2", "Solution 3" ],
      "action_triggers": [ "Trigger 1", "Trigger 2", "Trigger 3" ],
      "emotional_state": {{
        "emotion_1": {{"name": "Emotion Name (e.g. Frustrated)", "percentage": 85}},
        "emotion_2": {{"name": "Emotion Name", "percentage": 60}},
        "emotion_3": {{"name": "Emotion Name", "percentage": 40}},
        "summary": "A 1-sentence summary of their emotional state"
      }},
      "data_source_stats": {{
        "total_analyzed": "Number of posts/comments you analyzed (count the JSON items)",
        "sources": "Where these likely came from (e.g. 'Reddit communities', 'Facebook groups')",
        "filtering_criteria": "A brief explanation of what these posts have in common and how they were filtered"
      }}
    }}
    
    IMPORTANT INSTRUCTIONS: 
    - Output ONLY valid JSON. Do not include markdown formatting like ```json or ```.
    - Ensure the 'power_phrases' are DIRECT QUOTES from the provided posts.
    - MAKE IT SUCCINCT: Your outputs are injected into Landing Pages. `pain_points` and `desired_outcomes` MUST be extremely short and punchy (3-8 words max per item). `brand_angle` MUST be a single short sentence. `core_problem` MUST be a single sentence.
    
    Here is the data to analyze:
    {json.dumps(posts)}
    """
    
    # 4. Call the Gemini API (using the new syntax and latest model)
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        sys.exit(1)
    
    # 5. Clean and save the JSON output
    cleaned_json = response.text.strip()
    if cleaned_json.startswith("```json"):
        cleaned_json = cleaned_json[7:]
    if cleaned_json.endswith("```"):
        cleaned_json = cleaned_json[:-3]
    cleaned_json = cleaned_json.strip()
    
    try:
        parsed_data = json.loads(cleaned_json)
        with open(output_file, "w", encoding="utf-8") as f:
            json.dump(parsed_data, f, indent=4)
        print(f"✨ Success! Synthesized profile saved to {output_file}")
    except json.JSONDecodeError:
        print("Error: Gemini did not return valid JSON. Here is the raw response:")
        print(response.text)

if __name__ == "__main__":
    synthesize_audience()
