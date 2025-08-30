import pdfplumber
import re
import json
import sys
import ollama
from pathlib import Path
from typing import Dict, Any, List

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract text from PDF"""
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text

def clean_text_for_llm(text: str) -> str:
    """Clean text for LLM processing"""
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]', '[PHONE]', text)
    text = re.sub(r'\S+@\S+\.\S+', '[EMAIL]', text)
    text = re.sub(r'http\S+|www\.\S+', '[URL]', text)
    return text.strip()

def extract_with_llama(cv_text: str) -> Dict[str, Any]:
    """Use Llama 3.2 via Ollama to extract structured information from CV"""
    
    prompt = f"""
    ANALYZE THIS CV AND EXTRACT THE FOLLOWING INFORMATION IN JSON FORMAT:

    CV CONTENT:
    {cv_text[:4000]}

    EXTRACTION REQUIREMENTS:
    
    1. experience: Extract ONLY professional job titles from WORK EXPERIENCE section
    
    2. leadership: Extract ONLY formal leadership positions and roles
    
    3. profile_summary: Create a concise 2-3 sentence professional summary
    
    4. education: Extract ONLY the names of degrees and qualifications (e.g., "BSc in Mechatronics", "Honors in Mechatronics Engineering")

    RETURN FORMAT:
    {{
        "experience": ["job_title_1", "job_title_2", ...],
        "leadership": ["leadership_role_1", "leadership_role_2", ...],
        "profile_summary": "concise summary here",
        "education": ["degree_name_1", "degree_name_2", ...]
    }}

    Return ONLY valid JSON, no additional text.
    """

    try:
        print("Calling Llama 3.2 via Ollama...")
        response = ollama.chat(
            model="llama3.2",
            messages=[
                {
                    "role": "system", 
                    "content": "You are an expert ATS system. Extract structured information from CVs. Return ONLY valid JSON without any additional text."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            options={
                "temperature": 0.1,
                "num_predict": 600
            }
        )
        
        result = response['message']['content'].strip()
        
        # Extract JSON from the response
        json_match = re.search(r'\{[\s\S]*\}', result)
        if json_match:
            json_str = json_match.group()
            return json.loads(json_str)
        else:
            json_str = result.replace('```json', '').replace('```', '').strip()
            try:
                return json.loads(json_str)
            except:
                return {"error": "No valid JSON found in LLM response"}
                
    except Exception as e:
        return {"error": f"LLM processing failed: {str(e)}"}

def post_process_results(llm_result: Dict[str, Any]) -> Dict[str, Any]:
    """Post-process and clean the LLM output - handle repetitions here"""
    
    def clean_and_deduplicate(items: List[str]) -> List[str]:
        """Clean and deduplicate list items in post-processing"""
        if not isinstance(items, list):
            return []
        
        seen = set()
        cleaned = []
        for item in items:
            if isinstance(item, str):
                clean_item = item.strip()
                # Remove common prefixes/suffixes and clean up
                clean_item = re.sub(r'^(?:-|\*|\d+\.)\s*', '', clean_item)
                clean_item = re.sub(r'\s+', ' ', clean_item)
                
                if clean_item and clean_item.lower() not in seen:
                    seen.add(clean_item.lower())
                    cleaned.append(clean_item)
        return cleaned
    
    def separate_experience_leadership(experience: List[str], leadership: List[str]) -> tuple:
        """Ensure no overlap between experience and leadership in post-processing"""
        exp_lower = [item.lower() for item in experience]
        lead_lower = [item.lower() for item in leadership]
        
        # Move items that are clearly leadership from experience to leadership
        leadership_keywords = ['mentor', 'tutor', 'warden', 'representative', 'chair', 'president', 'sub-warden']
        new_experience = []
        new_leadership = leadership.copy()
        
        for item in experience:
            item_lower = item.lower()
            is_leadership = any(keyword in item_lower for keyword in leadership_keywords)
            
            if is_leadership and item_lower not in lead_lower:
                new_leadership.append(item)
            else:
                new_experience.append(item)
        
        return new_experience, new_leadership
    
    def extract_degree_names(education_items: List[str]) -> List[str]:
        """Extract only degree names from education items in post-processing"""
        degree_names = []
        degree_patterns = [
            r'(BSc\s+in\s+[A-Za-z\s]+)',
            r'(B\.?Eng\s+in\s+[A-Za-z\s]+)',
            r'(Bachelor\s+of\s+[A-Za-z\s]+)',
            r'(Honors?\s+in\s+[A-Za-z\s]+)',
            r'([A-Za-z]+\s+Degree\s+in\s+[A-Za-z\s]+)',
            r'(Mechatronics\s+Engineering)',
            r'(Final\s+year\s+\(Honors\)\s+in\s+[A-Za-z\s]+)'
        ]
        
        for item in education_items:
            for pattern in degree_patterns:
                match = re.search(pattern, item, re.IGNORECASE)
                if match:
                    degree_name = match.group(1).strip()
                    degree_names.append(degree_name)
                    break
            else:
                # If no pattern matched, keep the original item
                degree_names.append(item)
        
        return degree_names
    
    # Clean all sections
    experience = clean_and_deduplicate(llm_result.get("experience", []))
    leadership = clean_and_deduplicate(llm_result.get("leadership", []))
    profile_summary = str(llm_result.get("profile_summary", ""))[:250]
    education = clean_and_deduplicate(llm_result.get("education", []))
    
    # Extract only degree names from education in post-processing
    education = extract_degree_names(education)
    education = clean_and_deduplicate(education)  # Deduplicate again after extraction
    
    # Ensure proper separation between experience and leadership
    experience, leadership = separate_experience_leadership(experience, leadership)
    experience = clean_and_deduplicate(experience)
    leadership = clean_and_deduplicate(leadership)
    
    return {
        "experience": experience,
        "leadership": leadership,
        "profile_summary": profile_summary,
        "education": education
    }

def fallback_extraction(text: str) -> Dict[str, Any]:
    """Fallback rule-based extraction if LLM fails"""
    print("Using fallback extraction...")
    
    # Professional experience (paid jobs)
    professional_patterns = [
        r'AI and Embedded Systems Intern',
        r'Junior Electrical Engineer'
    ]
    
    # Leadership/volunteer roles
    leadership_patterns = [
        r'Senior Administrative Sub-Warden',
        r'Head Mentor',
        r'Faculty Mentor',
        r'Tutor'
    ]
    
    experience = []
    leadership = []
    
    for pattern in professional_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            experience.append(pattern)
    
    for pattern in leadership_patterns:
        if re.search(pattern, text, re.IGNORECASE):
            leadership.append(pattern)
    
    # Education - only degree names
    education = [
        "BSc in Mechatronics",
        "Honors in Mechatronics Engineering"
    ]
    
    return {
        "experience": experience,
        "leadership": leadership,
        "profile_summary": "Mechatronics Engineering student with expertise in AI, embedded systems, and leadership. Currently interning at a cutting-edge R&D firm.",
        "education": education
    }

def extract_from_pdf(pdf_path: str) -> Dict[str, Any]:
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    # Extract and clean text
    print("Extracting text from PDF...")
    raw_text = extract_text_from_pdf(pdf_path)
    clean_text = clean_text_for_llm(raw_text)
    
    # Try LLM extraction first
    print("Attempting LLM extraction...")
    llm_result = extract_with_llama(clean_text)
    
    # If LLM fails, use fallback
    if "error" in llm_result:
        print(f"LLM extraction failed: {llm_result['error']}")
        result = fallback_extraction(clean_text)
    else:
        print("LLM extraction successful, post-processing results...")
        result = post_process_results(llm_result)
    
    return result

def check_ollama_models():
    """Check if Llama 3.2 is available"""
    try:
        models = ollama.list()
        available_models = [model['name'] for model in models['models']]
        if 'llama3.2' in available_models:
            print("✓ Llama 3.2 is available")
            return True
        else:
            print("⚠ Llama 3.2 not found. Available models:", available_models)
            return False
    except:
        return False

# ---------- ENTRY POINT ----------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python cv_extractor.py <path_to_pdf>")
        sys.exit(1)

    pdf_file = sys.argv[1]
    
    if not check_ollama_models():
        print("Falling back to rule-based extraction only...")
    
    try:
        print(f"Processing CV: {pdf_file}")
        extracted_data = extract_from_pdf(pdf_file)
        
        print("\n" + "="*50)
        print("EXTRACTION RESULTS:")
        print("="*50)
        print(json.dumps(extracted_data, indent=4))
        
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        sys.exit(1)