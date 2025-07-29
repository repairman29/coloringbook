from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import cv2
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

        logger.info("Converting to numpy array...")
        nparr = np.frombuffer(contents, np.uint8)
        logger.info(f"Numpy array shape: {nparr.shape}")
        
        logger.info("Decoding image with OpenCV...")
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if img is None:
            logger.error("Failed to decode image")
            return {"error": "Failed to decode image"}
        
        logger.info(f"Image decoded successfully, shape: {img.shape}")

        # Original simple approach that worked well
        logger.info("Converting to grayscale...")
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        logger.info("Applying Gaussian blur...")
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        logger.info("Detecting edges with Canny...")
        edges = cv2.Canny(blurred, 50, 150)
        
        logger.info("Inverting edges...")
        inverted = cv2.bitwise_not(edges)

        logger.info("Encoding to PNG...")
        _, buffer = cv2.imencode('.png', inverted)
        logger.info(f"PNG encoded, size: {len(buffer)} bytes")
        
        logger.info("Returning streaming response...")
        return StreamingResponse(BytesIO(buffer.tobytes()), media_type="image/png")
        
    except Exception as e:
        logger.error(f"Error processing image: {str(e)}")
        return {"error": f"Processing error: {str(e)}"}

@app.get("/")
async def root():
    return {"message": "Coloring Page Converter API", "version": "1.0"}
