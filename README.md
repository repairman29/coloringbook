# Enhanced Coloring Page App

A sophisticated web application that converts images to high-quality coloring pages using advanced computer vision techniques. Users can upload images or provide image URLs to generate beautiful black and white outlines suitable for coloring, with multiple processing algorithms and customizable parameters.

## ✨ Enhanced Features

### 🎨 **Multiple Processing Methods**
- **Canny Edge Detection** - Best for most images with clean, precise edges
- **Sobel Operator** - Excellent for gradient-based edge detection
- **Laplacian Operator** - Detects all edges for detailed outlines
- **Adaptive Thresholding** - Perfect for images with varying lighting conditions
- **Cartoon Effect** - Artistic style with color reduction and edge emphasis

### 🔧 **Advanced Processing Options**
- **Quality Enhancement** - CLAHE (Contrast Limited Adaptive Histogram Equalization)
- **Noise Reduction** - Bilateral filtering and morphological operations
- **Outline Thickness** - Adjustable line thickness (1-3 pixels)
- **Noise Area Filtering** - Remove small artifacts (10-50 pixel threshold)
- **Background Noise Removal** - Intelligent contour-based cleaning

### 🎯 **Image Quality Improvements**
- **Bilateral Filtering** - Reduces noise while preserving edges
- **Morphological Operations** - Cleans up small holes and noise
- **Contrast Enhancement** - Improves visibility of details
- **Edge Refinement** - Creates smoother, more printable outlines

### 🆕 **NEW: Preview System**
- **Side-by-Side Comparison** - See all 5 processing methods at once
- **Click to Select** - Choose the best result by clicking on any preview
- **Visual Feedback** - Selected preview is highlighted with blue border
- **One-Click Download** - Download your selected method instantly
- **Real-time Processing** - All previews generated simultaneously

## 🚀 **Project Structure**

```
coloring-page-app/
├── api/
│   ├── main.py              # Enhanced FastAPI backend with multiple algorithms
│   ├── requirements.txt     # Python dependencies
│   └── vercel.json         # Serverless function configuration
├── frontend/
│   ├── public/
│   │   └── index.html       # Main HTML file
│   ├── src/
│   │   ├── App.js           # Enhanced React component with preview system
│   │   └── index.js         # React entry point
│   └── package.json         # Frontend dependencies
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
├── vercel.json             # Vercel deployment config
└── README.md               # This file
```

## 🛠 **Setup Instructions**

### Prerequisites

- Python 3.8+ with pip
- Node.js 14+ with npm
- Git (optional, for version control)

### Step 1: Extract the Project

If you have the zip file, extract it to a folder:

```bash
unzip coloring-page-app-url-support.zip
cd coloring-page-app-url-support
```

### Step 2: Set Up Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Build the frontend:
```bash
npm run build
```

### Step 3: Set Up Backend

1. Return to the project root:
```bash
cd ..
```

2. Create a Python virtual environment:
```bash
python3 -m venv venv
```

3. Activate the virtual environment:
```bash
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

4. Install Python dependencies:
```bash
pip install -r requirements.txt
```

### Step 4: Test the Application

1. Start the FastAPI backend:
```bash
uvicorn api.main:app --host 127.0.0.1 --port 8000 --reload
```

2. Visit the API documentation:
   - Open http://127.0.0.1:8000/docs in your browser
   - You should see the enhanced FastAPI Swagger UI

3. Test the API endpoints:
   - Use the `/api/preview` endpoint to generate multiple previews
   - Use the `/api/convert` endpoint with different parameters
   - Try the `/api/methods` endpoint to see available algorithms

## 🌐 **Deployment**

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy to production:
```bash
vercel --prod
```

### Option 2: Deploy with Docker

1. Build the Docker image:
```bash
docker build -t coloring-page-app .
```

2. Run the container:
```bash
docker run -p 8000:8000 coloring-page-app
```

### Option 3: Deploy to GitHub (Optional)

1. Initialize Git repository:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a GitHub repository and push:
```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/coloring-page-app.git
git push -u origin main
```

## 📡 **API Endpoints**

### POST /api/preview

Generate multiple previews with different processing methods for comparison.

**Parameters:**
- `image` (file, optional): Image file to upload
- `url` (string, optional): URL of an image to convert
- `enhance_quality` (boolean, default: true): Enable quality enhancement
- `remove_noise` (boolean, default: true): Enable noise removal
- `outline_thickness` (integer, 1-3, default: 1): Line thickness
- `min_noise_area` (integer, 10-50, default: 20): Minimum noise area to remove

**Response:**
```json
{
  "previews": [
    {
      "name": "canny",
      "label": "Canny Edge Detection",
      "description": "Best for most images",
      "image": "base64_encoded_image_data"
    }
  ],
  "total_methods": 5,
  "successful_methods": 5
}
```

### POST /api/convert

Converts an image to a coloring page with advanced processing options.

**Parameters:**
- `image` (file, optional): Image file to upload
- `url` (string, optional): URL of an image to convert
- `method` (string, default: "canny"): Processing method
- `enhance_quality` (boolean, default: true): Enable quality enhancement
- `remove_noise` (boolean, default: true): Enable noise removal
- `outline_thickness` (integer, 1-3, default: 1): Line thickness
- `min_noise_area` (integer, 10-50, default: 20): Minimum noise area to remove

**Response:**
- Returns a PNG image with black outlines on white background

**Example:**
```bash
curl -X POST "http://127.0.0.1:8000/api/convert" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@your-image.jpg" \
  -F "method=canny" \
  -F "enhance_quality=true" \
  -F "remove_noise=true" \
  -F "outline_thickness=2" \
  -F "min_noise_area=30"
```

### GET /api/methods

Returns information about available processing methods.

**Response:**
```json
{
  "methods": [
    {
      "name": "canny",
      "description": "Canny edge detection - best for most images",
      "parameters": ["low_threshold", "high_threshold"]
    }
  ]
}
```

### GET /

Returns API information and available endpoints.

## 🎨 **Processing Methods Explained**

### 1. **Canny Edge Detection** (Recommended)
- **Best for**: Most images, especially photos and complex scenes
- **How it works**: Multi-stage algorithm that detects edges by finding intensity gradients
- **Advantages**: Produces clean, continuous edges with minimal noise
- **Use when**: You want professional-quality outlines

### 2. **Sobel Operator**
- **Best for**: Images with strong gradients and directional edges
- **How it works**: Computes gradients in X and Y directions
- **Advantages**: Good at detecting edges with specific orientations
- **Use when**: Working with architectural or geometric images

### 3. **Laplacian Operator**
- **Best for**: Detailed images requiring all edge detection
- **How it works**: Detects edges by finding zero-crossings in second derivatives
- **Advantages**: Captures fine details and texture
- **Use when**: You need maximum detail preservation

### 4. **Adaptive Thresholding**
- **Best for**: Images with uneven lighting or shadows
- **How it works**: Applies different thresholds to different image regions
- **Advantages**: Handles varying lighting conditions well
- **Use when**: Working with scanned documents or poorly lit photos

### 5. **Cartoon Effect**
- **Best for**: Artistic, stylized coloring pages
- **How it works**: Combines edge detection with color quantization
- **Advantages**: Creates artistic, simplified representations
- **Use when**: You want a more artistic, less realistic result

## 🔧 **Advanced Parameters**

### Quality Enhancement
- **CLAHE**: Improves contrast in dark and bright areas
- **Bilateral Filtering**: Reduces noise while preserving edges
- **Morphological Operations**: Cleans up small artifacts

### Noise Control
- **Min Noise Area**: Filters out small objects (10-50 pixels)
- **Outline Thickness**: Adjusts line thickness (1-3 pixels)
- **Background Cleaning**: Removes isolated noise pixels

## 🛠 **Technologies Used**

- **Backend**: FastAPI, OpenCV, NumPy
- **Frontend**: React, Tailwind CSS
- **Image Processing**: OpenCV with multiple algorithms
- **Deployment**: Docker, Vercel
- **API Documentation**: Automatic Swagger UI

## 🐛 **Troubleshooting**

### Common Issues

1. **"python-multipart not installed" error:**
   ```bash
   pip install python-multipart
   ```

2. **Port 8000 already in use:**
   ```bash
   uvicorn api.main:app --host 127.0.0.1 --port 8001
   ```

3. **Frontend build fails:**
   - Make sure you're in the `frontend` directory
   - Run `npm install` before `npm run build`

4. **OpenCV installation issues:**
   - On macOS: `brew install opencv`
   - On Ubuntu: `sudo apt-get install python3-opencv`

5. **Poor image quality:**
   - Try different processing methods
   - Adjust outline thickness and noise parameters
   - Enable quality enhancement

### Performance Tips

- **Large images**: Consider resizing before processing for faster results
- **Batch processing**: Use the API programmatically for multiple images
- **Quality vs Speed**: Disable quality enhancement for faster processing

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with different image types
5. Submit a pull request

## 📄 **License**

This project is open source and available under the MIT License.

## 🌟 **What's New in v2.1**

- 🆕 **Preview System**: Side-by-side comparison of all 5 processing methods
- 🎯 **Click to Select**: Choose the best result by clicking on any preview
- 📊 **Visual Feedback**: Selected preview highlighted with blue border
- ⚡ **One-Click Download**: Download selected method instantly
- 🔄 **Real-time Processing**: All previews generated simultaneously
- 🎨 **Better UI**: Improved layout with 3-column grid for previews
- 📱 **Enhanced UX**: Clear visual indicators and intuitive interactions

## 📞 **Support**

For questions, issues, or feature requests, please open an issue on GitHub or contact the maintainers.
