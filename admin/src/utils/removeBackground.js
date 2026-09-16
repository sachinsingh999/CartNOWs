import { removeBackground } from "@imgly/background-removal";

/**
 * Automatically removes the background from an image file, blob, or URL string
 * using on-device WebAssembly AI and returns a transparent PNG File.
 * 
 * @param {File | Blob | string} imageSource - The source file, blob, or image URL
 * @param {(progress: number, stage?: string) => void} [onProgress] - Optional progress callback (0 - 100)
 * @returns {Promise<{ file: File, previewUrl: string }>}
 */
export const removeImageBackground = async (imageSource, onProgress) => {
  try {
    let sourceToProcess = imageSource;

    // If source is a remote URL string, fetch as blob first to avoid CORS issues where possible
    if (typeof imageSource === "string" && (imageSource.startsWith("http://") || imageSource.startsWith("https://"))) {
      try {
        const resp = await fetch(imageSource, { mode: "cors" });
        if (resp.ok) {
          sourceToProcess = await resp.blob();
        }
      } catch (fetchErr) {
        console.warn("Direct blob fetch failed, falling back to passing URL to imgly:", fetchErr);
      }
    }

    const blob = await removeBackground(sourceToProcess, {
      progress: (key, current, total) => {
        if (total > 0 && onProgress) {
          const pct = Math.min(99, Math.round((current / total) * 100));
          const stageName = key.includes("fetch")
            ? "Downloading AI Model..."
            : key.includes("compute")
            ? "Segmenting Subject..."
            : "Processing Background...";
          onProgress(pct, stageName);
        }
      },
      output: {
        format: "image/png",
        quality: 0.95
      }
    });

    if (onProgress) onProgress(100, "Complete!");

    const originalName =
      imageSource instanceof File
        ? imageSource.name.replace(/\.[^/.]+$/, "")
        : "transparent-cutout";

    const transparentFile = new File([blob], `${originalName}-no-bg.png`, {
      type: "image/png",
      lastModified: Date.now()
    });

    const previewUrl = URL.createObjectURL(blob);

    return {
      file: transparentFile,
      previewUrl
    };
  } catch (error) {
    console.error("AI background removal error:", error);
    throw error;
  }
};

