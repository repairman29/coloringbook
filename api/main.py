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

app = FastAPI(title="Enhanced Coloring Page Converter", 
              description="Convert images to coloring pages with multiple processing options")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def apply_bilateral_filter(image, d=9, sigma_color=75, sigma_space=75):
    """Apply bilateral filter to reduce noise while preserving edges"""
    return cv2.bilateralFilter(image, d, sigma_color, sigma_space)

def apply_adaptive_threshold(image, block_size=11, c=2):
    """Apply adaptive thresholding for better edge detection"""
    return cv2.adaptiveThreshold(image, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, block_size, c)

def apply_morphological_operations(image, kernel_size=2):
    """Apply morphological operations to clean up the image"""
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))
    # Remove small noise
    cleaned = cv2.morphologyEx(image, cv2.MORPH_OPEN, kernel)
    # Fill small holes
    cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)
    return cleaned

def enhance_contrast(image):
    """Enhance contrast using CLAHE (Contrast Limited Adaptive Histogram Equalization)"""
    clahe = cv2.createCLAHE(clipLimit=1.5, tileGridSize=(8,8))
    return clahe.apply(image)

def detect_edges_canny(image, low_threshold=30, high_threshold=100):
    """Detect edges using Canny algorithm with better thresholds"""
    return cv2.Canny(image, low_threshold, high_threshold)

def detect_edges_sobel(image):
    """Detect edges using Sobel operator"""
    sobelx = cv2.Sobel(image, cv2.CV_64F, 1, 0, ksize=3)
    sobely = cv2.Sobel(image, cv2.CV_64F, 0, 1, ksize=3)
    magnitude = np.sqrt(sobelx**2 + sobely**2)
    # Normalize and threshold
    magnitude = cv2.normalize(magnitude, None, 0, 255, cv2.NORM_MINMAX)
    magnitude = np.uint8(magnitude)
    # Apply threshold to get clean edges
    _, magnitude = cv2.threshold(magnitude, 50, 255, cv2.THRESH_BINARY)
    return magnitude

def detect_edges_laplacian(image):
    """Detect edges using Laplacian operator"""
    laplacian = cv2.Laplacian(image, cv2.CV_64F)
    laplacian = np.absolute(laplacian)
    laplacian = np.uint8(laplacian)
    # Apply threshold to get clean edges
    _, laplacian = cv2.threshold(laplacian, 30, 255, cv2.THRESH_BINARY)
    return laplacian

def create_outline_effect(image, thickness=1):
    """Create outline effect by dilating edges"""
    if thickness <= 1:
        return image
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (thickness, thickness))
    return cv2.dilate(image, kernel, iterations=1)

def remove_background_noise(image, min_area=20):
    """Remove small noise by filtering contours by area"""
    contours, _ = cv2.findContours(image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    mask = np.zeros_like(image)
    for contour in contours:
        if cv2.contourArea(contour) > min_area:
            cv2.fillPoly(mask, [contour], 255)
    return mask

def apply_cartoon_effect(image):
    """Apply cartoon-like effect"""
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply bilateral filter to reduce noise
    smooth = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Detect edges
    edges = cv2.adaptiveThreshold(smooth, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 2)
    
    # Apply median blur to color image
    color = cv2.medianBlur(image, 7)
    
    # Combine edges with color
    cartoon = cv2.bitwise_and(color, color, mask=edges)
    
    return cartoon

def process_image_advanced(image, method="canny", enhance_quality=True, remove_noise=True, 
                          outline_thickness=1, min_noise_area=20):
    """Advanced image processing with multiple options"""
    
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Enhance contrast (use more conservative settings)
    if enhance_quality:
        gray = enhance_contrast(gray)
    
    # Apply bilateral filter to reduce noise while preserving edges
    if remove_noise:
        gray = apply_bilateral_filter(gray)
    
    # Detect edges based on method
    if method == "canny":
        edges = detect_edges_canny(gray)
    elif method == "sobel":
        edges = detect_edges_sobel(gray)
    elif method == "laplacian":
        edges = detect_edges_laplacian(gray)
    elif method == "adaptive":
        edges = apply_adaptive_threshold(gray)
    elif method == "cartoon":
        return apply_cartoon_effect(image)
    else:
        edges = detect_edges_canny(gray)
    
    # Remove small noise (use smaller threshold)
    if remove_noise:
        edges = remove_background_noise(edges, min_noise_area)
    
    # Apply morphological operations to clean up (use smaller kernel)
    edges = apply_morphological_operations(edges, kernel_size=2)
    
    # Create outline effect
    if outline_thickness > 1:
        edges = create_outline_effect(edges, outline_thickness)
    
    # Invert the image (white background, black lines)
    result = cv2.bitwise_not(edges)
    
    return result

def image_to_base64(image):
    """Convert OpenCV image to base64 string"""
    _, buffer = cv2.imencode('.png', image)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return img_base64

@app.post("/api/preview")
async def generate_previews(
    image: UploadFile = File(None), 
    url: str = Form(None),
    enhance_quality: bool = Query(True, description="Enhance image quality"),
    remove_noise: bool = Query(True, description="Remove background noise"),
    outline_thickness: int = Query(1, ge=1, le=3, description="Outline thickness (1-3)"),
    min_noise_area: int = Query(20, ge=10, le=50, description="Minimum noise area to remove (10-50)")
):
    """
    Generate multiple previews with different processing methods for comparison.
    Returns base64 encoded images for each method.
    """
    
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
        
        # Define processing methods with their configurations
        methods = [
            {
                "name": "canny",
                "label": "Canny Edge Detection",
                "description": "Best for most images",
                "params": {"method": "canny"}
            },
            {
                "name": "sobel",
                "label": "Sobel Operator", 
                "description": "Good for gradient-based edges",
                "params": {"method": "sobel"}
            },
            {
                "name": "laplacian",
                "label": "Laplacian Operator",
                "description": "Detects all edges",
                "params": {"method": "laplacian"}
            },
            {
                "name": "adaptive",
                "label": "Adaptive Thresholding",
                "description": "Good for varying lighting",
                "params": {"method": "adaptive"}
            },
            {
                "name": "cartoon",
                "label": "Cartoon Effect",
                "description": "Artistic style",
                "params": {"method": "cartoon"}
            }
        ]
        
        previews = []
        
        for method_config in methods:
            try:
                # Process image with current method
                result = process_image_advanced(
                    img,
                    method=method_config["params"]["method"],
                    enhance_quality=enhance_quality,
                    remove_noise=remove_noise,
                    outline_thickness=outline_thickness,
                    min_noise_area=min_noise_area
                )
                
                # Convert to base64
                img_base64 = image_to_base64(result)
                
                previews.append({
                    "name": method_config["name"],
                    "label": method_config["label"],
                    "description": method_config["description"],
                    "image": img_base64
                })
                
            except Exception as e:
                # If a method fails, skip it but continue with others
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
    method: str = Query("canny", description="Edge detection method: canny, sobel, laplacian, adaptive, cartoon"),
    enhance_quality: bool = Query(True, description="Enhance image quality"),
    remove_noise: bool = Query(True, description="Remove background noise"),
    outline_thickness: int = Query(1, ge=1, le=3, description="Outline thickness (1-3)"),
    min_noise_area: int = Query(20, ge=10, le=50, description="Minimum noise area to remove (10-50)")
):
    """
    Convert image to coloring page with advanced processing options.
    
    Methods:
    - canny: Canny edge detection (default)
    - sobel: Sobel operator edge detection
    - laplacian: Laplacian operator edge detection
    - adaptive: Adaptive thresholding
    - cartoon: Cartoon-like effect
    """
    
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
                "name": "canny",
                "description": "Canny edge detection - best for most images",
                "parameters": ["low_threshold", "high_threshold"]
            },
            {
                "name": "sobel",
                "description": "Sobel operator - good for gradient-based edges",
                "parameters": ["kernel_size"]
            },
            {
                "name": "laplacian",
                "description": "Laplacian operator - detects all edges",
                "parameters": ["kernel_size"]
            },
            {
                "name": "adaptive",
                "description": "Adaptive thresholding - good for varying lighting",
                "parameters": ["block_size", "c"]
            },
            {
                "name": "cartoon",
                "description": "Cartoon-like effect - artistic style",
                "parameters": ["bilateral_filter", "median_blur"]
            }
        ]
    }

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Enhanced Coloring Page Converter API",
        "version": "2.0",
        "endpoints": {
            "POST /api/preview": "Generate multiple previews for comparison",
            "POST /api/convert": "Convert image to coloring page",
            "GET /api/methods": "Get available processing methods",
            "GET /docs": "API documentation"
        }
    }
