"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Multer Storage Configuration
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dirPath = `/public/${req.body.imagePath}`;
        const dir = path_1.default.join(app_root_path_1.default.path, dirPath);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, `public/${req.body.imagePath}`);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});
// Multer File Filter
const multerFilter = (req, file, cb) => {
    req.error = null;
    if (req.body.imagePath && req.body.imagePath === "user") {
        const allowedTypes = ["png", "jpg", "jpeg"];
        const fileType = file.mimetype.split("/")[1];
        if (allowedTypes.includes(fileType)) {
            cb(null, true);
        }
        else {
            req.error = "Only png, jpg, jpeg allowed.";
            cb(null, false);
        }
    }
    else if (req.body.imagePath && req.body.imagePath === "model") {
        const allowedTypes = ["png", "jpg", "jpeg"];
        const fileType = file.mimetype.split("/")[1];
        if (allowedTypes.includes(fileType)) {
            cb(null, true);
        }
        else {
            req.error = "Only png, jpg, jpeg allowed.";
            cb(null, false);
        }
    }
    else if (req.body.imagePath && req.body.imagePath === "ablumImages") {
        const allowedTypes = ["png", "jpg", "jpeg"];
        const fileType = file.mimetype.split("/")[1];
        if (allowedTypes.includes(fileType)) {
            cb(null, true);
        }
        else {
            req.error = "Only png, jpg, jpeg allowed.";
            cb(null, false);
        }
    }
    else if (req.body.imagePath && req.body.imagePath === "productImages") {
        const allowedTypes = ["png", "jpg", "jpeg"];
        const fileType = file.mimetype.split("/")[1];
        if (allowedTypes.includes(fileType)) {
            cb(null, true);
        }
        else {
            req.error = "Only png, jpg, jpeg allowed.";
            cb(null, false);
        }
    }
    else {
        cb(null, true);
    }
};
// Export configured multer
const upload = (0, multer_1.default)({
    storage,
    fileFilter: multerFilter,
});
exports.default = upload;
