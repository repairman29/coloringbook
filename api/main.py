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
from openai import OpenAI

app = FastAPI(title="AI-Enhanced Coloring Page Converter", 
              description="Convert images to coloring pages using AI and advanced computer vision")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def resize_image_if_needed(image, max_width=1200, max_height=1200):
    """Resize image if it's too large to prevent memory issues"""
    height, width = image.shape[:2]
    
    # Check if resizing is needed
    if width <= max_width and height <= max_height:
        return image
    
    # Calculate new dimensions maintaining aspect ratio
    aspect_ratio = width / height
    if width > height:
        new_width = max_width
        new_height = int(max_width / aspect_ratio)
    else:
        new_height = max_height
        new_width = int(max_height * aspect_ratio)
    
    # Resize the image
    resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    return resized

def enhance_image_preprocessing(image):
    """Enhanced preprocessing for better results"""
    # Convert to LAB color space for better processing
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    
    # Enhance contrast in L channel
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    l = clahe.apply(l)
    
    # Merge channels back
    enhanced = cv2.merge([l, a, b])
    enhanced = cv2.cvtColor(enhanced, cv2.COLOR_LAB2BGR)
    
    # Apply bilateral filter to reduce noise while preserving edges
    enhanced = cv2.bilateralFilter(enhanced, 9, 75, 75)
    
    return enhanced

def detect_contours_advanced(image):
    """Advanced contour detection for better line art"""
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply adaptive histogram equalization
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
            # Thickness based on contour area
            thickness = max(1, min(3, int(area / 1000)))
            cv2.drawContours(result, [contour], -1, 0, thickness)
    
    return result

def apply_sketch_effect(image):
    """Apply sketch-like effect for artistic results"""
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Invert the image
    inverted = cv2.bitwise_not(gray)
    
    # Apply Gaussian blur
    blurred = cv2.GaussianBlur(inverted, (21, 21), 0)
    
    # Blend the images
    sketch = cv2.divide(gray, 255 - blurred, scale=256)
    
    # Apply threshold to get clean lines
    _, sketch = cv2.threshold(sketch, 240, 255, cv2.THRESH_BINARY)
    
    return sketch

def apply_watercolor_effect(image):
    """Apply watercolor-like effect for artistic coloring pages"""
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply bilateral filter for smoothing
    smooth = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Apply median blur
    smooth = cv2.medianBlur(smooth, 7)
    
    # Detect edges
    edges = cv2.adaptiveThreshold(smooth, 255, cv2.ADAPTIVE_THRESH_MEAN_C, cv2.THRESH_BINARY, 9, 2)
    
    # Apply morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    edges = cv2.morphologyEx(edges, cv2.MORPH_CLOSE, kernel)
    
    return edges

def apply_anime_style(image):
    """Apply anime/manga style line art"""
    # Convert to grayscale
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Apply bilateral filter
    smooth = cv2.bilateralFilter(gray, 9, 75, 75)
    
    # Detect edges with different methods
    edges1 = cv2.Canny(smooth, 50, 150)
    edges2 = cv2.adaptiveThreshold(smooth, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2)
    
    # Combine edges
    combined = cv2.bitwise_or(edges1, edges2)
    
    # Apply morphological operations
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2, 2))
    combined = cv2.morphologyEx(combined, cv2.MORPH_CLOSE, kernel)
    
    return combined

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

def process_image_advanced(image, method="contours", enhance_quality=True, remove_noise=True, 
                          outline_thickness=1, min_noise_area=20):
    """Advanced image processing with multiple options"""
    
    # Enhanced preprocessing
    if enhance_quality:
        image = enhance_image_preprocessing(image)
    
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
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        if enhance_quality:
            gray = enhance_contrast(gray)
        if remove_noise:
            gray = apply_bilateral_filter(gray)
        result = detect_edges_canny(gray)
    elif method == "sobel":
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        if enhance_quality:
            gray = enhance_contrast(gray)
        if remove_noise:
            gray = apply_bilateral_filter(gray)
        result = detect_edges_sobel(gray)
    elif method == "laplacian":
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        if enhance_quality:
            gray = enhance_contrast(gray)
        if remove_noise:
            gray = apply_bilateral_filter(gray)
        result = detect_edges_laplacian(gray)
    elif method == "adaptive":
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        if enhance_quality:
            gray = enhance_contrast(gray)
        if remove_noise:
            gray = apply_bilateral_filter(gray)
        result = apply_adaptive_threshold(gray)
    elif method == "cartoon":
        return apply_cartoon_effect(image)
    else:
        result = detect_contours_advanced(image)
    
    # Remove small noise
    if remove_noise:
        result = remove_background_noise(result, min_noise_area)
    
    # Apply morphological operations to clean up
    result = apply_morphological_operations(result, kernel_size=2)
    
    # Create outline effect
    if outline_thickness > 1:
        result = create_outline_effect(result, outline_thickness)
    
    # Invert the image (white background, black lines)
    result = cv2.bitwise_not(result)
    
    return result

def image_to_base64(image):
    """Convert OpenCV image to base64 string"""
    _, buffer = cv2.imencode('.png', image)
    img_base64 = base64.b64encode(buffer).decode('utf-8')
    return img_base64

def generate_ai_coloring_page(prompt, style="line_art", complexity="medium"):
    """Generate coloring page using OpenAI DALL-E 3"""
    try:
        # Create style-specific prompts
        style_prompts = {
            "line_art": "black and white line art coloring page",
            "sketch": "hand-drawn sketch style coloring page",
            "cartoon": "cartoon style line art coloring page",
            "anime": "anime/manga style line art coloring page",
            "simple": "simple minimalist line art coloring page",
            "detailed": "detailed intricate line art coloring page"
        }
        
        complexity_modifiers = {
            "simple": "with very simple lines, minimal detail, suitable for young children",
            "medium": "with clear, well-defined lines and moderate detail",
            "complex": "with intricate details and fine lines, suitable for older children and adults"
        }
        
        # Build the full prompt
        style_prompt = style_prompts.get(style, style_prompts["line_art"])
        complexity_modifier = complexity_modifiers.get(complexity, complexity_modifiers["medium"])
        
        full_prompt = f"Create a {style_prompt} of {prompt}. {complexity_modifier}. Clean, crisp lines, no shading, pure black lines on white background. Perfect for coloring."
        
        # Generate image using DALL-E 3
        response = client.images.generate(
            model="dall-e-3",
            prompt=full_prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        # Get the image URL
        image_url = response.data[0].url
        
        # Download the image
        img_response = requests.get(image_url)
        img_array = np.frombuffer(img_response.content, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        # Convert to grayscale and enhance for coloring page
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold to ensure clean black and white
        _, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)
        
        # Invert to get black lines on white background
        result = cv2.bitwise_not(binary)
        
        return result
        
    except Exception as e:
        raise Exception(f"AI generation failed: {str(e)}")

@app.post("/api/generate-ai")
async def generate_ai_coloring_page_endpoint(
    prompt: str = Form(..., description="Description of what to create (e.g., 'a cat playing with yarn')"),
    style: str = Query("line_art", description="Art style: line_art, sketch, cartoon, anime, simple, detailed"),
    complexity: str = Query("medium", description="Complexity level: simple, medium, complex")
):
    """
    Generate a coloring page using AI (DALL-E 3).
    Requires OPENAI_API_KEY environment variable to be set.
    """
    
    if not os.getenv("OPENAI_API_KEY"):
        return {"error": "OpenAI API key not configured. Please set OPENAI_API_KEY environment variable."}
    
    try:
        result = generate_ai_coloring_page(prompt, style, complexity)
        
        # Encode the result
        _, buffer = cv2.imencode('.png', result)
        return StreamingResponse(BytesIO(buffer.tobytes()), media_type="image/png")
        
    except Exception as e:
        return {"error": str(e)}

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
        
        # Resize image if it's too large to prevent memory issues
        img = resize_image_if_needed(img, max_width=1200, max_height=1200)
        
        # Define processing methods with their configurations
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
    method: str = Query("contours", description="Processing method: contours, sketch, watercolor, anime, canny, sobel, laplacian, adaptive, cartoon"),
    enhance_quality: bool = Query(True, description="Enhance image quality"),
    remove_noise: bool = Query(True, description="Remove background noise"),
    outline_thickness: int = Query(1, ge=1, le=3, description="Outline thickness (1-3)"),
    min_noise_area: int = Query(20, ge=10, le=50, description="Minimum noise area to remove (10-50)")
):
    """
    Convert image to coloring page with advanced processing options.
    
    Methods:
    - contours: Advanced contour detection (recommended)
    - sketch: Artistic sketch effect
    - watercolor: Soft watercolor style
    - anime: Clean anime/manga style
    - canny: Traditional Canny edge detection
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
            "available": bool(os.getenv("OPENAI_API_KEY")),
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
            "POST /api/generate-ai": "Generate coloring page using AI",
            "GET /api/methods": "Get available processing methods",
            "GET /docs": "API documentation"
        }
    }
