import fs from "fs";
import { v2 as cloudinary } from "cloudinary";

/**
 * Remove background from an image using remove.bg API or Cloudinary transformation
 * @param {Object} options
 * @param {string} [options.filePath] - Local file path of the image
 * @param {string} [options.imageUrl] - Remote or Cloudinary image URL
 * @param {Buffer} [options.buffer] - Image buffer
 * @param {string} [options.mimetype] - MIME type of the image
 * @param {string} [options.originalname] - Original file name
 * @returns {Promise<string|null>} Secure Cloudinary URL of the transparent background image, or null if failed
 */
export const removeBackground = async ({ filePath, imageUrl, buffer, mimetype = "image/png", originalname = "product.png" }) => {
  const removeBgApiKey = process.env.REMOVE_BG;

  try {
    let transparentBuffer = null;

    if (removeBgApiKey) {
      console.log("[BG-Removal] Attempting background removal via remove.bg API...");
      const formData = new FormData();
      formData.append("size", "full");

      if (filePath && fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath);
        const fileBlob = new Blob([fileData], { type: mimetype || "image/jpeg" });
        formData.append("image_file", fileBlob, originalname);
      } else if (buffer) {
        const fileBlob = new Blob([buffer], { type: mimetype || "image/png" });
        formData.append("image_file", fileBlob, originalname);
      } else if (imageUrl && imageUrl.startsWith("http")) {
        formData.append("image_url", imageUrl);
      }

      const response = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: {
          "X-Api-Key": removeBgApiKey
        },
        body: formData
      });

      if (response.ok) {
        const arrayBuf = await response.arrayBuffer();
        transparentBuffer = Buffer.from(arrayBuf);
        console.log("[BG-Removal] Successfully extracted transparent foreground from remove.bg");
      } else {
        const errText = await response.text();
        console.warn(`[BG-Removal] remove.bg API response (${response.status}): ${errText}`);
      }
    } else {
      console.warn("[BG-Removal] No REMOVE_BG API key found in environment");
    }

    // If we have a transparent buffer from remove.bg, upload it to Cloudinary
    if (transparentBuffer) {
      console.log("[BG-Removal] Uploading transparent PNG to Cloudinary products-bg-removed folder...");
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "products-bg-removed",
            format: "png",
            resource_type: "image"
          },
          (err, result) => {
            if (err) {
              console.error("[BG-Removal] Cloudinary upload stream error:", err);
              reject(err);
            } else {
              resolve(result);
            }
          }
        );
        stream.write(transparentBuffer);
        stream.end();
      });

      if (uploadResult && uploadResult.secure_url) {
        console.log(`[BG-Removal] Successfully created transparent product card image: ${uploadResult.secure_url}`);
        return uploadResult.secure_url;
      }
    }

    // Fallback: If imageUrl is a Cloudinary URL, generate Cloudinary AI background removal transformation
    if (imageUrl && imageUrl.includes("res.cloudinary.com") && imageUrl.includes("/image/upload/")) {
      const parts = imageUrl.split("/image/upload/");
      const transformedUrl = `${parts[0]}/image/upload/e_background_removal,f_png/${parts[1].replace(/\.[^/.]+$/, ".png")}`;
      console.log(`[BG-Removal] Fallback to Cloudinary background removal transformation URL: ${transformedUrl}`);
      return transformedUrl;
    }

    return null;
  } catch (error) {
    console.error("[BG-Removal] Background removal process encountered an error:", error.message);
    return null;
  }
};

/**
 * Automatically process product cover / first image for clean background-removed card display
 * @param {Object} params
 * @param {Object} [params.firstFile] - Express multer file object
 * @param {string} [params.firstImageUrl] - Uploaded image URL
 * @returns {Promise<string>} Background removed image URL, or empty string if failed
 */
export const autoProcessProductCardImage = async ({ firstFile, firstImageUrl }) => {
  try {
    let resultUrl = null;

    if (firstFile && firstFile.path) {
      resultUrl = await removeBackground({
        filePath: firstFile.path,
        mimetype: firstFile.mimetype,
        originalname: firstFile.originalname,
        imageUrl: firstImageUrl
      });
    } else if (firstImageUrl) {
      resultUrl = await removeBackground({
        imageUrl: firstImageUrl
      });
    }

    return resultUrl || "";
  } catch (err) {
    console.warn("[BG-Removal] autoProcessProductCardImage failed non-critically:", err.message);
    return "";
  }
};

export default {
  removeBackground,
  autoProcessProductCardImage
};
