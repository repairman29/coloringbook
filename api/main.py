from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
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
    return {"message": "Coloring Page Converter API", "version": "1.0"}

@app.get("/api/test")
async def test():
    return {"message": "API is working!", "status": "success"}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "message": "Coloring Book API is running"}

@app.post("/api/convert")
async def convert_image(request: Request):
    try:
        # Simple response for now
        return {
            "message": "Image conversion endpoint reached",
            "status": "placeholder"
        }
    except Exception as e:
        return {"error": str(e)}
