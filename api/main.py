from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image, ImageFilter, ImageOps
import numpy as np
from io import BytesIO
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

        logger.info("Opening image with PIL...")
        img = Image.open(BytesIO(contents))
        logger.info(f"Image opened successfully, size: {img.size}, mode: {img.mode}")
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        logger.info("Converting to grayscale...")
        gray = img.convert('L')
        
        logger.info("Applying edge detection...")
        # Use PIL's edge detection filter
        edges = gray.filter(ImageFilter.FIND_EDGES)
        
        logger.info("Inverting edges...")
        inverted = ImageOps.invert(edges)

        logger.info("Encoding to PNG...")
        output_buffer = BytesIO()
        inverted.save(output_buffer, format='PNG')
        output_buffer.seek(0)
        
        logger.info(f"PNG encoded, size: {len(output_buffer.getvalue())} bytes")
        logger.info("Returning streaming response...")
        
        return StreamingResponse(output_buffer, media_type="image/png")
        
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
