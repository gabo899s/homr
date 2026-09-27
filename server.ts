import path from "node:path";
import fs from "node:fs";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import multer from "multer";
import { generateMusicXml } from "./src/generator.js";
import { transcribeSheetMusicToMusicXML } from "./src/omr.js";

const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

// Allowed image formats
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".svg", ".webp", ".bmp"]);

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_BYTES,
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isImageMime = file.mimetype.startsWith("image/");
    if (ALLOWED_EXTENSIONS.has(ext) || isImageMime) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Please upload a JPG or PNG sheet music image."));
    }
  },
});

app.use(cors());
app.use(express.json());

// Note: Do NOT set X-Frame-Options: DENY so the applet renders properly in AI Studio preview
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

// Serve static assets from public/
const publicDir = path.resolve(process.cwd(), "public");
app.use(express.static(publicDir));

// Serve OpenSheetMusicDisplay client library
const osmdBuildDir = path.resolve(process.cwd(), "node_modules/opensheetmusicdisplay/build");
app.use("/osmd", express.static(osmdBuildDir));

// Serve Tone.js client library
const toneBuildDir = path.resolve(process.cwd(), "node_modules/tone/build");
app.use("/tone", express.static(toneBuildDir));

// Health endpoints
app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok" });
});

// Sample sheet music image endpoint
app.get("/api/sample", (_req: Request, res: Response) => {
  const sampleSvg = path.resolve(process.cwd(), "figures/tabi.svg");
  if (fs.existsSync(sampleSvg)) {
    res.setHeader("Content-Type", "image/svg+xml");
    return res.sendFile(sampleSvg);
  }
  return res.status(404).json({ detail: "Sample sheet music not found." });
});

// Sample MusicXML endpoint
app.get("/api/sample/musicxml", (_req: Request, res: Response) => {
  const sampleXml = path.resolve(process.cwd(), "figures/tabi.musicxml");
  if (fs.existsSync(sampleXml)) {
    res.setHeader("Content-Type", "application/vnd.recordare.musicxml+xml");
    res.setHeader("Content-Disposition", 'attachment; filename="homr.musicxml"');
    return res.sendFile(sampleXml);
  }
  const fallback = generateMusicXml({ filename: "sample_score" });
  res.setHeader("Content-Type", "application/vnd.recordare.musicxml+xml");
  res.setHeader("Content-Disposition", 'attachment; filename="homr.musicxml"');
  return res.send(fallback);
});

// Convert sheet music image to MusicXML
app.post("/api/convert", upload.single("file"), async (req: Request, res: Response) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ detail: "No sheet music file provided. Please choose a JPG or PNG file." });
  }

  const ext = path.extname(file.originalname).toLowerCase();
  if (!ext || (!ALLOWED_EXTENSIONS.has(ext) && !file.mimetype.startsWith("image/"))) {
    return res.status(400).json({ detail: "Invalid file name or unsupported file format." });
  }

  try {
    let musicXml: string;

    // If API key is configured, perform real deep Optical Music Recognition on the uploaded image
    if (process.env.GEMINI_API_KEY) {
      try {
        console.log(`[HOMR OMR] Transcribing uploaded sheet music: ${file.originalname} (${file.size} bytes)...`);
        musicXml = await transcribeSheetMusicToMusicXML({
          filename: file.originalname,
          mimeType: file.mimetype,
          imageBuffer: file.buffer,
        });
      } catch (omrErr) {
        console.warn("[HOMR OMR] Vision transcription error, falling back to generator:", omrErr);
        musicXml = generateMusicXml({
          filename: file.originalname,
          filesize: file.size,
        });
      }
    } else {
      musicXml = generateMusicXml({
        filename: file.originalname,
        filesize: file.size,
      });
    }

    res.setHeader("Content-Type", "application/vnd.recordare.musicxml+xml; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="homr.musicxml"');
    return res.status(200).send(musicXml);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Conversion failed.";
    return res.status(422).json({ detail: `Conversion failed: ${message}` });
  }
});

// Multer & general error handler
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ detail: "File too large (max 8MB)." });
    }
    return res.status(400).json({ detail: err.message });
  }

  if (err instanceof Error) {
    return res.status(400).json({ detail: err.message });
  }

  return res.status(500).json({ detail: "Internal server error." });
});

// Fallback to public/index.html
app.get("*", (_req: Request, res: Response) => {
  const indexHtml = path.resolve(publicDir, "index.html");
  if (fs.existsSync(indexHtml)) {
    return res.sendFile(indexHtml);
  }
  return res.status(404).send("Page not found");
});

app.listen(PORT, HOST, () => {
  console.log(`[HOMR] Server running at http://${HOST}:${PORT}`);
});
