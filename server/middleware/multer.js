import multer from "multer";

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    // Fix UTF-8 encoding bug where unicode characters (e.g. narrow no-break space) get corrupted to latin1 Mojibake
    const safeName = Buffer.from(file.originalname, "latin1").toString("utf8");
    cb(null, Date.now() + "-" + safeName);
  }
});

const upload = multer({ storage });

export default upload;
