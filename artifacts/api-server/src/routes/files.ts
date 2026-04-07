import { Router, type IRouter } from "express";
import multer from "multer";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";
import { type AuthedRequest, requireAuth } from "../lib/auth";

const router: IRouter = Router();

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), "uploads");
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + extension);
  },
});

// File filter for digital product files
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common 3D printing and digital design file types
  const allowedTypes = [
    "application/octet-stream", // STL files
    "model/stl",
    "application/sla",
    "model/obj",
    "application/x-tgif", // OBJ
    "application/x-wavefront-obj",
    "image/png",
    "image/jpeg",
    "image/gif",
    "application/pdf",
    "application/zip",
    "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
  ];

  // Also check file extensions
  const allowedExtensions = [
    ".stl",
    ".obj",
    ".3mf",
    ".ply",
    ".gcode",
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".pdf",
    ".zip",
    ".rar",
    ".7z",
    ".dxf",
    ".svg",
  ];

  const fileExt = path.extname(file.originalname).toLowerCase();

  if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`File type not allowed. Allowed types: ${allowedExtensions.join(", ")}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Upload single file
router.post("/upload", requireAuth, upload.single("file"), async (req: AuthedRequest, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "no_file", message: "No file uploaded." });
      return;
    }

    // Return file information
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({
      filename: req.file.filename,
      originalName: req.file.originalname,
      url: fileUrl,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: "upload_failed", message: "File upload failed." });
  }
});

// Upload multiple files
router.post("/upload-multiple", requireAuth, upload.array("files", 10), async (req: AuthedRequest, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      res.status(400).json({ error: "no_files", message: "No files uploaded." });
      return;
    }

    const files = (req.files as Express.Multer.File[]).map((file) => ({
      filename: file.filename,
      originalName: file.originalname,
      url: `/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    }));

    res.json({ files });
  } catch (error) {
    console.error("Multiple file upload error:", error);
    res.status(500).json({ error: "upload_failed", message: "File upload failed." });
  }
});

// Serve uploaded files
router.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);

  if (!existsSync(filePath)) {
    res.status(404).json({ error: "file_not_found", message: "File not found." });
    return;
  }

  res.sendFile(filePath);
});

export default router;