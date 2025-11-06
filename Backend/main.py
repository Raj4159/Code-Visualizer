import json
import re
from fastapi import FastAPI, Form, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
import time

app = FastAPI(title="Algorithm Visualization API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# # Configure Gemini API
# GEMINI_API_KEY = "AIzaSyCrB78zL3Rjm_SOLr_5CtoF9BN8jwYv9ZI"  # Get from https://makersuite.google.com/app/apikeys
# genai.configure(api_key=GEMINI_API_KEY)
# model = genai.GenerativeModel('models/gemini-2.0-flash-lite')

# ============================================================================
# PYDANTIC MODELS
# ============================================================================

class VisualizationResponse(BaseModel):
    json_data: dict
    success: bool
    error: str = None


# ============================================================================
# GEMINI CONFIGURATION
# ============================================================================

GEMINI_API_KEY = "AIzaSyCrB78zL3Rjm_SOLr_5CtoF9BN8jwYv9ZI"
genai.configure(api_key=GEMINI_API_KEY)


# Finish reason codes for debugging
FINISH_REASON_MAP = {
    1: "STOP - Normal completion",
    2: "MAX_TOKENS - Reached token limit",
    3: "SAFETY - Blocked by safety filters",
    4: "RECITATION - Recitation restriction",
    5: "OTHER - Other reason",
}


def call_gemini(prompt: str, max_retries: int = 2) -> str:
    """Call Gemini API with retry logic and better error handling"""
    for attempt in range(max_retries):
        try:
            print(f"\n🔄 Gemini Call Attempt {attempt + 1}/{max_retries}")
            
            model = genai.GenerativeModel("gemini-2.5-flash")
            response = model.generate_content(
                prompt,
                generation_config={
                    "temperature": 0,
                    "top_p": 0.95,
                    "top_k": 0,
                    "max_output_tokens": 4000,
                },
            )
            
            # Check finish reason
            finish_reason = response.candidates[0].finish_reason if response.candidates else None
            print(f"📊 Finish Reason: {FINISH_REASON_MAP.get(finish_reason, f'Unknown ({finish_reason})')}")
            
            # Handle empty response (finish_reason = 3 = SAFETY)
            if not response.text or response.text.strip() == "":
                if finish_reason == 3:  # SAFETY filter
                    print("⚠️  Response blocked by safety filter. Retrying with modified prompt...")
                    if attempt < max_retries - 1:
                        # Modify prompt to avoid safety issues
                        prompt = prompt.replace("Generate JSON NOW:", "Please generate the JSON visualization:") + "\n\nReturn ONLY valid JSON."
                        time.sleep(1)  # Brief delay before retry
                        continue
                    else:
                        raise ValueError("Gemini safety filter blocking responses")
                else:
                    print("⚠️  Empty response from Gemini")
                    if attempt < max_retries - 1:
                        time.sleep(1)
                        continue
                    else:
                        raise ValueError("Gemini returned empty response after multiple attempts")
            
            return response.text
            
        except Exception as e:
            error_msg = str(e)
            print(f"❌ Attempt {attempt + 1} failed: {error_msg}")
            
            if attempt < max_retries - 1:
                print("⏳ Waiting 1 second before retry...")
                time.sleep(1)
                continue
            else:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Gemini API Error after {max_retries} attempts: {error_msg}"
                )


def extract_json_from_response(response: str) -> dict:
    """Extract JSON from response, handling markdown code blocks and edge cases"""
    if not response or not response.strip():
        raise ValueError("Empty response from API")
    
    # Try direct parse first
    try:
        return json.loads(response)
    except json.JSONDecodeError:
        pass

    # Try extracting from markdown code block
    json_match = re.search(r'```(?:json)?\s*([\s\S]*?)```', response)
    if json_match:
        try:
            return json.loads(json_match.group(1))
        except json.JSONDecodeError as e:
            print(f"⚠️  JSON in code block is invalid: {e}")

    # Try extracting JSON object pattern (greedy)
    json_match = re.search(r'\{[\s\S]*\}', response)
    if json_match:
        try:
            return json.loads(json_match.group(0))
        except json.JSONDecodeError:
            print(f"⚠️  Extracted JSON object is invalid")

    # Last resort: try to find valid JSON by character count
    try:
        # Find first { and last }
        start = response.find('{')
        end = response.rfind('}')
        if start != -1 and end != -1 and start < end:
            potential_json = response[start:end+1]
            return json.loads(potential_json)
    except json.JSONDecodeError:
        pass

    raise ValueError(f"No valid JSON found in response. Response preview: {response[:200]}")


# ============================================================================
# ALGORITHM TYPE DETECTION
# ============================================================================

def detect_algorithm_type(code: str, question: str = "") -> str:
    """Detect algorithm type from code or question"""
    combined_text = (code + " " + question).lower()

    # Pointer algorithms
    if any(keyword in combined_text for keyword in ["two pointer", "binary search", "merge", "left", "right pointer", "pointer"]):
        return "pointer"

    # Sorting algorithms
    if any(keyword in combined_text for keyword in ["sort", "bubble", "selection", "quick", "merge sort", "swap", "compare"]):
        return "sorting"

    # Sliding window algorithms
    if any(keyword in combined_text for keyword in ["sliding window", "window", "subarray", "substring", "max sum", "min length"]):
        return "sliding-window"

    return "pointer"  # Default


# ============================================================================
# PROMPT BUILDERS
# ============================================================================

POINTER_ALGORITHM_TEMPLATE = """Generate visualization JSON for this pointer-based algorithm.

CRITICAL REQUIREMENTS:
1. Generate 10-20+ steps minimum - NEVER fewer than 10
2. Show EVERY comparison and pointer movement
3. Track array states accurately
4. Show pointer positions at each step
5. Match sample output exactly
6. ONLY output JSON - NO other text
7. JSON MUST be valid - NO syntax errors

ALGORITHM: {algorithm_name}

CODE:
{code}

SAMPLE INPUT:
{sample_input}

EXPECTED OUTPUT:
{sample_output}

Use this JSON structure:
{{
  "meta": {{
    "type": "pointer",
    "title": "{algorithm_name}",
    "complexity": {{"time": "O(n)", "space": "O(1)"}}
  }},
  "steps": [
    {{
      "id": 0,
      "arrays": [{{"id": "arr", "label": "arr", "values": [], "highlights": []}}],
      "pointers": [{{"name": "left", "arrayId": "arr", "index": 0}}],
      "description": "Initialize..."
    }}
  ]
}}

Output JSON only:"""

SORTING_ALGORITHM_TEMPLATE = """Generate visualization JSON for this sorting algorithm.

CRITICAL REQUIREMENTS:
1. Generate 10-20+ steps - NEVER fewer
2. Show EVERY comparison
3. Show EVERY swap with array update
4. Track sorted elements
5. Match final output exactly
6. ONLY output JSON
7. Valid JSON only

ALGORITHM: {algorithm_name}

CODE:
{code}

SAMPLE INPUT:
{sample_input}

EXPECTED OUTPUT:
{sample_output}

Use this structure:
{{
  "meta": {{
    "type": "sorting",
    "title": "{algorithm_name}",
    "complexity": {{"time": "O(n²)", "space": "O(1)"}}
  }},
  "steps": [
    {{
      "id": 0,
      "array": [],
      "comparing": [0, 1],
      "sorted": [],
      "swap": null,
      "description": "..."
    }}
  ]
}}

Output JSON only:"""

SLIDING_WINDOW_TEMPLATE = """Generate visualization JSON for this sliding window algorithm.

CRITICAL REQUIREMENTS:
1. Generate 10+ steps
2. Show every window position
3. Update window indices correctly
4. Match sample output exactly
5. ONLY output JSON
6. Valid JSON only

ALGORITHM: {algorithm_name}

CODE:
{code}

SAMPLE INPUT:
{sample_input}

EXPECTED OUTPUT:
{sample_output}

Use this structure:
{{
  "meta": {{
    "type": "sliding-window",
    "title": "{algorithm_name}",
    "complexity": {{"time": "O(n)", "space": "O(1)"}}
  }},
  "steps": [
    {{
      "id": 0,
      "array": [],
      "window": [0, 2],
      "description": "..."
    }}
  ]
}}

Output JSON only:"""


# ============================================================================
# MAIN API ENDPOINTS
# ============================================================================

@app.post("/api/visualize")
async def visualize_algorithm(
    code: str = Form(...),
    question: str = Form(default=""),
    sample_input: str = Form(...),
    sample_output: str = Form(...),
    algorithm_type: str = Form(default="auto"),
) -> VisualizationResponse:
    """
    Generate visualization JSON for algorithm code
    """
    print("\n" + "=" * 80)
    print("📨 RECEIVED REQUEST")
    print("=" * 80)
    print(f"Question: {question[:100] if question else 'N/A'}")
    print(f"Algorithm Type: {algorithm_type}")

    # Auto-detect if needed
    if algorithm_type == "auto":
        algorithm_type = detect_algorithm_type(code, question)
        print(f"🔍 Auto-detected: {algorithm_type}")

    # Build algorithm name
    algorithm_name = question if question else "Algorithm Visualization"

    # Select template based on type
    if algorithm_type == "pointer":
        template = POINTER_ALGORITHM_TEMPLATE
    elif algorithm_type == "sorting":
        template = SORTING_ALGORITHM_TEMPLATE
    elif algorithm_type == "sliding-window":
        template = SLIDING_WINDOW_TEMPLATE
    else:
        template = POINTER_ALGORITHM_TEMPLATE

    # Format the prompt
    prompt = template.format(
        algorithm_name=algorithm_name,
        code=code,
        sample_input=sample_input,
        sample_output=sample_output,
    )

    print("\n" + "=" * 80)
    print("🔄 SENDING TO GEMINI 2.5 FLASH...")
    print("=" * 80)
    print(f"Prompt length: {len(prompt)} characters")
    print(f"Algorithm Type: {algorithm_type}")

    try:
        # Call Gemini with retry logic
        response = call_gemini(prompt)

        print("\n" + "=" * 80)
        print("📝 RAW RESPONSE (first 1000 chars):")
        print("=" * 80)
        print(response[:1000] + "\n...[truncated]" if len(response) > 1000 else response)

        # Extract and validate JSON
        json_data = extract_json_from_response(response)

        print("\n" + "=" * 80)
        print("✅ JSON EXTRACTION SUCCESSFUL")
        print("=" * 80)

        # ====== VALIDATION PHASE ======
        print("\n🔍 VALIDATION PHASE:")

        # Check required fields
        if "meta" not in json_data:
            raise ValueError("Missing 'meta' field")
        if "steps" not in json_data:
            raise ValueError("Missing 'steps' field")

        # Check steps array
        if not isinstance(json_data.get("steps"), list) or len(json_data["steps"]) == 0:
            raise ValueError("'steps' must be a non-empty array")

        steps_count = len(json_data["steps"])
        print(f"✓ Step count: {steps_count}", end="")
        if steps_count < 10:
            print(f" ⚠️  WARNING: Only {steps_count} steps (minimum 10 recommended)")
        else:
            print(" ✓ OK")

        # Validate first step structure
        first_step = json_data["steps"][0]
        print(f"✓ First step ID: {first_step.get('id')}")

        # Check for algorithm-specific fields
        if algorithm_type == "pointer":
            if "arrays" not in first_step:
                raise ValueError("Pointer algorithms must have 'arrays' field")
            print("✓ Pointer algorithm fields present")

        elif algorithm_type == "sorting":
            if "array" not in first_step:
                raise ValueError("Sorting algorithms must have 'array' field")
            print("✓ Sorting algorithm fields present")

        elif algorithm_type == "sliding-window":
            if "array" not in first_step or "window" not in first_step:
                raise ValueError("Sliding window algorithms must have 'array' and 'window' fields")
            print("✓ Sliding window algorithm fields present")

        # Check description field
        if "description" not in first_step:
            raise ValueError("Step missing required 'description' field")
        print("✓ Required step fields present")

        print("\n" + "=" * 80)
        print("✅ ALL VALIDATIONS PASSED")
        print("=" * 80)

        return VisualizationResponse(json_data=json_data, success=True)

    except json.JSONDecodeError as e:
        error_msg = f"JSON Parse Error: {str(e)}"
        print(f"\n❌ {error_msg}")
        return VisualizationResponse(json_data={}, success=False, error=error_msg)

    except ValueError as e:
        error_msg = f"Validation Error: {str(e)}"
        print(f"\n❌ {error_msg}")
        return VisualizationResponse(json_data={}, success=False, error=error_msg)

    except HTTPException as e:
        error_msg = f"API Error: {e.detail}"
        print(f"\n❌ {error_msg}")
        return VisualizationResponse(json_data={}, success=False, error=error_msg)

    except Exception as e:
        error_msg = f"Unexpected Error: {str(e)}"
        print(f"\n❌ {error_msg}")
        return VisualizationResponse(json_data={}, success=False, error=error_msg)


@app.post("/api/visualize/file")
async def visualize_from_file(
    file: UploadFile = File(...),
    question: str = Form(...),
    sample_input: str = Form(...),
    sample_output: str = Form(...),
) -> VisualizationResponse:
    """
    Generate visualization from uploaded code file
    """
    try:
        code_content = await file.read()
        code = code_content.decode("utf-8")

        return await visualize_algorithm(
            code=code,
            question=question,
            sample_input=sample_input,
            sample_output=sample_output,
            algorithm_type="auto",
        )
    except Exception as e:
        return VisualizationResponse(
            json_data={}, success=False, error=f"File processing error: {str(e)}"
        )


@app.get("/api/health")
async def health_check():
    """Check API status"""
    return {
        "status": "healthy",
        "api": "Google Gemini",
        "model": "gemini-2.5-flash",
        "message": "Algorithm Visualization API is ready",
    }


@app.get("/")
async def root():
    """API information"""
    return {
        "name": "Algorithm Visualization API",
        "version": "4.1",
        "model": "Gemini 2.5 Flash",
        "note": "Generates precise step-by-step JSON visualizations",
        "endpoints": {
            "POST /api/visualize": "Generate from code text",
            "POST /api/visualize/file": "Generate from uploaded file",
            "GET /api/health": "Health check",
        },
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)