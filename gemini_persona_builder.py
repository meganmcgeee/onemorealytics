import json
import os
import sys

try:
    from google import genai
except ImportError:
    print("Error: The 'google.genai' library is not installed.")
    sys.exit(1)

def build_personas(input_file="edited_profile.json", output_file="ai_personas.json"):
    from dotenv import load_dotenv
    load_dotenv()
    
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Error: You need to paste your actual Gemini API key into the script.")
        sys.exit(1)
        
    client = genai.Client(api_key=api_key)
    
    try:
        with open(input_file, "r", encoding="utf-8") as f:
            edited_data = json.load(f)
    except FileNotFoundError:
        print(f"Error: Could not find {input_file}.")
        sys.exit(1)
        
    print(f"Loaded edited profile data. Sending to Gemini to generate 3 specific personas...")
    
    prompt = f"""
    You are an expert audience researcher and marketing strategist for a brand called "One More".
    "One More" is a premium lifestyle brand. Their tagline is "always room for one more."
    
    I will provide you with a high-level "Audience Profile" that was reviewed and edited by a marketing manager.
    Your task is to take this overarching profile and break it down into exactly 3 distinct, specific "Buyer Personas" in JSON format.
    
    CRITICAL SEGMENTATION RULE: You MUST analyze the provided audience profile and organically split the audience into exactly 3 distinct, specific segments based on their unique demographics, use cases, or pain points found in the data. Do NOT use generic placeholder segments.
    
    Your JSON output MUST exactly match this structure (a single array containing 3 objects):
    [
      {{
        "persona": "A catchy title for this persona (e.g., The Exhausted Over-Researcher)",
        "demographics": {{
          "age_range": "Estimated age range",
          "lifestyle": "A sentence describing their lifestyle"
        }},
        "core_problem": "A paragraph explaining their specific slice of the overarching problem",
        "pain_points": [ "Pain point 1", "Pain point 2", "Pain point 3" ],
        "desired_outcomes": [ "Outcome 1", "Outcome 2" ],
        "brand_angle": "How 'One More' specifically targets THIS persona.",
        "marketing_hero_headline": "A short, punchy 3-8 word website hero headline speaking DIRECTLY to the customer (e.g. 'Never Negotiate for Space Again.')",
        "marketing_hero_subtitle": "A persuasive 1-2 sentence website sub-headline speaking DIRECTLY to the customer using 'You', offering them a solution.",
        "marketing_features": [
            {{ "title": "Catchy Feature/Benefit Title 1", "description": "How the 'One More' brand specifically solves their first major pain point." }},
            {{ "title": "Catchy Feature/Benefit Title 2", "description": "How the 'One More' brand specifically delivers their desired outcome." }},
            {{ "title": "Catchy Feature/Benefit Title 3", "description": "A feature addressing another core concern or objection." }}
        ],
        "power_phrases": [ "Exact quote 1", "Exact quote 2" ],
        "effective_community_solutions": [ "Solution 1" ]
      }}
    ]
    
    IMPORTANT INSTRUCTIONS: 
    - Output ONLY valid JSON array containing exactly 3 distinct personas.
    - Base the 3 personas entirely on the themes, pain points, and power phrases provided in the edited profile data below.
    - Distribute the power phrases and pain points among the 3 personas logically.
    - MAKE IT SUCCINCT: Your outputs are being injected directly into Landing Page headers and Meta Ad copy. 
      - `pain_points` and `desired_outcomes` MUST be extremely short and punchy (3-8 words max per item, e.g. "Stop falling off the edge").
      - `brand_angle` MUST be a single, short, punchy sentence.
      - `core_problem` MUST be a single sentence.
    
    Here is the edited Audience Profile data:
    {json.dumps(edited_data)}
    """
    
    import time
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=prompt,
            )
            break
        except Exception as e:
            if attempt < max_retries - 1:
                print(f"API Error (Attempt {attempt + 1}/{max_retries}): {e}. Retrying in {2 ** attempt} seconds...")
                time.sleep(2 ** attempt)
            else:
                print(f"Error calling Gemini API: {e}")
                sys.exit(1)
    
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
        print(f"✨ Success! Synthesized 3 personas saved to {output_file}")
    except json.JSONDecodeError:
        print("Error: Gemini did not return valid JSON. Raw response:")
        print(response.text)

if __name__ == "__main__":
    build_personas()
