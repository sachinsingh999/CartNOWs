// Utility: Convert base64 dataUrl to Blob file
export const dataURLtoBlob = (dataurl) => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

// Utility: Flood-fill starting from borders to detect & remove solid white/gray and fake checkerboards
export const removeBackgroundFromImage = (imageElement) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imageElement.naturalWidth;
  canvas.height = imageElement.naturalHeight;
  ctx.drawImage(imageElement, 0, 0);

  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const width = canvas.width;
  const height = canvas.height;

  const visited = new Uint8Array(width * height);
  const queue = [];

  // Sample corner pixel colors (only if they are not already transparent)
  const corners = [];
  const sampleCorner = (x, y) => {
    const idx = (y * width + x) * 4;
    const a = data[idx + 3];
    if (a > 15) {
      corners.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2]
      });
    }
  };

  // Helper to check color distance from already verified background colors
  const isColorCloseToExistingCorners = (r, g, b, tolerance = 75) => {
    if (corners.length === 0) return false;
    for (const c of corners) {
      const dist = Math.abs(r - c.r) + Math.abs(g - c.g) + Math.abs(b - c.b);
      if (dist < tolerance) return true;
    }
    return false;
  };

  // Safe sampler for side and bottom borders: only sample if it matches the top-corner background color profile
  const safeSample = (x, y) => {
    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];
    if (a > 15 && isColorCloseToExistingCorners(r, g, b, 80)) {
      corners.push({ r, g, b });
    }
  };

  // Sample primary top corners
  sampleCorner(0, 0);
  sampleCorner(5, 5);
  sampleCorner(width - 1, 0);
  sampleCorner(width - 6, 5);

  // Dynamically sample side and bottom corners safely (only if they match the background color profile)
  const h25 = Math.floor(height * 0.25);
  const h50 = Math.floor(height * 0.50);
  const h75 = Math.floor(height * 0.75);
  safeSample(0, h25);
  safeSample(width - 1, h25);
  safeSample(0, h50);
  safeSample(width - 1, h50);
  safeSample(0, h75);
  safeSample(width - 1, h75);

  safeSample(0, height - 1);
  safeSample(5, height - 6);
  safeSample(width - 1, height - 1);
  safeSample(width - 6, height - 6);

  // Sample points along the top edge
  const w25 = Math.floor(width * 0.25);
  const w50 = Math.floor(width * 0.50);
  const w75 = Math.floor(width * 0.75);
  sampleCorner(w25, 0);
  sampleCorner(w50, 0);
  sampleCorner(w75, 0);

  // Helper to check color distance from verified background palette
  const isColorCloseToCorners = (r, g, b) => {
    return isColorCloseToExistingCorners(r, g, b, 80);
  };

  // Add top and top-side borders to queue (where the background is always present)
  for (let x = 0; x < width; x++) {
    queue.push(x, 0);
    visited[x] = 1;
  }
  
  // Seed only the top 10% of the side edges to ensure we don't start inside fingers or elbows
  const topSideLimit = Math.floor(height * 0.10);
  for (let y = 1; y < topSideLimit; y++) {
    queue.push(0, y);
    queue.push(width - 1, y);
    visited[y * width] = 1;
    visited[(width - 1) + y * width] = 1;
  }

  // Helper to identify if a pixel color matches our background color profile
  const isBgPixel = (r, g, b, a) => {
    if (a < 15) return true; // Already transparent

    // Strict color match only, preventing neutral garments/skin highlights from being eaten
    return isColorCloseToCorners(r, g, b);
  let head = 0;
  while (head < queue.length) {
    const x = queue[head++];
    const y = queue[head++];

    const idx = (y * width + x) * 4;
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    const a = data[idx + 3];

    if (isBgPixel(r, g, b, a)) {
      // Clear the background pixel (fully transparent)
      data[idx] = 0;
      data[idx + 1] = 0;
      data[idx + 2] = 0;
      data[idx + 3] = 0;

      // Check 4-connected neighbors
      const neighbors = [
        [x + 1, y],
        [x - 1, y],
        [x, y + 1],
        [x, y - 1]
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const nidx = ny * width + nx;
          if (!visited[nidx]) {
            visited[nidx] = 1;
            queue.push(nx, ny);
          }
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas.toDataURL("image/png");
};
