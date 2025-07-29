# AI-Enhanced Coloring Page Converter

A powerful web application that converts images to coloring pages using both advanced computer vision techniques and AI-powered generation with OpenAI DALL-E 3.

## 🌟 Features

### 🤖 AI-Powered Generation
- **DALL-E 3 Integration**: Generate custom coloring pages from text descriptions
- **Multiple Art Styles**: Line art, sketch, cartoon, anime, simple, and detailed styles
- **Complexity Levels**: Simple (for young children), medium, and complex designs
- **Custom Prompts**: Describe exactly what you want to create

### 🖼️ Advanced Image Processing
- **5 Processing Methods**: Advanced contours, sketch effects, watercolor style, anime/manga style, and traditional edge detection
- **Enhanced Preprocessing**: LAB color space enhancement and bilateral filtering
- **Smart Noise Removal**: Intelligent background noise filtering
- **Variable Line Thickness**: Automatic thickness adjustment based on contour area
- **Preview System**: Compare multiple processing methods side-by-side

### 🎨 User Experience
- **Dual Interface**: Upload images OR generate with AI
- **Real-time Preview**: See results instantly
- **One-click Download**: Download your favorite results
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Comprehensive error messages and validation

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- OpenAI API key (for AI generation)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/repairman29/coloringbook.git
   cd coloringbook
   ```

2. **Set up Python environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **Set up frontend**
   ```bash
   cd frontend
   npm install
   npm run build
   cd ..
   ```

4. **Configure OpenAI API (for AI generation)**
   ```bash
   export OPENAI_API_KEY="your-openai-api-key-here"
   ```
   
   Or create a `.env` file:
   ```
   OPENAI_API_KEY=your-openai-api-key-here
   ```

5. **Run the application**
   ```bash
   uvicorn api.main:app --reload
   ```

6. **Open your browser**
   - Frontend: http://localhost:3000 (if running React dev server)
   - API Docs: http://localhost:8000/docs

## 🔧 API Endpoints

### Image Processing
- `POST /api/convert` - Convert uploaded image to coloring page
- `POST /api/preview` - Generate multiple previews for comparison
- `GET /api/methods` - Get available processing methods

### AI Generation
- `POST /api/generate-ai` - Generate coloring page using DALL-E 3

### Parameters

#### Image Processing Parameters
- `method`: Processing method (contours, sketch, watercolor, anime, canny, etc.)
- `enhance_quality`: Enable quality enhancement (boolean)
- `remove_noise`: Remove background noise (boolean)
- `outline_thickness`: Line thickness (1-3)
- `min_noise_area`: Minimum noise area to remove (10-50)

#### AI Generation Parameters
- `prompt`: Text description of what to create
- `style`: Art style (line_art, sketch, cartoon, anime, simple, detailed)
- `complexity`: Complexity level (simple, medium, complex)

## 🎯 Processing Methods

### Computer Vision Methods
1. **Advanced Contours** - Best for most images, uses contour detection with variable line thickness
2. **Sketch Effect** - Creates artistic hand-drawn look
3. **Watercolor Style** - Soft, artistic watercolor effect
4. **Anime/Manga Style** - Clean anime-style line art
5. **Canny Edge Detection** - Traditional edge detection

### AI Generation Styles
1. **Line Art** - Clean, classic line art
2. **Sketch** - Hand-drawn sketch style
3. **Cartoon** - Fun cartoon style
4. **Anime** - Anime/manga style
5. **Simple** - Minimalist design
6. **Detailed** - Intricate detailed design

## 🌐 Deployment

### Vercel Deployment
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy**
   ```bash
   vercel --prod
   ```

3. **Configure Environment Variables**
   - Set `OPENAI_API_KEY` in Vercel dashboard for AI generation

### Environment Variables
- `OPENAI_API_KEY`: Your OpenAI API key (required for AI generation)

## 📁 Project Structure

```
coloringbook/
├── api/
│   ├── main.py              # FastAPI backend
│   ├── requirements.txt     # Python dependencies
│   └── vercel.json         # Vercel API configuration
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   └── index.js        # React entry point
│   ├── public/
│   │   └── index.html      # HTML template
│   ├── package.json        # Node.js dependencies
│   └── build/              # Production build
├── requirements.txt        # Python dependencies
├── vercel.json            # Vercel configuration
└── README.md              # This file
```

## 🛠️ Technologies Used

### Backend
- **FastAPI** - Modern Python web framework
- **OpenCV** - Computer vision and image processing
- **NumPy** - Numerical computing
- **OpenAI** - AI image generation
- **Uvicorn** - ASGI server

### Frontend
- **React** - JavaScript library for UI
- **Tailwind CSS** - Utility-first CSS framework
- **Fetch API** - HTTP requests

### Deployment
- **Vercel** - Serverless deployment platform
- **GitHub** - Version control and hosting

## 🎨 Usage Examples

### Image Processing
1. Upload an image or provide an image URL
2. Choose processing options (quality enhancement, noise removal, etc.)
3. Click "Generate All Previews" to see different methods
4. Click on your favorite preview to select it
5. Download the selected coloring page

### AI Generation
1. Switch to the "AI Generation" tab
2. Describe what you want to create (e.g., "a cat playing with yarn")
3. Choose art style and complexity level
4. Click "Generate with AI"
5. Download the AI-generated coloring page

## 🔍 Troubleshooting

### Common Issues

1. **"OpenAI API key not configured"**
   - Set the `OPENAI_API_KEY` environment variable
   - Restart the server after setting the variable

2. **"Image is too large"**
   - Images are automatically resized to 1200x1200 pixels
   - Use images under 10MB for best performance

3. **"Failed to generate previews"**
   - Check that all required dependencies are installed
   - Ensure the image format is supported (JPEG, PNG, GIF, WebP)

4. **Vercel deployment issues**
   - Make sure `vercel.json` is properly configured
   - Check that all files are committed to Git

### Performance Tips
- Use high-contrast images for best results
- Avoid very dark or very bright images
- Be specific in AI prompts for better results
- Try different processing methods for different image types

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- OpenAI for DALL-E 3 API
- OpenCV community for computer vision tools
- FastAPI and React communities for excellent frameworks

## 📞 Support

If you encounter any issues or have questions:
1. Check the troubleshooting section above
2. Review the API documentation at `/docs`
3. Open an issue on GitHub

---

**Version**: 4.0  
**Last Updated**: December 2024  
**Status**: Production Ready
