import http from "http";
import fs from "fs";
import path from "path";

const PORT = 4444;
const LOGO_PATH = "/Users/sachinkumar/Desktop/PROJECTS/CART_NOW/client/src/assets/logo.png";
const ADMIN_LOGO_PATH = "/Users/sachinkumar/Desktop/PROJECTS/CART_NOW/admin/src/assets/logo.png";

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Crop Logo</title>
      </head>
      <body>
        <h1>Cropping logo...</h1>
        <canvas id="canvas"></canvas>
        <script>
          const img = new Image();
          img.src = "/logo.png";
          img.onload = () => {
            const canvas = document.getElementById("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, img.width, img.height);
            const data = imgData.data;

            let minX = img.width, maxX = 0, minY = img.height, maxY = 0;
            let found = false;

            // Scan pixels to find the bounding box of non-white (and non-transparent) pixels
            for (let y = 0; y < img.height; y++) {
              for (let x = 0; x < img.width; x++) {
                const index = (y * img.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                const a = data[index + 3];

                // Check if the pixel is NOT white (RGB 255,255,255) and NOT fully transparent
                const isWhite = r > 250 && g > 250 && b > 250;
                const isTransparent = a < 10;

                if (!isWhite && !isTransparent) {
                  found = true;
                  if (x < minX) minX = x;
                  if (x > maxX) maxX = x;
                  if (y < minY) minY = y;
                  if (y > maxY) maxY = y;
                }
              }
            }

            if (!found) {
              console.log("No non-white pixels found!");
              return;
            }

            // Add small padding around the cropped bounding box
            const padding = 15;
            minX = Math.max(0, minX - padding);
            minY = Math.max(0, minY - padding);
            maxX = Math.min(img.width - 1, maxX + padding);
            maxY = Math.min(img.height - 1, maxY + padding);

            const cropWidth = maxX - minX + 1;
            const cropHeight = maxY - minY + 1;

            // Draw to a new canvas with cropped size
            const cropCanvas = document.createElement("canvas");
            cropCanvas.width = cropWidth;
            cropCanvas.height = cropHeight;
            const cropCtx = cropCanvas.getContext("2d");
            cropCtx.drawImage(img, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

            // Send base64 to server
            const base64Data = cropCanvas.toDataURL("image/png");
            fetch("/save", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ image: base64Data })
            })
            .then(res => res.text())
            .then(msg => {
              document.body.innerHTML += "<h2>Success: " + msg + "</h2>";
              console.log(msg);
            });
          };
        </script>
      </body>
      </html>
    `);
  } else if (req.url === "/logo.png") {
    res.writeHead(200, { "Content-Type": "image/png" });
    res.end(fs.readFileSync(LOGO_PATH));
  } else if (req.url === "/save" && req.method === "POST") {
    let body = "";
    req.on("data", chunk => { body += chunk; });
    req.on("end", () => {
      const data = JSON.parse(body);
      const base64Image = data.image.split(";base64,").pop();
      fs.writeFileSync(LOGO_PATH, base64Image, { encoding: "base64" });
      fs.writeFileSync(ADMIN_LOGO_PATH, base64Image, { encoding: "base64" });
      res.writeHead(200, { "Content-Type": "text/plain" });
      res.end("Cropped logo saved successfully!");
    });
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
