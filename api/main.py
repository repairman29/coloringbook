from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import requests
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/convert")
async def convert_image(image: UploadFile = File(None), url: str = Form(None)):
    try:
        logger.info(f"Received convert request - image: {image is not None}, url: {url}")
        
        if image:
            logger.info(f"Processing uploaded image: {image.filename}")
            contents = await image.read()
            logger.info(f"Image size: {len(contents)} bytes")
        elif url:
            logger.info(f"Processing image from URL: {url}")
            response = requests.get(url)
            contents = response.content
            logger.info(f"URL image size: {len(contents)} bytes")
        else:
            logger.error("No image or URL provided")
            return {"error": "No image or URL provided"}

        # For now, return a simple response indicating the image was received
        # We'll implement actual processing once the basic API works
        logger.info("Image received successfully")
        
        return {
            "message": "Image received successfully",
            "size": len(contents),
            "status": "processing_placeholder"
        }
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {"error": f"Processing error: {str(e)}"}

@app.get("/")
async def root():
    return {"message": "Coloring Page Converter API", "version": "1.0"}

@app.get("/api/test")
async def test():
    return {"message": "API is working!", "status": "success"}

@app.get("/api/health")
async def health():
    return {"status": "healthy", "message": "Coloring Book API is running"}
