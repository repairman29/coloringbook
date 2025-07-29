// Neural Network-Inspired Image Processing Functions

// Helper function for AI edge density calculation
export const calculateLocalEdgeDensity = (edges, x, y, width, height) => {
  const radius = 5;
  let edgeCount = 0, total = 0;
  
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      const ny = y + dy, nx = x + dx;
      if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
        const idx = (ny * width + nx) * 4;
        if (edges[idx] === 0) edgeCount++;
        total++;
      }
    }
  }
  
  return Math.max(0.5, Math.min(2.0, 1.0 + (edgeCount / total - 0.1) * 2));
};

// NEURAL NETWORK-INSPIRED BACKGROUND SEGMENTATION
export const performBackgroundSegmentation = async (data, width, height) => {
  const segmented = new Uint8ClampedArray(data);
  
  // Simulate SAM-style segmentation using color clustering and region growing
  const colorClusters = [];
  const visited = new Set();
  
  // Sample key pixels for clustering
  for (let y = 0; y < height; y += 10) {
    for (let x = 0; x < width; x += 10) {
      const idx = (y * width + x) * 4;
      const color = [data[idx], data[idx + 1], data[idx + 2]];
      colorClusters.push({color, x, y, count: 1});
    }
  }
  
  // Merge similar clusters
  for (let i = 0; i < colorClusters.length; i++) {
    for (let j = i + 1; j < colorClusters.length; j++) {
      const dist = Math.sqrt(
        Math.pow(colorClusters[i].color[0] - colorClusters[j].color[0], 2) +
        Math.pow(colorClusters[i].color[1] - colorClusters[j].color[1], 2) +
        Math.pow(colorClusters[i].color[2] - colorClusters[j].color[2], 2)
      );
      
      if (dist < 50) { // Similar colors
        colorClusters[i].count += colorClusters[j].count;
        colorClusters.splice(j, 1);
        j--;
      }
    }
  }
  
  // Find background cluster (usually largest or edge-dominant)
  const backgroundCluster = colorClusters.reduce((prev, curr) => 
    curr.count > prev.count ? curr : prev
  );
  
  // Remove background pixels
  for (let i = 0; i < data.length; i += 4) {
    const color = [data[i], data[i + 1], data[i + 2]];
    const dist = Math.sqrt(
      Math.pow(color[0] - backgroundCluster.color[0], 2) +
      Math.pow(color[1] - backgroundCluster.color[1], 2) +
      Math.pow(color[2] - backgroundCluster.color[2], 2)
    );
    
    if (dist < 80) { // Background pixel
      segmented[i] = segmented[i + 1] = segmented[i + 2] = 255; // White
    }
  }
  
  return segmented;
};

// NEURAL LINE ART GENERATION (ControlNet-Inspired)
export const generateNeuralLineArt = async (data, width, height, settings) => {
  const lineArt = new Uint8ClampedArray(data.length);
  
  // Convert to grayscale with enhanced luminance
  const grayData = new Float32Array(width * height);
  for (let i = 0; i < data.length; i += 4) {
    const idx = i / 4;
    grayData[idx] = 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  }
  
  // Multi-scale edge detection (mimics neural network layers)
  const scales = [1, 2, 4]; // Different receptive fields
  const edgeResponses = new Float32Array(width * height);
  
  for (const scale of scales) {
    for (let y = scale; y < height - scale; y++) {
      for (let x = scale; x < width - scale; x++) {
        const idx = y * width + x;
        
        // Larger Sobel-like operators for different scales
        let gx = 0, gy = 0;
        for (let dy = -scale; dy <= scale; dy++) {
          for (let dx = -scale; dx <= scale; dx++) {
            const sampleIdx = (y + dy) * width + (x + dx);
            const weight = Math.exp(-(dx*dx + dy*dy) / (2 * scale * scale));
            
            gx += grayData[sampleIdx] * (dx > 0 ? weight : -weight);
            gy += grayData[sampleIdx] * (dy > 0 ? weight : -weight);
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edgeResponses[idx] += magnitude / scales.length;
      }
    }
  }
  
  // Neural-style thresholding with context awareness
  const threshold = settings.edgeThreshold;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const pixelIdx = idx * 4;
      
      // Context-aware thresholding
      let localThreshold = threshold;
      if (settings.complexity === 'kids') {
        localThreshold *= 1.5; // Higher threshold = fewer lines
      } else if (settings.complexity === 'expert') {
        localThreshold *= 0.7; // Lower threshold = more detail
      }
      
      // Check local neighborhood for line continuation
      let hasNearbyEdge = false;
      for (let dy = -2; dy <= 2; dy++) {
        for (let dx = -2; dx <= 2; dx++) {
          const nIdx = (y + dy) * width + (x + dx);
          if (nIdx >= 0 && nIdx < edgeResponses.length && edgeResponses[nIdx] > localThreshold * 1.2) {
            hasNearbyEdge = true;
            break;
          }
        }
        if (hasNearbyEdge) break;
      }
      
      if (edgeResponses[idx] > localThreshold || (edgeResponses[idx] > localThreshold * 0.6 && hasNearbyEdge)) {
        lineArt[pixelIdx] = lineArt[pixelIdx + 1] = lineArt[pixelIdx + 2] = 0; // Black line
      } else {
        lineArt[pixelIdx] = lineArt[pixelIdx + 1] = lineArt[pixelIdx + 2] = 255; // White
      }
      lineArt[pixelIdx + 3] = 255;
    }
  }
  
  return lineArt;
};

// ENHANCED TRADITIONAL EDGE DETECTION (Improved)
export const enhancedEdgeDetection = async (data, width, height, settings) => {
  const edges = new Uint8ClampedArray(data.length);
  
  // Convert to grayscale
  const grayData = new Uint8ClampedArray(data.length);
  for (let i = 0; i < data.length; i += 4) {
    const gray = Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]);
    grayData[i] = grayData[i + 1] = grayData[i + 2] = gray;
    grayData[i + 3] = 255;
  }
  
  // Gaussian blur for noise reduction
  const blurred = await applyGaussianBlur(grayData, width, height, settings.blurStrength);
  
  // Enhanced Sobel edge detection
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      // Extended Sobel operators
      const gx = (
        -1 * blurred[((y-1) * width + (x-1)) * 4] + 1 * blurred[((y-1) * width + (x+1)) * 4] +
        -2 * blurred[((y) * width + (x-1)) * 4] + 2 * blurred[((y) * width + (x+1)) * 4] +
        -1 * blurred[((y+1) * width + (x-1)) * 4] + 1 * blurred[((y+1) * width + (x+1)) * 4]
      );
      
      const gy = (
        -1 * blurred[((y-1) * width + (x-1)) * 4] - 2 * blurred[((y-1) * width + (x)) * 4] - 1 * blurred[((y-1) * width + (x+1)) * 4] +
        1 * blurred[((y+1) * width + (x-1)) * 4] + 2 * blurred[((y+1) * width + (x)) * 4] + 1 * blurred[((y+1) * width + (x+1)) * 4]
      );
      
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      const edgeValue = magnitude > settings.edgeThreshold ? 0 : 255;
      
      edges[idx] = edges[idx + 1] = edges[idx + 2] = edgeValue;
      edges[idx + 3] = 255;
    }
  }
  
  return edges;
};

// GAUSSIAN BLUR HELPER
export const applyGaussianBlur = async (data, width, height, sigma) => {
  if (sigma <= 0) return data;
  
  const blurred = new Uint8ClampedArray(data);
  const kernelSize = Math.ceil(sigma * 3) * 2 + 1;
  const kernel = [];
  let kernelSum = 0;
  
  // Generate Gaussian kernel
  const center = Math.floor(kernelSize / 2);
  for (let i = 0; i < kernelSize; i++) {
    const distance = Math.abs(i - center);
    kernel[i] = Math.exp(-(distance * distance) / (2 * sigma * sigma));
    kernelSum += kernel[i];
  }
  
  // Normalize kernel
  for (let i = 0; i < kernelSize; i++) {
    kernel[i] /= kernelSum;
  }
  
  // Apply horizontal blur
  for (let y = 0; y < height; y++) {
    for (let x = center; x < width - center; x++) {
      let sum = 0;
      for (let k = 0; k < kernelSize; k++) {
        const sampleX = x + k - center;
        sum += data[(y * width + sampleX) * 4] * kernel[k];
      }
      blurred[(y * width + x) * 4] = blurred[(y * width + x) * 4 + 1] = blurred[(y * width + x) * 4 + 2] = Math.round(sum);
    }
  }
  
  // Apply vertical blur
  for (let x = 0; x < width; x++) {
    for (let y = center; y < height - center; y++) {
      let sum = 0;
      for (let k = 0; k < kernelSize; k++) {
        const sampleY = y + k - center;
        sum += blurred[(sampleY * width + x) * 4] * kernel[k];
      }
      blurred[(y * width + x) * 4] = blurred[(y * width + x) * 4 + 1] = blurred[(y * width + x) * 4 + 2] = Math.round(sum);
    }
  }
  
  return blurred;
};

// CONTOUR SIMPLIFICATION (Vector-Style)
export const simplifyContours = async (data, width, height, settings) => {
  const simplified = new Uint8ClampedArray(data);
  
  // Find contours and simplify them
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      
      if (data[idx] === 0) { // Black pixel (line)
        // Count neighboring line pixels
        let neighbors = 0;
        const directions = [
          [-1,-1], [-1,0], [-1,1],
          [0,-1],          [0,1],
          [1,-1],  [1,0],  [1,1]
        ];
        
        for (const [dx, dy] of directions) {
          const nIdx = ((y + dy) * width + (x + dx)) * 4;
          if (nIdx >= 0 && nIdx < data.length && data[nIdx] === 0) {
            neighbors++;
          }
        }
        
        // Simplify isolated pixels or overly complex areas
        if (neighbors < 2 && settings.complexity === 'kids') {
          simplified[idx] = simplified[idx + 1] = simplified[idx + 2] = 255; // Remove
        } else if (neighbors > 6 && settings.complexity !== 'expert') {
          // Thin out dense areas
          if (Math.random() > 0.7) {
            simplified[idx] = simplified[idx + 1] = simplified[idx + 2] = 255;
          }
        }
      }
    }
  }
  
  return simplified;
};

// ADAPTIVE LINE SMOOTHING
export const adaptiveLineSmoothing = async (data, width, height) => {
  const smoothed = new Uint8ClampedArray(data);
  
  // Apply morphological operations for line smoothing
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        if (data[idx] === 0) { // Black pixel
          // Check 3x3 neighborhood
          let blackCount = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nIdx = ((y + dy) * width + (x + dx)) * 4;
              if (data[nIdx] === 0) blackCount++;
            }
          }
          
          // Smooth based on neighborhood
          if (blackCount >= 4) {
            smoothed[idx] = smoothed[idx + 1] = smoothed[idx + 2] = 0;
          } else if (blackCount <= 2) {
            smoothed[idx] = smoothed[idx + 1] = smoothed[idx + 2] = 255;
          }
        }
      }
    }
    
    // Copy smoothed back to data for next pass
    for (let i = 0; i < data.length; i++) {
      data[i] = smoothed[i];
    }
  }
  
  return smoothed;
};

// STYLE TRANSFER APPLICATION
export const applyStyleTransfer = async (data, width, height, style) => {
  const styled = new Uint8ClampedArray(data);
  
  switch (style) {
    case 'anime':
      // Anime style: Bold, clean lines with selective detail
      for (let i = 0; i < styled.length; i += 4) {
        if (styled[i] < 128) {
          styled[i] = styled[i + 1] = styled[i + 2] = 0; // Pure black
        } else {
          styled[i] = styled[i + 1] = styled[i + 2] = 255; // Pure white
        }
      }
      break;
      
    case 'manga':
      // Manga style: Varied line weights
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          if (styled[idx] === 0) {
            // Vary line intensity based on position
            const intensity = Math.sin(x * 0.1) * Math.sin(y * 0.1);
            if (intensity > 0.3) {
              styled[idx] = styled[idx + 1] = styled[idx + 2] = 0;
            } else if (intensity > -0.3) {
              styled[idx] = styled[idx + 1] = styled[idx + 2] = 100;
            }
          }
        }
      }
      break;
      
    case 'watercolor':
      // Watercolor style: Soft, varied edges
      for (let i = 0; i < styled.length; i += 4) {
        if (styled[i] === 0) {
          const variation = Math.random() * 150 + 50;
          styled[i] = styled[i + 1] = styled[idx + 2] = variation;
        }
      }
      break;
  }
  
  return styled;
};

// FINAL IMAGE ENHANCEMENT
export const finalImageEnhancement = async (data, width, height, settings) => {
  const enhanced = new Uint8ClampedArray(data);
  
  // Apply line thickness enhancement
  if (settings.lineThickness > 1) {
    const thickness = settings.lineThickness;
    const dilated = new Uint8ClampedArray(enhanced);
    
    for (let y = thickness; y < height - thickness; y++) {
      for (let x = thickness; x < width - thickness; x++) {
        const idx = (y * width + x) * 4;
        
        if (enhanced[idx] === 0) {
          // Apply circular dilation
          for (let dy = -thickness; dy <= thickness; dy++) {
            for (let dx = -thickness; dx <= thickness; dx++) {
              if (dx * dx + dy * dy <= thickness * thickness) {
                const dilateIdx = ((y + dy) * width + (x + dx)) * 4;
                if (dilateIdx >= 0 && dilateIdx < dilated.length) {
                  dilated[dilateIdx] = dilated[dilateIdx + 1] = dilated[dilateIdx + 2] = 0;
                }
              }
            }
          }
        }
      }
    }
    
    return dilated;
  }
  
  return enhanced;
}; 