import React, { useState } from "react";

export default function App() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previews, setPreviews] = useState([]);
  const [showPreviews, setShowPreviews] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [imageSize, setImageSize] = useState(null);
  
  // Processing options with better defaults
  const [enhanceQuality, setEnhanceQuality] = useState(true);
  const [removeNoise, setRemoveNoise] = useState(true);
  const [outlineThickness, setOutlineThickness] = useState(1);
  const [minNoiseArea, setMinNoiseArea] = useState(20);

  const validateImage = (file) => {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("Image file is too large. Please use an image smaller than 10MB.");
      return false;
    }

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, or WebP).");
      return false;
    }

    return true;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!validateImage(file)) {
      return;
    }

    setImage(file);
    setImageUrl("");
    setError("");
    setPreviews([]);
    setShowPreviews(false);
    setSelectedMethod(null);
    setImageSize(`${(file.size / 1024 / 1024).toFixed(1)} MB`);
    
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleGeneratePreviews = async () => {
    if (!image && !imageUrl) {
      setError("Please upload an image or enter an image URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      if (image) {
        formData.append("image", image);
      } else if (imageUrl) {
        formData.append("url", imageUrl);
      }

      // Add processing parameters
      formData.append("enhance_quality", enhanceQuality);
      formData.append("remove_noise", removeNoise);
      formData.append("outline_thickness", outlineThickness);
      formData.append("min_noise_area", minNoiseArea);

      const response = await fetch("/api/preview", {
        method: "POST",
        body: formData,
      });

      if (response.status === 413) {
        throw new Error("Image is too large. Please try a smaller image (under 10MB).");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate previews");
      }

      const data = await response.json();
      setPreviews(data.previews);
      setShowPreviews(true);
      setSelectedMethod(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMethod = (methodName) => {
    setSelectedMethod(methodName);
    const selectedPreview = previews.find(p => p.name === methodName);
    if (selectedPreview && selectedPreview.image) {
      setPreview(`data:image/png;base64,${selectedPreview.image}`);
    }
  };

  const handleDownload = () => {
    if (preview) {
      const link = document.createElement('a');
      link.href = preview;
      link.download = `coloring-page-${selectedMethod || 'default'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const processingMethods = [
    { value: "canny", label: "Canny Edge Detection", description: "Best for most images" },
    { value: "sobel", label: "Sobel Operator", description: "Good for gradient-based edges" },
    { value: "laplacian", label: "Laplacian Operator", description: "Detects all edges" },
    { value: "adaptive", label: "Adaptive Thresholding", description: "Good for varying lighting" },
    { value: "cartoon", label: "Cartoon Effect", description: "Artistic style" },
  ];

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Enhanced Coloring Page Converter
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Input Image</h2>
            
            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Image
              </label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {imageSize && (
                <p className="text-xs text-gray-500 mt-1">File size: {imageSize}</p>
              )}
            </div>

            {/* URL Input */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Or Enter Image URL
              </label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  setImage(null);
                  setError("");
                  setPreviews([]);
                  setShowPreviews(false);
                  setSelectedMethod(null);
                  setImageSize(null);
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Processing Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Processing Options</h3>
              
              {/* Quality Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={enhanceQuality}
                      onChange={(e) => setEnhanceQuality(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Enhance Quality</span>
                  </label>
                </div>
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={removeNoise}
                      onChange={(e) => setRemoveNoise(e.target.checked)}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Remove Noise</span>
                  </label>
                </div>
              </div>

              {/* Outline Thickness */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Outline Thickness: {outlineThickness}
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  value={outlineThickness}
                  onChange={(e) => setOutlineThickness(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Thin</span>
                  <span>Medium</span>
                  <span>Thick</span>
                </div>
              </div>

              {/* Noise Area */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Noise Area: {minNoiseArea}
                </label>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={minNoiseArea}
                  onChange={(e) => setMinNoiseArea(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Less Filtering</span>
                  <span>More Filtering</span>
                </div>
              </div>
            </div>

            {/* Generate Previews Button */}
            <button 
              onClick={handleGeneratePreviews} 
              disabled={loading || (!image && !imageUrl)}
              className="w-full mt-6 bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Generating Previews..." : "Generate All Previews"}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* Image Size Warning */}
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Large images will be automatically resized to 1200x1200 pixels for optimal processing.
              </p>
            </div>
          </div>

          {/* Preview Grid */}
          {showPreviews && (
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Processing Methods Comparison</h2>
              <p className="text-gray-600 mb-4">Click on any preview to select it for download</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {previews.map((previewItem) => (
                  <div 
                    key={previewItem.name}
                    className={`border-2 rounded-lg p-3 cursor-pointer transition-all ${
                      selectedMethod === previewItem.name 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleSelectMethod(previewItem.name)}
                  >
                    <h3 className="font-medium text-gray-800 mb-1">{previewItem.label}</h3>
                    <p className="text-xs text-gray-600 mb-2">{previewItem.description}</p>
                    
                    {previewItem.image ? (
                      <img 
                        src={`data:image/png;base64,${previewItem.image}`}
                        alt={previewItem.label}
                        className="w-full h-auto border border-gray-300 rounded"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-32 border border-gray-300 rounded bg-gray-50">
                        <p className="text-red-500 text-sm">Failed to generate</p>
                      </div>
                    )}
                    
                    {selectedMethod === previewItem.name && (
                      <div className="mt-2 text-center">
                        <span className="text-blue-600 text-sm font-medium">✓ Selected</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Download Selected */}
              {selectedMethod && (
                <div className="mt-6 text-center">
                  <button
                    onClick={handleDownload}
                    className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
                  >
                    Download Selected ({selectedMethod})
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Single Preview (when not showing comparison) */}
          {!showPreviews && (
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-semibold mb-4 text-gray-700">Preview</h2>
              {preview ? (
                <div className="space-y-4">
                  <img 
                    src={preview} 
                    alt="Preview" 
                    className="w-full h-auto border border-gray-300 rounded-md"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                    >
                      Download
                    </button>
                    <button
                      onClick={() => setPreview(null)}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-md">
                  <p className="text-gray-500">Upload an image to see the preview</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">Tips for Best Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-medium mb-2">Image Quality</h4>
              <ul className="space-y-1">
                <li>• Use high-contrast images for best results</li>
                <li>• Avoid very dark or very bright images</li>
                <li>• Clear, well-lit photos work best</li>
                <li>• Keep file size under 10MB</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Processing Tips</h4>
              <ul className="space-y-1">
                <li>• Generate all previews to compare methods</li>
                <li>• Click on the preview you like best</li>
                <li>• Try different outline thickness settings</li>
                <li>• Large images are automatically resized</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
