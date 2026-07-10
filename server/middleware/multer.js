import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // Fix UTF-8 encoding bug where unicode characters (e.g. narrow no-break space) get corrupted to latin1 Mojibake
    const safeName = Buffer.from(file.originalname, "latin1").toString("utf8");
    cb(null, Date.now() + "-" + safeName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "video/mp4",
    "video/mpeg",
    "video/quicktime"
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, WEBP, GIF images and MP4, MOV, MPEG videos are allowed."), false);
  }
};

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB max file size
  },
  fileFilter
});

export default upload;
