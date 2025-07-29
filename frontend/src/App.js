import React, { useState } from "react";

export default function App() {
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Processing options with better defaults
  const [method, setMethod] = useState("canny");
  const [enhanceQuality, setEnhanceQuality] = useState(true);
  const [removeNoise, setRemoveNoise] = useState(true);
  const [outlineThickness, setOutlineThickness] = useState(1);
  const [minNoiseArea, setMinNoiseArea] = useState(20);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setImageUrl("");
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
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
      formData.append("method", method);
      formData.append("enhance_quality", enhanceQuality);
      formData.append("remove_noise", removeNoise);
      formData.append("outline_thickness", outlineThickness);
      formData.append("min_noise_area", minNoiseArea);

      const response = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to convert image");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPreview(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Enhanced Coloring Page Converter
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                }}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Processing Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">Processing Options</h3>
              
              {/* Method Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Processing Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {processingMethods.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label} - {m.description}
                    </option>
                  ))}
                </select>
              </div>

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

            {/* Convert Button */}
            <button 
              onClick={handleSubmit} 
              disabled={loading || (!image && !imageUrl)}
              className="w-full mt-6 bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? "Converting..." : "Convert to Coloring Page"}
            </button>

            {/* Error Display */}
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">Preview</h2>
            {preview ? (
              <div className="space-y-4">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-auto border border-gray-300 rounded-md"
                />
                <div className="flex space-x-2">
                  <a
                    href={preview}
                    download="coloring-page.png"
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md text-center hover:bg-green-700 transition-colors"
                  >
                    Download
                  </a>
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
        </div>

        {/* Method Descriptions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">Processing Methods</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {processingMethods.map((m) => (
              <div key={m.value} className="p-4 border border-gray-200 rounded-md">
                <h4 className="font-medium text-gray-800">{m.label}</h4>
                <p className="text-sm text-gray-600 mt-1">{m.description}</p>
              </div>
            ))}
          </div>
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
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Processing Tips</h4>
              <ul className="space-y-1">
                <li>• Start with "Canny" method for most images</li>
                <li>• Use "Adaptive" for uneven lighting</li>
                <li>• Try "Cartoon" for artistic effects</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
