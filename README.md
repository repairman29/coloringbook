# Coloring Page App

A web application that converts images to coloring pages using edge detection. Users can upload images or provide image URLs to generate black and white outlines suitable for coloring.

## Features

- Upload images directly from your device
- Convert images from URLs
- Real-time edge detection using OpenCV
- Modern React frontend with Tailwind CSS
- FastAPI backend with automatic API documentation
- Docker support for easy deployment

## Project Structure

```
coloring-page-app/
├── api/
│   └── main.py              # FastAPI backend
├── frontend/
│   ├── public/
│   │   └── index.html       # Main HTML file
│   ├── src/
│   │   ├── App.js           # Main React component
│   │   └── index.js         # React entry point
│   └── package.json         # Frontend dependencies
├── requirements.txt         # Python dependencies
├── Dockerfile              # Docker configuration
├── vercel.json             # Vercel deployment config
└── README.md               # This file
```

## Setup Instructions

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
   - You should see the FastAPI Swagger UI

3. Test the API endpoint:
   - Use the `/api/convert` endpoint to test image conversion
   - You can upload an image file or provide an image URL

## Deployment

### Option 1: Deploy to Vercel

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

## API Endpoints

### POST /api/convert

Converts an image to a coloring page using edge detection.

**Parameters:**
- `image` (file, optional): Image file to upload
- `url` (string, optional): URL of an image to convert

**Response:**
- Returns a PNG image with black outlines on white background

**Example:**
```bash
curl -X POST "http://127.0.0.1:8000/api/convert" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@your-image.jpg"
```

## Technologies Used

- **Backend:** FastAPI, OpenCV, NumPy
- **Frontend:** React, Tailwind CSS
- **Deployment:** Docker, Vercel
- **Image Processing:** OpenCV for edge detection

## Troubleshooting

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

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License. # Updated README
