import multer, { StorageEngine, FileFilterCallback } from "multer";
import appRoot from "app-root-path";
import path from "path";
import fs from "fs";
import { Request } from "express";

// Multer Storage Configuration
const storage: StorageEngine = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    // Priority: req.body.imagePath > file.fieldname
    const targetDir = req.body.imagePath || file.fieldname;
    const dirPath = `/public/${targetDir}`;
    const dir = path.join(appRoot.path, dirPath);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, `public/${targetDir}`);
  },

  filename: (req: Request, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Multer File Filter
const multerFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  (req as any).error = null;
  const targetDir = req.body.imagePath || file.fieldname;
  const fileType = file.mimetype.split("/")[1];
  const imageTypes = ["png", "jpg", "jpeg", "webp"];

  if (targetDir === "user" || targetDir === "model" || targetDir === "ablumImages" || targetDir === "productImages" || targetDir === "avatar") {
    if (imageTypes.includes(fileType)) {
      cb(null, true);
    } else {
      (req as any).error = `Only ${imageTypes.join(", ")} allowed.`;
      cb(null, false);
    }
  } else if (targetDir === "resume") {
    const allowedTypes = ["pdf"];
    if (allowedTypes.includes(fileType)) {
      cb(null, true);
    } else {
      (req as any).error = "Only pdf allowed for resume.";
      cb(null, false);
    }
  } else {
    cb(null, true);
  }
};

// Export configured multer
const upload = multer({
  storage,
  fileFilter: multerFilter,
});

export default upload;
