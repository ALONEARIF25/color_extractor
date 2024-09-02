document
  .getElementById("imageUpload")
  .addEventListener("change", handleImageUpload);

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const img = new Image();
  img.src = URL.createObjectURL(file);

  img.onload = () => {
    const canvas = document.getElementById("imageCanvas");
    const ctx = canvas.getContext("2d");
    canvas.width = 400;
    canvas.height = 400;

    // Draw the image on the canvas with object-fit cover effect
    const scale = Math.max(
      canvas.width / img.width,
      canvas.height / img.height
    );
    const x = canvas.width / 2 - (img.width / 2) * scale;
    const y = canvas.height / 2 - (img.height / 2) * scale;
    ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

    // Create and display 2x2 mosaic
    createMosaic(ctx, 2, "mosaic2x2Canvas");

    // Create and display 4x4 mosaic
    createMosaic(ctx, 4, "mosaic4x4Canvas");

    // Get colors from 2x2 grid
    const colors2x2 = getColorsFromMosaic("mosaic2x2Canvas", 2);
    displayColors(colors2x2, document.getElementById("grid2x2"));

    // Get colors from 4x4 grid
    const colors4x4 = getColorsFromMosaic("mosaic4x4Canvas", 4);
    displayColors(colors4x4, document.getElementById("grid4x4"));

    // Combine and filter colors
    let combinedColors = [...colors2x2, ...colors4x4];
    combinedColors = filterSimilarColors(combinedColors);

    // Sort colors by brightness
    const sortedColors = sortColorsByBrightness(combinedColors);
    displayColors(sortedColors, document.getElementById("sortedColors"));

    // Display the brightest and darkest colors
    const brightest = sortedColors[0];
    const darkest = sortedColors[sortedColors.length - 1];
    displayColors(
      [brightest, darkest],
      document.getElementById("brightestDarkest")
    );

    // Display complementary colors under sorted colors
    displayComplementaryColors(
      sortedColors,
      document.getElementById("complementaryColors")
    );
  };
}

function createMosaic(originalCtx, gridSize, mosaicCanvasId) {
  const mosaicCanvas = document.getElementById(mosaicCanvasId);
  const mosaicCtx = mosaicCanvas.getContext("2d");
  mosaicCanvas.width = 400;
  mosaicCanvas.height = 400;

  const tileWidth = mosaicCanvas.width / gridSize;
  const tileHeight = mosaicCanvas.height / gridSize;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Get the color of the center pixel of the tile
      const imgData = originalCtx.getImageData(
        (x + 0.5) * tileWidth,
        (y + 0.5) * tileHeight,
        1,
        1
      );
      const color = `rgb(${imgData.data[0]}, ${imgData.data[1]}, ${imgData.data[2]})`;
      mosaicCtx.fillStyle = color;
      mosaicCtx.fillRect(x * tileWidth, y * tileHeight, tileWidth, tileHeight);
    }
  }
}

function getColorsFromMosaic(mosaicCanvasId, gridSize) {
  const mosaicCanvas = document.getElementById(mosaicCanvasId);
  const mosaicCtx = mosaicCanvas.getContext("2d");
  const colors = [];
  const tileWidth = mosaicCanvas.width / gridSize;
  const tileHeight = mosaicCanvas.height / gridSize;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      // Get the color of the center pixel of the tile
      const imgData = mosaicCtx.getImageData(
        (x + 0.5) * tileWidth,
        (y + 0.5) * tileHeight,
        1,
        1
      );
      const color = `rgb(${imgData.data[0]}, ${imgData.data[1]}, ${imgData.data[2]})`;
      colors.push(color);
    }
  }
  return colors;
}

function displayColors(colors, container) {
  container.innerHTML = "";
  colors.forEach((color) => {
    const hexColor = rgbToHex(color);
    const colorBox = document.createElement("div");
    colorBox.className = "colorBox";
    colorBox.style.backgroundColor = color;
    colorBox.innerHTML = `<span>${hexColor}</span>`;
    colorBox.addEventListener("click", () => copyToClipboard(hexColor));
    container.appendChild(colorBox);
  });
}

function rgbToHex(rgb) {
  const rgbValues = rgb.match(/\d+/g);
  return `#${rgbValues
    .map((val) => (+val).toString(16).padStart(2, "0"))
    .join("")}`;
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    alert(`Copied ${text} to clipboard!`);
  });
}

function sortColorsByBrightness(colors) {
  return colors.sort((a, b) => getBrightness(b) - getBrightness(a));
}

function getBrightness(color) {
  const rgbValues = color.match(/\d+/g).map(Number);
  return (rgbValues[0] * 299 + rgbValues[1] * 587 + rgbValues[2] * 114) / 1000;
}

function filterSimilarColors(colors) {
  return colors.filter((color, index, self) => {
    return self.findIndex((c) => areColorsSimilar(c, color)) === index;
  });
}

function areColorsSimilar(color1, color2) {
  const rgb1 = color1.match(/\d+/g).map(Number);
  const rgb2 = color2.match(/\d+/g).map(Number);

  const brightnessDiff = Math.abs(
    getBrightness(color1) - getBrightness(color2)
  );
  const colorDiff = Math.sqrt(
    Math.pow(rgb1[0] - rgb2[0], 2) +
      Math.pow(rgb1[1] - rgb2[1], 2) +
      Math.pow(rgb1[2] - rgb2[2], 2)
  );

  return brightnessDiff < 10 && colorDiff < 30;
}

// Function to get the complementary color
function getComplementaryColor(color) {
  const rgbValues = color.match(/\d+/g).map(Number);
  const compColor = rgbValues.map((val) => 255 - val);
  return `rgb(${compColor[0]}, ${compColor[1]}, ${compColor[2]})`;
}

// Function to display complementary colors
function displayComplementaryColors(colors, container) {
  container.innerHTML = "";
  colors.forEach((color) => {
    const compColor = getComplementaryColor(color);
    const hexColor = rgbToHex(compColor);
    const colorBox = document.createElement("div");
    colorBox.className = "colorBox";
    colorBox.style.backgroundColor = compColor;
    colorBox.innerHTML = `<span>${hexColor}</span>`;
    colorBox.addEventListener("click", () => copyToClipboard(hexColor));
    container.appendChild(colorBox);
  });
}
