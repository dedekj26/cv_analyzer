from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
from services.extractor import extract_text_from_file
from services.gemini import analyze_cv_with_gemini

app = FastAPI(title="CV Analyzer AI Service")

@app.post("/analyze")
async def analyze_cv(file: UploadFile = File(...)):
    if not file.filename.endswith(('.pdf', '.docx')):
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDF and DOCX are supported.")
    
    # Read file content into memory
    content = await file.read()
    
    # Extract text
    try:
        text = extract_text_from_file(content, file.filename)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to extract text: {str(e)}")
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Could not extract any text from the document.")
    
    # Analyze with Gemini
    try:
        result = analyze_cv_with_gemini(text)
        return {"status": "success", "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Analysis failed: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
