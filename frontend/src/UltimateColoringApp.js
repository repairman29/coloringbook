import React, { useState, useEffect, useRef } from 'react';
import './UltimateColoringApp.css';

const UltimateColoringApp = () => {
  const [currentView, setCurrentView] = useState('main');
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(8);
  const [achievements, setAchievements] = useState([
    { id: 1, name: 'First Creation', description: 'Created your first coloring page', unlocked: true },
    { id: 2, name: 'AI Master', description: 'Used all AI processing modes', unlocked: false },
    { id: 3, name: 'Voice Artist', description: 'Used voice commands 10 times', unlocked: false }
  ]);
  const [aiSettings, setAiSettings] = useState({
    processingMode: 'neural',
    detailLevel: 'high',
    style: 'classic',
    backgroundRemoval: true,
    edgeEnhancement: true
  });
  const [voiceCommands, setVoiceCommands] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [communityGallery, setCommunityGallery] = useState([]);
  const [userProfile, setUserProfile] = useState({
    username: 'ArtMaster',
    avatar: '🎨',
    totalCreations: 47,
    favoriteStyle: 'Neural Network'
  });
  const [selectedColor, setSelectedColor] = useState('#ff0000');
  const [brushSize, setBrushSize] = useState(5);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasContext, setCanvasContext] = useState(null);
  const [currentTool, setCurrentTool] = useState('brush'); // brush, eraser, fill, shapes
  const [imageUrl, setImageUrl] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const fileInputRef = useRef();
  const canvasRef = useRef();
  const audioContextRef = useRef();

  // Initialize canvas when studio view is opened
  useEffect(() => {
    if (currentView === 'studio' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      // Set canvas size
      canvas.width = 800;
      canvas.height = 600;
      
      // Set initial canvas style
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Set drawing context
      setCanvasContext(ctx);
    }
  }, [currentView]);

  // Enhanced canvas drawing functions
  const startDrawing = (e) => {
    if (!canvasContext) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDrawing(true);
    
    if (currentTool === 'brush' || currentTool === 'eraser') {
      canvasContext.beginPath();
      canvasContext.moveTo(x, y);
      canvasContext.strokeStyle = currentTool === 'eraser' ? 'white' : selectedColor;
      canvasContext.lineWidth = brushSize;
      canvasContext.lineCap = 'round';
    } else if (currentTool === 'fill') {
      floodFill(x, y, selectedColor);
    }
  };

  const draw = (e) => {
    if (!isDrawing || !canvasContext) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (currentTool === 'brush' || currentTool === 'eraser') {
      canvasContext.lineTo(x, y);
      canvasContext.stroke();
    }
  };

  const stopDrawing = () => {
    if (!canvasContext) return;
    setIsDrawing(false);
    if (currentTool === 'brush' || currentTool === 'eraser') {
      canvasContext.closePath();
    }
  };

  // Flood fill algorithm
  const floodFill = (startX, startY, fillColor) => {
    const canvas = canvasRef.current;
    const ctx = canvasContext;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const startPos = (startY * canvas.width + startX) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    
    const fillR = parseInt(fillColor.slice(1, 3), 16);
    const fillG = parseInt(fillColor.slice(3, 5), 16);
    const fillB = parseInt(fillColor.slice(5, 7), 16);
    
    const stack = [[startX, startY]];
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const pos = (y * canvas.width + x) * 4;
      
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      if (data[pos] !== startR || data[pos + 1] !== startG || data[pos + 2] !== startB) continue;
      
      data[pos] = fillR;
      data[pos + 1] = fillG;
      data[pos + 2] = fillB;
      
      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
  };

  // Draw shapes
  const drawShape = (e) => {
    if (!canvasContext) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    canvasContext.fillStyle = selectedColor;
    canvasContext.strokeStyle = selectedColor;
    canvasContext.lineWidth = 2;
    
    if (currentTool === 'circle') {
      canvasContext.beginPath();
      canvasContext.arc(x, y, brushSize * 2, 0, 2 * Math.PI);
      canvasContext.fill();
    } else if (currentTool === 'square') {
      canvasContext.fillRect(x - brushSize, y - brushSize, brushSize * 2, brushSize * 2);
    } else if (currentTool === 'triangle') {
      canvasContext.beginPath();
      canvasContext.moveTo(x, y - brushSize);
      canvasContext.lineTo(x - brushSize, y + brushSize);
      canvasContext.lineTo(x + brushSize, y + brushSize);
      canvasContext.closePath();
      canvasContext.fill();
    }
  };

  // Clear canvas
  const clearCanvas = () => {
    if (!canvasContext) return;
    canvasContext.fillStyle = 'white';
    canvasContext.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // Color selection
  const colors = [
    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
    '#ff8800', '#8800ff', '#00ff88', '#ff0088', '#880000', '#008800'
  ];

  // Simulated voice recognition
  const startVoiceRecognition = () => {
    setIsListening(true);
    // Simulate voice commands
    setTimeout(() => {
      const commands = [
        "Create a neural network coloring page",
        "Enhance edges with AI",
        "Apply classic style",
        "Remove background",
        "Save to gallery"
      ];
      const randomCommand = commands[Math.floor(Math.random() * commands.length)];
      setVoiceCommands(prev => [...prev, { command: randomCommand, timestamp: new Date() }]);
      setIsListening(false);
    }, 2000);
  };

  // Real AI processing with API connection
  const processImage = async () => {
    console.log('processImage called, selectedImage:', selectedImage);
    if (!selectedImage) {
      console.log('No selected image, returning');
      return;
    }
    
    console.log('Starting image processing...');
    setIsProcessing(true);
    setProcessingProgress(0);
    
    try {
      console.log('Converting base64 to blob...');
      // Convert base64 to blob for API
      const response = await fetch(selectedImage);
      const blob = await response.blob();
      console.log('Blob created:', blob);
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'image.jpg');
      console.log('FormData created');
      
      // Update progress
      setProcessingProgress(20);
      
      console.log('Calling API at http://127.0.0.1:8000/api/convert...');
      // Call the real API
      const apiResponse = await fetch('http://127.0.0.1:8000/api/convert', {
        method: 'POST',
        body: formData,
      });
      
      console.log('API response received:', apiResponse.status, apiResponse.statusText);
      setProcessingProgress(80);
      
      if (!apiResponse.ok) {
        throw new Error(`API Error: ${apiResponse.status} - ${apiResponse.statusText}`);
      }
      
      // Get the processed image
      const processedBlob = await apiResponse.blob();
      console.log('Processed blob received:', processedBlob);
      const processedUrl = URL.createObjectURL(processedBlob);
      
      setProcessedImage(processedUrl);
      setProcessingProgress(100);
      console.log('Image processing completed successfully');
      
      // Award XP for successful processing
      setXp(prev => prev + 50);
      
      // Check for achievements
      if (xp + 50 >= 1500 && !achievements.find(a => a.id === 2)?.unlocked) {
        setAchievements(prev => prev.map(a => 
          a.id === 2 ? { ...a, unlocked: true } : a
        ));
      }
      
    } catch (error) {
      console.error('Processing error:', error);
      alert(`Error processing image: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Download processed image
  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'coloring-page.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Award XP for downloading
    setXp(prev => prev + 10);
  };

  // Share to community (simulated)
  const shareToCommunity = () => {
    if (!processedImage) return;
    
    // Simulate sharing
    alert('Sharing to community gallery! This feature will be fully implemented soon.');
    
    // Award XP for sharing
    setXp(prev => prev + 25);
    
    // Add to community gallery
    const newCreation = {
      id: Date.now(),
      image: processedImage,
      title: `Amazing Creation ${Math.floor(Math.random() * 1000)}`,
      artist: userProfile.username,
      likes: 0,
      comments: 0,
      timestamp: new Date()
    };
    
    setCommunityGallery(prev => [newCreation, ...prev]);
  };

  // Edit further (opens studio)
  const editFurther = () => {
    if (!processedImage) return;
    setCurrentView('studio');
    // In a real app, we'd pass the processed image to the studio
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Load image by URL
  const loadImageByUrl = async () => {
    if (!imageUrl.trim()) return;
    
    setIsLoadingUrl(true);
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error('Failed to load image');
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setSelectedImage(url);
      setImageUrl('');
      
      // Award XP for successful URL load
      setXp(prev => prev + 10);
      
    } catch (error) {
      console.error('Error loading image from URL:', error);
      alert('Error loading image from URL. Please check the URL and try again.');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  // Load image as background in studio
  const loadImageToCanvas = async (imageSrc) => {
    if (!canvasContext || !canvasRef.current) return;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvasContext;
      
      // Calculate aspect ratio to fit image in canvas
      const canvasRatio = canvas.width / canvas.height;
      const imageRatio = img.width / img.height;
      
      let drawWidth, drawHeight, offsetX, offsetY;
      
      if (imageRatio > canvasRatio) {
        // Image is wider than canvas
        drawWidth = canvas.width;
        drawHeight = canvas.width / imageRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        // Image is taller than canvas
        drawHeight = canvas.height;
        drawWidth = canvas.height * imageRatio;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }
      
      // Clear canvas and draw image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };
    
    img.src = imageSrc;
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log('Testing API connection...');
      const response = await fetch('http://127.0.0.1:8000/');
      const data = await response.json();
      console.log('API test successful:', data);
      return true;
    } catch (error) {
      console.error('API test failed:', error);
      return false;
    }
  };

  // Test API connection on component mount
  useEffect(() => {
    testApiConnection();
  }, []);

  const renderMainView = () => (
    <div className="main-view">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Ultimate AI</span>
            <br />
            <span className="gradient-text">Coloring Generator</span>
          </h1>
          <p className="hero-subtitle">
            Experience the future of coloring with revolutionary AI technology
          </p>
          <div className="hero-stats">
            <div className="stat">
              <span className="stat-number">47</span>
              <span className="stat-label">Creations</span>
            </div>
            <div className="stat">
              <span className="stat-number">8</span>
              <span className="stat-label">Level</span>
            </div>
            <div className="stat">
              <span className="stat-number">1,250</span>
              <span className="stat-label">XP</span>
            </div>
          </div>
          <button 
            className="cta-button"
            onClick={() => setCurrentView('upload')}
          >
            Start Creating Now
          </button>
        </div>
        <div className="hero-visual">
          <div className="floating-elements">
            <div className="floating-element">🎨</div>
            <div className="floating-element">✨</div>
            <div className="floating-element">🚀</div>
            <div className="floating-element">💎</div>
          </div>
        </div>
      </div>

      <div className="features-grid">
        <div className="feature-card" onClick={() => setCurrentView('upload')}>
          <div className="feature-icon">🧠</div>
          <h3>Neural Network Processing</h3>
          <p>Advanced AI algorithms inspired by ControlNet and SAM</p>
        </div>
        <div className="feature-card" onClick={() => setCurrentView('settings')}>
          <div className="feature-icon">⚙️</div>
          <h3>AI Settings Panel</h3>
          <p>Fine-tune every aspect of your coloring experience</p>
        </div>
        <div className="feature-card" onClick={() => setCurrentView('voice')}>
          <div className="feature-icon">🎤</div>
          <h3>Voice Commands</h3>
          <p>Control your app with natural voice instructions</p>
        </div>
        <div className="feature-card" onClick={() => setCurrentView('studio')}>
          <div className="feature-icon">🎭</div>
          <h3>Digital Coloring Studio</h3>
          <p>Professional-grade digital coloring tools</p>
        </div>
        <div className="feature-card" onClick={() => setCurrentView('community')}>
          <div className="feature-icon">🌐</div>
          <h3>Community Gallery</h3>
          <p>Share and discover amazing creations</p>
        </div>
        <div className="feature-card" onClick={() => setCurrentView('achievements')}>
          <div className="feature-icon">🏆</div>
          <h3>Achievement System</h3>
          <p>Unlock achievements and level up</p>
        </div>
      </div>
    </div>
  );

  const renderUploadView = () => (
    <div className="upload-view">
      <div className="view-header">
        <button className="back-button" onClick={() => setCurrentView('main')}>
          ← Back to Main
        </button>
        <h2>Upload Image</h2>
      </div>

      <div className="upload-content">
        <div className="upload-section">
          <h3>Upload from File</h3>
          <div 
            className="upload-area"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="upload-icon">📁</div>
            <p>Drag & drop an image here or click to browse</p>
            <p className="upload-hint">Supports: JPG, PNG, GIF, WebP</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        <div className="upload-section">
          <h3>Load from URL</h3>
          <div className="url-input-section">
            <input
              type="text"
              placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="url-input"
              onKeyPress={(e) => e.key === 'Enter' && loadImageByUrl()}
            />
            <button 
              className="url-load-button"
              onClick={loadImageByUrl}
              disabled={isLoadingUrl || !imageUrl.trim()}
            >
              {isLoadingUrl ? 'Loading...' : 'Load Image'}
            </button>
          </div>
          <p className="url-hint">Paste any image URL to load it directly</p>
        </div>

        {selectedImage && (
          <div className="preview-section">
            <h3>Preview</h3>
            <div className="image-preview">
              <img src={selectedImage} alt="Preview" />
              <div className="preview-actions">
                <button className="action-button" onClick={processImage}>
                  {isProcessing ? 'Processing...' : 'Convert to Coloring Page'}
                </button>
                <button className="action-button" onClick={() => setSelectedImage(null)}>
                  Remove
                </button>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="processing-overlay">
            <div className="processing-content">
              <div className="processing-spinner"></div>
              <h3>AI Processing...</h3>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${processingProgress}%` }}
                ></div>
              </div>
              <p>{processingProgress}% Complete</p>
            </div>
          </div>
        )}

        {processedImage && (
          <div className="result-section">
            <h3>🎨 AI Processed Result</h3>
            <div className="result-comparison">
              <div className="comparison-item">
                <h4>Original</h4>
                <img src={selectedImage} alt="Original" />
              </div>
              <div className="comparison-item">
                <h4>Coloring Page</h4>
                <img src={processedImage} alt="Processed" />
              </div>
            </div>
            <div className="result-actions">
              <button className="action-button" onClick={downloadImage}>
                📥 Download
              </button>
              <button className="action-button" onClick={shareToCommunity}>
                🌐 Share
              </button>
              <button className="action-button" onClick={editFurther}>
                ✏️ Edit Further
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderSettingsView = () => (
    <div className="settings-view">
      <div className="view-header">
        <button className="back-button" onClick={() => setCurrentView('main')}>
          ← Back to Main
        </button>
        <h2>AI Settings Panel</h2>
      </div>

      <div className="settings-grid">
        <div className="setting-group">
          <h3>Processing Mode</h3>
          <div className="setting-options">
            {['neural', 'classic', 'enhanced', 'artistic'].map(mode => (
              <button
                key={mode}
                className={`setting-option ${aiSettings.processingMode === mode ? 'active' : ''}`}
                onClick={() => setAiSettings(prev => ({ ...prev, processingMode: mode }))}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <h3>Detail Level</h3>
          <div className="setting-options">
            {['low', 'medium', 'high', 'ultra'].map(level => (
              <button
                key={level}
                className={`setting-option ${aiSettings.detailLevel === level ? 'active' : ''}`}
                onClick={() => setAiSettings(prev => ({ ...prev, detailLevel: level }))}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <h3>Style</h3>
          <div className="setting-options">
            {['classic', 'cartoon', 'realistic', 'abstract'].map(style => (
              <button
                key={style}
                className={`setting-option ${aiSettings.style === style ? 'active' : ''}`}
                onClick={() => setAiSettings(prev => ({ ...prev, style }))}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <h3>Advanced Options</h3>
          <div className="setting-toggles">
            <label className="toggle">
              <input
                type="checkbox"
                checked={aiSettings.backgroundRemoval}
                onChange={(e) => setAiSettings(prev => ({ 
                  ...prev, 
                  backgroundRemoval: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Background Removal
            </label>
            <label className="toggle">
              <input
                type="checkbox"
                checked={aiSettings.edgeEnhancement}
                onChange={(e) => setAiSettings(prev => ({ 
                  ...prev, 
                  edgeEnhancement: e.target.checked 
                }))}
              />
              <span className="toggle-slider"></span>
              Edge Enhancement
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderVoiceView = () => (
    <div className="voice-view">
      <div className="view-header">
        <button className="back-button" onClick={() => setCurrentView('main')}>
          ← Back to Main
        </button>
        <h2>Voice Commands</h2>
      </div>

      <div className="voice-section">
        <div className="voice-controls">
          <button
            className={`voice-button ${isListening ? 'listening' : ''}`}
            onClick={startVoiceRecognition}
            disabled={isListening}
          >
            {isListening ? '🎤 Listening...' : '🎤 Start Voice Recognition'}
          </button>
        </div>

        <div className="voice-commands">
          <h3>Available Commands</h3>
          <div className="command-list">
            <div className="command-item">
              <span className="command">"Create neural coloring page"</span>
              <span className="description">Process image with neural network</span>
            </div>
            <div className="command-item">
              <span className="command">"Enhance edges"</span>
              <span className="description">Apply edge enhancement</span>
            </div>
            <div className="command-item">
              <span className="command">"Apply classic style"</span>
              <span className="description">Use classic processing mode</span>
            </div>
            <div className="command-item">
              <span className="command">"Remove background"</span>
              <span className="description">Remove image background</span>
            </div>
            <div className="command-item">
              <span className="command">"Save to gallery"</span>
              <span className="description">Save current creation</span>
            </div>
          </div>
        </div>

        <div className="voice-history">
          <h3>Recent Commands</h3>
          <div className="history-list">
            {voiceCommands.map((cmd, index) => (
              <div key={index} className="history-item">
                <span className="command-text">{cmd.command}</span>
                <span className="timestamp">
                  {cmd.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudioView = () => (
    <div className="studio-view">
      <div className="view-header">
        <button className="back-button" onClick={() => setCurrentView('main')}>
          ← Back to Main
        </button>
        <h2>Digital Coloring Studio</h2>
      </div>

      <div className="studio-layout">
        <div className="studio-toolbar">
          <div className="tool-group">
            <h4>Drawing Tools</h4>
            <div className="tool-buttons">
              <button 
                className={`tool-button ${currentTool === 'brush' ? 'active' : ''}`}
                onClick={() => setCurrentTool('brush')}
                title="Brush Tool"
              >
                🖌️
              </button>
              <button 
                className={`tool-button ${currentTool === 'eraser' ? 'active' : ''}`}
                onClick={() => setCurrentTool('eraser')}
                title="Eraser Tool"
              >
                🧽
              </button>
              <button 
                className={`tool-button ${currentTool === 'fill' ? 'active' : ''}`}
                onClick={() => setCurrentTool('fill')}
                title="Fill Tool"
              >
                🎨
              </button>
              <button 
                className={`tool-button ${currentTool === 'circle' ? 'active' : ''}`}
                onClick={() => setCurrentTool('circle')}
                title="Circle Tool"
              >
                ⭕
              </button>
              <button 
                className={`tool-button ${currentTool === 'square' ? 'active' : ''}`}
                onClick={() => setCurrentTool('square')}
                title="Square Tool"
              >
                ⬜
              </button>
              <button 
                className={`tool-button ${currentTool === 'triangle' ? 'active' : ''}`}
                onClick={() => setCurrentTool('triangle')}
                title="Triangle Tool"
              >
                🔺
              </button>
            </div>
          </div>

          <div className="tool-group">
            <h4>Brush Sizes</h4>
            <div className="tool-buttons">
              <button 
                className={`tool-button ${brushSize === 2 ? 'active' : ''}`}
                onClick={() => setBrushSize(2)}
                title="Small Brush"
              >
                ✏️
              </button>
              <button 
                className={`tool-button ${brushSize === 5 ? 'active' : ''}`}
                onClick={() => setBrushSize(5)}
                title="Medium Brush"
              >
                🖌️
              </button>
              <button 
                className={`tool-button ${brushSize === 10 ? 'active' : ''}`}
                onClick={() => setBrushSize(10)}
                title="Large Brush"
              >
                🎨
              </button>
              <button 
                className={`tool-button ${brushSize === 20 ? 'active' : ''}`}
                onClick={() => setBrushSize(20)}
                title="Extra Large Brush"
              >
                💧
              </button>
            </div>
          </div>

          <div className="tool-group">
            <h4>Colors</h4>
            <div className="color-palette">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className={`color-swatch ${selectedColor === color ? 'active' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                ></div>
              ))}
            </div>
            <div className="current-color">
              <span>Current: </span>
              <div 
                className="color-preview" 
                style={{ backgroundColor: selectedColor }}
              ></div>
            </div>
          </div>

          <div className="tool-group">
            <h4>Canvas Tools</h4>
            <div className="tool-buttons">
              <button className="tool-button" onClick={clearCanvas} title="Clear Canvas">
                🗑️
              </button>
              <button 
                className="tool-button" 
                onClick={() => selectedImage && loadImageToCanvas(selectedImage)}
                title="Load Background Image"
              >
                🖼️
              </button>
              <button className="tool-button" title="Undo">
                ↩️
              </button>
              <button className="tool-button" title="Redo">
                ↪️
              </button>
            </div>
          </div>

          <div className="tool-group">
            <h4>Effects</h4>
            <div className="tool-buttons">
              <button className="tool-button" title="Sparkle Effect">
                ✨
              </button>
              <button className="tool-button" title="Glow Effect">
                🌟
              </button>
              <button className="tool-button" title="Blur Effect">
                💫
              </button>
              <button className="tool-button" title="Lightning Effect">
                ⚡
              </button>
            </div>
          </div>
        </div>

        <div className="studio-canvas">
          <canvas 
            ref={canvasRef}
            onMouseDown={currentTool === 'fill' ? startDrawing : (currentTool.includes('circle') || currentTool.includes('square') || currentTool.includes('triangle')) ? drawShape : startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ 
              cursor: currentTool === 'fill' ? 'crosshair' : 'crosshair',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px'
            }}
          />
        </div>

        <div className="studio-panel">
          <div className="panel-section">
            <h4>Tool Info</h4>
            <div className="tool-info">
              <p><strong>Current Tool:</strong> {currentTool.charAt(0).toUpperCase() + currentTool.slice(1)}</p>
              <p><strong>Brush Size:</strong> {brushSize}px</p>
              <p><strong>Color:</strong> {selectedColor}</p>
            </div>
          </div>

          <div className="panel-section">
            <h4>Layers</h4>
            <div className="layer-list">
              <div className="layer-item active">
                <span>Background</span>
                <button className="layer-toggle">👁️</button>
              </div>
              <div className="layer-item">
                <span>Coloring</span>
                <button className="layer-toggle">👁️</button>
              </div>
              <div className="layer-item">
                <span>Effects</span>
                <button className="layer-toggle">👁️</button>
              </div>
            </div>
          </div>

          <div className="panel-section">
            <h4>History</h4>
            <div className="history-list">
              <div className="history-item">Applied red color</div>
              <div className="history-item">Used brush tool</div>
              <div className="history-item">Added sparkle effect</div>
            </div>
          </div>

          <div className="panel-section">
            <h4>Actions</h4>
            <div className="action-buttons">
              <button className="action-button" onClick={clearCanvas}>
                Clear Canvas
              </button>
              <button className="action-button">
                Save Work
              </button>
              <button className="action-button">
                Export
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCommunityView = () => (
    <div className="community-view">
      <div className="view-header">
        <button className="back-button" onClick={() => setCurrentView('main')}>
          ← Back to Main
        </button>
        <h2>Community Gallery</h2>
      </div>

      <div className="community-content">
        <div className="gallery-filters">
          <button className="filter-button active">All</button>
          <button className="filter-button">Neural</button>
          <button className="filter-button">Classic</button>
          <button className="filter-button">Artistic</button>
        </div>

        <div className="gallery-grid">
          {/* Show real community creations first */}
          {communityGallery.map((creation) => (
            <div key={creation.id} className="gallery-item">
              <div className="gallery-image">
                <img src={creation.image} alt={creation.title} />
              </div>
              <div className="gallery-info">
                <h4>{creation.title}</h4>
                <p>by {creation.artist}</p>
                <div className="gallery-stats">
                  <span>❤️ {creation.likes}</span>
                  <span>💬 {creation.comments}</span>
                </div>
                <div className="gallery-actions">
                  <button className="gallery-action-btn">❤️</button>
                  <button className="gallery-action-btn">💬</button>
                  <button className="gallery-action-btn">📤</button>
                </div>
              </div>
            </div>
          ))}
          
          {/* Show placeholder items for demo */}
          {Array.from({ length: Math.max(0, 12 - communityGallery.length) }, (_, i) => (
            <div key={`placeholder-${i}`} className="gallery-item">
              <div className="gallery-image">
                <div className="placeholder-image">🎨</div>
              </div>
              <div className="gallery-info">
                <h4>Amazing Creation #{i + 1}</h4>
                <p>by Artist{i + 1}</p>
                <div className="gallery-stats">
                  <span>❤️ {Math.floor(Math.random() * 50)}</span>
                  <span>💬 {Math.floor(Math.random() * 20)}</span>
                </div>
                <div className="gallery-actions">
                  <button className="gallery-action-btn">❤️</button>
                  <button className="gallery-action-btn">💬</button>
                  <button className="gallery-action-btn">📤</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievementsView = () => (
    <div className="achievements-view">
      <div className="view-header">
        <button className="back-button" onClick={() => setCurrentView('main')}>
          ← Back to Main
        </button>
        <h2>Achievements & Progress</h2>
      </div>

      <div className="achievements-content">
        <div className="user-stats">
          <div className="stat-card">
            <h3>Level {level}</h3>
            <div className="level-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(xp % 200) / 2}%` }}
                ></div>
              </div>
              <p>{xp} / {level * 200} XP</p>
            </div>
          </div>
        </div>

        <div className="achievements-grid">
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`}
            >
              <div className="achievement-icon">
                {achievement.unlocked ? '🏆' : '🔒'}
              </div>
              <h4>{achievement.name}</h4>
              <p>{achievement.description}</p>
              {achievement.unlocked && (
                <span className="unlock-date">Unlocked!</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (currentView) {
      case 'upload':
        return renderUploadView();
      case 'settings':
        return renderSettingsView();
      case 'voice':
        return renderVoiceView();
      case 'studio':
        return renderStudioView();
      case 'community':
        return renderCommunityView();
      case 'achievements':
        return renderAchievementsView();
      default:
        return renderMainView();
    }
  };

  return (
    <div className="ultimate-coloring-app">
      <div className="app-background">
        <div className="gradient-overlay"></div>
        <div className="floating-particles">
          {Array.from({ length: 20 }, (_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}></div>
          ))}
        </div>
      </div>

      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🎨</span>
            <span className="logo-text">Ultimate AI Coloring</span>
          </div>
          <div className="user-profile">
            <span className="user-avatar">{userProfile.avatar}</span>
            <span className="user-name">{userProfile.username}</span>
            <span className="user-level">Level {level}</span>
          </div>
        </div>
      </header>

      <main className="app-main">
        {renderView()}
      </main>

      <nav className="app-navigation">
        <button 
          className={`nav-button ${currentView === 'main' ? 'active' : ''}`}
          onClick={() => setCurrentView('main')}
        >
          🏠
        </button>
        <button 
          className={`nav-button ${currentView === 'upload' ? 'active' : ''}`}
          onClick={() => setCurrentView('upload')}
        >
          📁
        </button>
        <button 
          className={`nav-button ${currentView === 'studio' ? 'active' : ''}`}
          onClick={() => setCurrentView('studio')}
        >
          🎭
        </button>
        <button 
          className={`nav-button ${currentView === 'community' ? 'active' : ''}`}
          onClick={() => setCurrentView('community')}
        >
          🌐
        </button>
        <button 
          className={`nav-button ${currentView === 'achievements' ? 'active' : ''}`}
          onClick={() => setCurrentView('achievements')}
        >
          🏆
        </button>
      </nav>
    </div>
  );
};

export default UltimateColoringApp; 