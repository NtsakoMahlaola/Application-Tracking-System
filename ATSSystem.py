import pdfplumber
import re
import spacy
import json
import sys
from pathlib import Path
from typing import Dict, List, Optional

# Load SpaCy NLP model
nlp = spacy.load("en_core_web_sm")

# ---------- TEXT CLEANING FUNCTIONS ----------
def clean_text(text: str) -> str:
    """Remove phone numbers, emails, URLs, and excessive whitespace"""
    # Remove phone numbers (various formats)
    text = re.sub(r'[\+\(]?[1-9][0-9 .\-\(\)]{8,}[0-9]', '', text)
    # Remove emails
    text = re.sub(r'\S+@\S+\.\S+', '', text)
    # Remove URLs
    text = re.sub(r'http\S+|www\.\S+', '', text)
    # Remove section headers and excessive whitespace
    text = re.sub(r'\b(PROFILE|EXPERIENCE|EDUCATION|SKILLS|WORK EXPERIENCE)\b', '', text, flags=re.IGNORECASE)
    text = ' '.join(text.split())
    return text.strip()

def extract_job_titles(text: str) -> List[str]:
    """Extract job titles using pattern matching"""
    patterns = [
        r'(\b(?:Junior|Senior|Lead|Principal|Head|Chief)\s+\w+\s+\w+)',
        r'(\b\w+\s+(?:Engineer|Developer|Analyst|Manager|Director|Specialist|Consultant)\b)',
        r'(\b(?:AI|ML|Data|Software|Hardware|Electrical|Mechatronics)\s+\w+\b)'
    ]
    
    titles = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        titles.extend(matches)
    
    return list(set(titles))  # Remove duplicates

def extract_education(text: str) -> List[str]:
    """Extract education degrees and institutions"""
    patterns = [
        r'(BSc|B\.Sc|Bachelor|MSc|M\.Sc|Master|PhD|Ph\.D|Doctorate)[\s\w]*?(?:in|of)?\s*([\w\s]+)',
        r'([\w\s]+University|[\w\s]+College|[\w\s]+Institute)',
        r'Degree[:\s]*([\w\s]+)'
    ]
    
    education = []
    for pattern in patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            if isinstance(match, tuple):
                education.append(' '.join(match).strip())
            else:
                education.append(match.strip())
    
    return list(set(education))

# ---------- IMPROVED RULE-BASED EXTRACTION ----------
def extract_sections_rule_based(text: str) -> Dict[str, str]:
    """
    Improved section extraction with better boundaries and cleaning
    """
    sections = {
        "experience": "",
        "leadership": "",
        "profile_summary": "",
        "education": ""
    }

    # More precise patterns with lookahead for boundaries
    patterns = {
        "experience": r"(?i)(experience|work history|employment)(.*?)(?=education|skills|leadership|$)",
        "leadership": r"(?i)(leadership|committee|chair|president)(.*?)(?=education|skills|experience|$)",
        "profile_summary": r"(?i)(profile|summary|about me)(.*?)(?=education|skills|experience|leadership|$)",
        "education": r"(?i)(education|qualification|degree)(.*?)(?=skills|experience|leadership|profile|$)"
    }

    for key, pattern in patterns.items():
        match = re.search(pattern, text, re.DOTALL)
        if match:
            extracted_text = match.group(2).strip()
            sections[key] = clean_text(extracted_text)
        else:
            sections[key] = ""

    return sections

# ---------- ENHANCED NLP EXTRACTION ----------
def extract_specific_entities(text: str) -> Dict[str, List[str]]:
    """
    Extract specific entities using NLP and pattern matching
    """
    doc = nlp(text)
    
    entities = {
        "experience": [],
        "leadership": [],
        "profile_summary": [],
        "education": []
    }
    
    # Extract job titles from the entire text
    job_titles = extract_job_titles(text)
    entities["experience"].extend(job_titles)
    
    # Extract education information
    education_info = extract_education(text)
    entities["education"].extend(education_info)
    
    # Use spaCy for named entities
    for ent in doc.ents:
        if ent.label_ in ["ORG", "WORK_OF_ART"] and len(ent.text.split()) > 1:
            if any(word in ent.text.lower() for word in ["manager", "lead", "director", "president"]):
                entities["leadership"].append(ent.text)
            elif any(word in ent.text.lower() for word in ["engineer", "developer", "analyst", "specialist"]):
                entities["experience"].append(ent.text)
    
    # Clean and deduplicate
    for key in entities:
        entities[key] = list(set([clean_text(item) for item in entities[key] if item.strip()]))
    
    return entities

# ---------- IMPROVED MAIN PIPELINE ----------
def extract_from_pdf(pdf_path: str) -> Dict[str, List[str]]:
    pdf_path = Path(pdf_path)
    if not pdf_path.exists():
        raise FileNotFoundError(f"PDF not found: {pdf_path}")

    # Extract text
    text = ""
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"

    # Get section-based extraction
    section_results = extract_sections_rule_based(text)
    
    # Get entity-based extraction
    entity_results = extract_specific_entities(text)
    
    # Combine results - prefer specific entities when available
    final_results = {}
    
    for key in section_results:
        if entity_results[key]:  # If we found specific entities, use them
            final_results[key] = entity_results[key]
        elif section_results[key]:  # Fall back to section text
            # For experience and education, try to extract specific items from section text
            if key == "experience":
                titles = extract_job_titles(section_results[key])
                final_results[key] = titles if titles else [section_results[key]]
            elif key == "education":
                education = extract_education(section_results[key])
                final_results[key] = education if education else [section_results[key]]
            else:
                final_results[key] = [section_results[key]]
        else:
            final_results[key] = []

    return final_results

# ---------- ENTRY POINT ----------
if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python ATSSystem.py <path_to_pdf>")
        sys.exit(1)

    pdf_file = sys.argv[1]
    try:
        extracted_data = extract_from_pdf(pdf_file)
        
        # Convert lists to your desired format
        formatted_output = {k: ", ".join(v) if isinstance(v, list) else v for k, v in extracted_data.items()}
        
        print(json.dumps(formatted_output, indent=4))
        
    except Exception as e:
        print(f"Error processing PDF: {str(e)}")
        sys.exit(1)