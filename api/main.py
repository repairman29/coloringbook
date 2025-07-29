from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Ultimate AI Coloring Generator API", "version": "2.0", "status": "live"}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "message": "Coloring Book API is running", "version": "2.0"}

@app.get("/api/test")
async def test():
    return {"message": "API is working!", "status": "success", "version": "2.0"}

@app.post("/api/convert")
async def convert_image(request: Request):
    try:
        # For now, return a success message
        # In a full implementation, this would process the image
        return {
            "message": "Image conversion endpoint reached",
            "status": "success",
            "note": "Image processing will be implemented in the next update"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Processing error: {str(e)}"}
        )

@app.get("/api/version")
async def version():
    return {
        "version": "2.0",
        "features": [
            "Basic API endpoints",
            "CORS support",
            "Error handling",
            "Health checks"
        ],
        "next_update": "Image processing with PIL"
    }
