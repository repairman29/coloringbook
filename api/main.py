from fastapi import FastAPI, File, UploadFile, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import cv2
import numpy as np
from io import BytesIO
import requests
from typing import Optional, List, Dict
import math
import base64
import os

app = FastAPI(title="AI-Enhanced Coloring Page Converter", 
              description="Convert images to coloring pages using AI and advanced computer vision")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client (optional - will work without it)
try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    client = None

@app.get("/api/test")
async def test_endpoint():
    """Simple test endpoint to verify the API is working"""
    return {"message": "API is working!", "status": "success", "openai_available": OPENAI_AVAILABLE}

def resize_image_if_needed(image, max_width=1200, max_height=1200):
    """Resize image if it's too large to prevent memory issues"""
    height, width = image.shape[:2]
    
    if width <= max_width and height <= max_height:
        return image
    
    aspect_ratio = width / height
    if width > height:
        new_width = max_width
        new_height = int(max_width / aspect_ratio)
    else:
        new_height = max_height
        new_width = int(max_height * aspect_ratio)
    
    resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    return resized

def detect_contours_advanced(image):
    """Advanced contour detection for better line art"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply CLAHE for better contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    gray = clahe.apply(gray)
    
    # Apply bilateral filter
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Detect edges using Canny
    edges = cv2.Canny(gray, 30, 100)
    
    # Find contours
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    # Create blank canvas
    result = np.ones_like(gray) * 255
    
    # Draw contours with different thicknesses based on area
    for contour in contours:
        area = cv2.contourArea(contour)
        if area > 50:  # Filter small noise
            thickness = max(1, min(3, int(area / 1000)))
            cv2.drawContours(result, [contour], -1, 0, thickness)
    
    return result

def apply_sketch_effect(image):
    """Apply sketch-like effect for artistic results"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    inverted = cv2.bitwise_not(gray)
    blurred = cv2.GaussianBlur(inverted, (21, 21), 0)
    sketch = cv2.divide(gray, 255 - blurred, scale=256)
    _, sketch = cv2.threshold(sketch, 240, 255, cv2.THRESH_BINARY)
    return sketch

def apply_watercolor_effect(image):
    """Apply watercolor-like effect for artistic coloring pages"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    smooth = cv2.bilateralFilter(gray, 9, 75, 75)
    smooth = cv2.medianBlur(smooth, 7)
    edges = cv2.adaptiveThreshold(smooth, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 2)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    return edges

def apply_anime_style(image):
    """Apply anime/manga style line art"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    smooth = cv2.bilateralFilter(gray, 9, 75, 75)
    edges1 = cv2.Canny(smooth, 50, 150)
    edges2 = cv2.adaptiveThreshold(smooth, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    combined = cv2.bitwise_or(edges1, edges2)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    combined = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel)
    return combined

def detect_edges_canny(image):
    """Detect edges using Canny algorithm"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8,8))
    gray = clahe.apply(gray)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    return cv2.Canny(gray, 30, 100)

def image_to_base64(image):
    """Convert OpenCV image to base64 string"""
    _, buffer = cv2.imencode('.png', image)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return img_base64

def process_image_advanced(image, method="contours", enhance_quality=True, remove_noise=True, 
                          outline_thickness=1, min_noise_area=20):
    """Advanced image processing with multiple options"""
    
    # Process based on method
    if method == "contours":
        result = detect_contours_advanced(image)
    elif method == "sketch":
        result = apply_sketch_effect(image)
    elif method == "watercolor":
        result = apply_watercolor_effect(image)
    elif method == "anime":
        result = apply_anime_style(image)
    elif method == "canny":
        result = detect_edges_canny(image)
    else:
        result = detect_contours_advanced(image)
    
    # Remove small noise
    if remove_noise:
        contours, _ = cv2.findContours(result, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        mask = np.zeros_like(result)
        for contour in contours:
            if cv2.contourArea(contour) > min_noise_area:
                cv2.fillPoly(mask, [contour], 255)
        result = mask
    
    # Apply morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    result = cv2.morphologyEx(result, cv2.MORPH_OPEN, kernel)
    result = cv2.morphologyEx(result, cv2.MORPH_CLOSE, kernel)
    
    # Create outline effect
    if outline_thickness > 1:
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (outline_thickness, outline_thickness))
        result = cv2.dilate(result, kernel, iterations=1)
    
    # Invert the image (white background, black lines)
    result = cv2.bitwise_not(result)
    
    return result

@app.post("/api/preview")
async def generate_previews(
    image: UploadFile = File(None), 
    url: str = Form(None),
    enhance_quality: bool = Query(True, description="Enhance image quality"),
    remove_noise: bool = Query(True, description="Remove background noise"),
    outline_thickness: int = Query(1, ge=1, le=3, description="Outline thickness (1-3)"),
    min_noise_area: int = Query(20, ge=10, le=50, description="Minimum noise area to remove (10-50)")
):
    """Generate multiple previews with different processing methods for comparison."""
    
    if image:
        contents = await image.read()
    elif url:
        response = requests.get(url)
        contents = response.content
    else:
        return {"error": "No image or URL provided"}

    try:
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"error": "Invalid image format"}
        
        # Resize image if it's too large
        img = resize_image_if_needed(img, max_width=1200, max_height=1200)
        
        # Define processing methods
        methods = [
            {
                "name": "contours",
                "label": "Advanced Contours",
                "description": "Best for most images - uses contour detection",
                "params": {"method": "contours"}
            },
            {
                "name": "sketch",
                "label": "Sketch Effect", 
                "description": "Artistic sketch-like lines",
                "params": {"method": "sketch"}
            },
            {
                "name": "watercolor",
                "label": "Watercolor Style",
                "description": "Soft, artistic watercolor effect",
                "params": {"method": "watercolor"}
            },
            {
                "name": "anime",
                "label": "Anime/Manga Style",
                "description": "Clean anime-style line art",
                "params": {"method": "anime"}
            },
            {
                "name": "canny",
                "label": "Canny Edge Detection",
                "description": "Traditional edge detection",
                "params": {"method": "canny"}
            }
        ]
        
        previews = []
        
        for method_config in methods:
            try:
                result = process_image_advanced(
                    img,
                    method=method_config["params"]["method"],
                    enhance_quality=enhance_quality,
                    remove_noise=remove_noise,
                    outline_thickness=outline_thickness,
                    min_noise_area=min_noise_area
                )
                
                img_base64 = image_to_base64(result)
                
                previews.append({
                    "name": method_config["name"],
                    "label": method_config["label"],
                    "description": method_config["description"],
                    "image": img_base64
                })
                
            except Exception as e:
                previews.append({
                    "name": method_config["name"],
                    "label": method_config["label"],
                    "description": method_config["description"],
                    "error": str(e)
                })
        
        return {
            "previews": previews,
            "total_methods": len(methods),
            "successful_methods": len([p for p in previews if "image" in p])
        }
        
    except Exception as e:
        return {"error": f"Processing failed: {str(e)}"}

@app.post("/api/convert")
async def convert_image(
    image: UploadFile = File(None), 
    url: str = Form(None),
    method: str = Query("contours", description="Processing method: contours, sketch, watercolor, anime, canny"),
    enhance_quality: bool = Query(True, description="Enhance image quality"),
    remove_noise: bool = Query(True, description="Remove background noise"),
    outline_thickness: int = Query(1, ge=1, le=3, description="Outline thickness (1-3)"),
    min_noise_area: int = Query(20, ge=10, le=50, description="Minimum noise area to remove (10-50)")
):
    """Convert image to coloring page with advanced processing options."""
    
    if image:
        contents = await image.read()
    elif url:
        response = requests.get(url)
        contents = response.content
    else:
        return {"error": "No image or URL provided"}

    try:
        nparr = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            return {"error": "Invalid image format"}
        
        # Resize image if it's too large
        img = resize_image_if_needed(img, max_width=1200, max_height=1200)
        
        # Process the image
        result = process_image_advanced(
            img, 
            method=method,
            enhance_quality=enhance_quality,
            remove_noise=remove_noise,
            outline_thickness=outline_thickness,
            min_noise_area=min_noise_area
        )
        
        # Encode the result
        _, buffer = cv2.imencode('.png', result)
        return StreamingResponse(BytesIO(buffer.tobytes()), media_type="image/png")
        
    except Exception as e:
        return {"error": f"Processing failed: {str(e)}"}

@app.get("/api/methods")
async def get_available_methods():
    """Get available processing methods"""
    return {
        "methods": [
            {
                "name": "contours",
                "description": "Advanced contour detection - best for most images",
                "parameters": ["enhance_quality", "remove_noise"]
            },
            {
                "name": "sketch",
                "description": "Artistic sketch effect - creates hand-drawn look",
                "parameters": ["enhance_quality"]
            },
            {
                "name": "watercolor",
                "description": "Soft watercolor style - artistic and smooth",
                "parameters": ["enhance_quality"]
            },
            {
                "name": "anime",
                "description": "Clean anime/manga style - crisp lines",
                "parameters": ["enhance_quality", "remove_noise"]
            },
            {
                "name": "canny",
                "description": "Traditional Canny edge detection",
                "parameters": ["low_threshold", "high_threshold"]
            }
        ],
        "ai_generation": {
            "available": OPENAI_AVAILABLE,
            "endpoint": "/api/generate-ai",
            "description": "Generate coloring pages using AI (DALL-E 3)"
        }
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "AI-Enhanced Coloring Page Converter API",
        "version": "4.0",
        "features": {
            "computer_vision": "Advanced image processing with multiple methods",
            "ai_generation": "AI-powered coloring page creation using DALL-E 3",
            "preview_system": "Side-by-side comparison of different methods"
        },
        "endpoints": {
            "POST /api/preview": "Generate multiple previews for comparison",
            "POST /api/convert": "Convert image to coloring page",
            "GET /api/methods": "Get available processing methods",
            "GET /docs": "API documentation"
        }
    }
