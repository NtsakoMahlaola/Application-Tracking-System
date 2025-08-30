import streamlit as st
import pandas as pd
from pathlib import Path
import tempfile
import os
import time
from datetime import datetime
import base64

# Import your existing functions (assuming they're in cv_extractor.py)
from cv_extractor import extract_from_pdf, check_ollama_models

# App configuration
st.set_page_config(
    page_title="CV Extraction Portal",
    page_icon="📄",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for better styling
st.markdown("""
    <style>
    .main-header {
        font-size: 3rem;
        color: #1f77b4;
        text-align: center;
        margin-bottom: 2rem;
    }
    .success-box {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: #d4edda;
        border: 1px solid #c3e6cb;
        color: #155724;
        margin-bottom: 1rem;
    }
    .info-box {
        padding: 1rem;
        border-radius: 0.5rem;
        background-color: #d1ecf1;
        border: 1px solid #bee5eb;
        color: #0c5460;
        margin-bottom: 1rem;
    }
    .stButton>button {
        width: 100%;
        background-color: #4CAF50;
        color: white;
    }
    </style>
    """, unsafe_allow_html=True)

# Initialize session state
if 'extracted_data' not in st.session_state:
    st.session_state.extracted_data = None
if 'csv_data' not in st.session_state:
    st.session_state.csv_data = pd.DataFrame()
if 'filename' not in st.session_state:
    st.session_state.filename = None

# App header
st.markdown('<h1 class="main-header">📄 CV Extraction Portal</h1>', unsafe_allow_html=True)

# Sidebar for information and controls
with st.sidebar:
    st.header("About")
    st.info("""
    This application extracts structured information from CVs (PDF format).
    It identifies:
    - Professional Experience
    - Leadership Roles  
    - Education
    - Profile Summary
    """)
    
    # Check Ollama status
    st.header("System Status")
    llm_available = check_ollama_models()
    if llm_available:
        st.success("✓ Llama 3.2 is available")
    else:
        st.warning("⚠ Llama 3.2 not found. Using fallback extraction rules.")
    
    # CSV management
    st.header("Data Management")
    if st.button("Clear All Data"):
        st.session_state.csv_data = pd.DataFrame()
        st.success("All data cleared!")
    
    # Download current CSV
    if not st.session_state.csv_data.empty:
        csv = st.session_state.csv_data.to_csv(index=False)
        st.download_button(
            label="Download CSV",
            data=csv,
            file_name="cv_extractions.csv",
            mime="text/csv"
        )

# Main content area
tab1, tab2, tab3 = st.tabs(["Upload CV", "Review Data", "How to Use"])

with tab1:
    st.header("Upload a CV")
    
    # File uploader
    uploaded_file = st.file_uploader("Choose a PDF file", type="pdf", help="Upload a CV in PDF format")
    
    if uploaded_file is not None:
        # Save the uploaded file to a temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
            tmp_file.write(uploaded_file.getvalue())
            tmp_path = tmp_file.name
        
        try:
            # Display file info
            file_size = uploaded_file.size / 1024  # Convert to KB
            st.info(f"**File Name:** {uploaded_file.name}  \n**Size:** {file_size:.2f} KB")
            
            # Process the file when user clicks the button
            if st.button("Extract Information", type="primary"):
                with st.spinner('Analyzing CV content... This may take a moment.'):
                    # Show a progress bar for better UX
                    progress_bar = st.progress(0)
                    for i in range(100):
                        time.sleep(0.01)  # Simulate processing
                        progress_bar.progress(i + 1)
                    
                    # Call your existing function
                    extracted_data = extract_from_pdf(tmp_path)
                    st.session_state.extracted_data = extracted_data
                    st.session_state.filename = uploaded_file.name
                    
                    progress_bar.empty()
                    st.success("Extraction complete!")
                    
                    # Auto-switch to the Review Data tab
                    st.session_state.current_tab = "Review Data"
                    st.rerun()
        
        except Exception as e:
            st.error(f"An error occurred during processing: {str(e)}")
        finally:
            # Clean up the temporary file
            os.unlink(tmp_path)

with tab2:
    st.header("Review Extracted Information")
    
    if st.session_state.extracted_data:
        data = st.session_state.extracted_data
        
        # Display Results for Validation in two columns
        col1, col2 = st.columns(2)
        
        with col1:
            st.subheader("Profile Summary")
            profile_summary = st.text_area(
                "Edit summary if needed:",
                value=data.get('profile_summary', ''),
                height=150,
                key="profile_summary"
            )
            
            st.subheader("Experience")
            experience_list = data.get('experience', [])
            experience_text = "\n".join([f"- {exp}" for exp in experience_list])
            experience_edited = st.text_area(
                "Edit experience (one item per line):",
                value=experience_text,
                height=200,
                key="experience"
            )
        
        with col2:
            st.subheader("Education")
            education_list = data.get('education', [])
            education_text = "\n".join([f"- {edu}" for edu in education_list])
            education_edited = st.text_area(
                "Edit education (one item per line):",
                value=education_text,
                height=150,
                key="education"
            )
            
            st.subheader("Leadership")
            leadership_list = data.get('leadership', [])
            leadership_text = "\n".join([f"- {lead}" for lead in leadership_list])
            leadership_edited = st.text_area(
                "Edit leadership roles (one item per line):",
                value=leadership_text,
                height=150,
                key="leadership"
            )
        
        # Process the edited data
        edited_experience = [line.strip()[2:] if line.startswith("- ") else line.strip() 
                           for line in experience_edited.split("\n") if line.strip()]
        edited_education = [line.strip()[2:] if line.startswith("- ") else line.strip() 
                          for line in education_edited.split("\n") if line.strip()]
        edited_leadership = [line.strip()[2:] if line.startswith("- ") else line.strip() 
                           for line in leadership_edited.split("\n") if line.strip()]
        
        # Save to CSV section
        st.divider()
        st.subheader("Save to Database")
        
        # Create a DataFrame from the extracted data
        data_to_save = {
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "file_name": st.session_state.filename,
            "profile_summary": profile_summary,
            "experience": '; '.join(edited_experience),
            "education": '; '.join(edited_education),
            "leadership": '; '.join(edited_leadership)
        }
        
        # Display what will be saved
        st.markdown("### Data to be saved:")
        preview_df = pd.DataFrame([data_to_save])
        st.dataframe(preview_df, use_container_width=True)
        
        # Save button
        if st.button("Save to CSV", type="primary"):
            # Add to session state DataFrame
            new_row = pd.DataFrame([data_to_save])
            if st.session_state.csv_data.empty:
                st.session_state.csv_data = new_row
            else:
                st.session_state.csv_data = pd.concat(
                    [st.session_state.csv_data, new_row], 
                    ignore_index=True
                )
            
            st.success("Data successfully saved!")
            st.balloons()
            
            # Reset for a new upload
            st.session_state.extracted_data = None
            time.sleep(2)
            st.rerun()
    
    else:
        st.info("No data to review. Please upload a CV first on the 'Upload CV' tab.")

with tab3:
    st.header("How to Use This Application")
    
    st.markdown("""
    ### Step-by-Step Guide:
    
    1. **Upload a CV**: Go to the 'Upload CV' tab and select a PDF file containing a CV.
    
    2. **Extract Information**: Click the 'Extract Information' button to process the CV.
    
    3. **Review Results**: The application will analyze the CV and extract:
       - Professional experience history
       - Leadership roles and positions
       - Educational background
       - A professional summary
    
    4. **Edit if Needed**: You can modify any of the extracted information before saving.
    
    5. **Save to CSV**: Click 'Save to CSV' to add the information to your database.
    
    6. **Download Data**: Use the download button in the sidebar to get a CSV file with all extracted data.
    
    ### Tips for Best Results:
    - Ensure CVs are in PDF format with selectable text (not scanned images)
    - For best results with the AI extraction, make sure Ollama is running with the Llama 3.2 model
    - The system will use rule-based extraction if the AI model is not available
    """)

# Display the current data table in the main area if we have data
if not st.session_state.csv_data.empty:
    st.divider()
    st.header("All Extracted Data")
    st.dataframe(st.session_state.csv_data, use_container_width=True)