import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import multer from "multer";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  authMiddleware,
  clearAuthCookie,
  getAuthConfig,
  setAuthCookie,
  signToken,
  verifyLogin,
  verifyToken,
  COOKIE,
} from "./auth.js";
import { readContent, writeContent } from "./store.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3001);
const UPLOAD_ROOT =
  process.env.UPLOAD_ROOT || path.join(__dirname, "..", "public", "vk");

const SECTION_KEYS = [
  "zhivopis",
  "kurs",
  "masterskaya",
  "mebel",
  "kartiny",
  "masterclass",
];

const FORBIDDEN_PATHS = ["/founder.png", "founder.png"];

function isSectionKey(key) {
  return SECTION_KEYS.includes(key);
}

function isForbiddenPath(urlPath) {
  return FORBIDDEN_PATHS.some(
    (p) => urlPath === p || urlPath.endsWith(p) || urlPath.includes("/founder.")
  );
}

function urlToDisk(urlPath) {
  if (!urlPath.startsWith("/vk/")) return null;
  if (isForbiddenPath(urlPath)) return null;
  const rel = urlPath.replace(/^\/vk\//, "");
  const section = rel.split("/")[0];
  if (!isSectionKey(section)) return null;
  const disk = path.join(UPLOAD_ROOT, rel);
  const resolved = path.resolve(disk);
  const rootResolved = path.resolve(UPLOAD_ROOT);
  if (!resolved.startsWith(rootResolved)) return null;
  return resolved;
}

function nextFilename(section) {
  const dir = path.join(UPLOAD_ROOT, section);
  fs.mkdirSync(dir, { recursive: true });
  let max = 0;
  if (fs.existsSync(dir)) {
    for (const f of fs.readdirSync(dir)) {
      const m = /^(\d+)\.jpe?g$/i.exec(f);
      if (m) max = Math.max(max, Number(m[1]));
    }
  }
  const n = max + 1;
  return `${String(n).padStart(2, "0")}.jpg`;
}

const upload = multer({
  storage: multer.diskStorage({
    destination(req, _file, cb) {
      const section = req.params.section;
      if (!isSectionKey(section)) return cb(new Error("Invalid section"));
      const dir = path.join(UPLOAD_ROOT, section);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(req, _file, cb) {
      const urlPath = req.body?.path;
      if (urlPath && typeof urlPath === "string") {
        const disk = urlToDisk(urlPath);
        if (disk) {
          cb(null, path.basename(disk));
          return;
        }
      }
      cb(null, nextFilename(req.params.section));
    },
  }),
  limits: { fileSize: 12 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (!/^image\/(jpe?g|png|webp)$/i.test(file.mimetype)) {
      cb(new Error("Only JPEG, PNG, WebP images"));
      return;
    }
    cb(null, true);
  },
});

const app = express();
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/content", (_req, res) => {
  res.json(readContent());
});

app.post("/api/auth/login", async (req, res) => {
  const { login, password } = req.body ?? {};
  if (!login || !password) {
    return res.status(400).json({ error: "Логин и пароль обязательны" });
  }
  const ok = await verifyLogin(String(login), String(password));
  if (!ok) {
    return res.status(401).json({ error: "Неверный логин или пароль" });
  }
  const { secret, maxAge } = getAuthConfig();
  const token = signToken({ sub: login }, secret);
  setAuthCookie(res, token, maxAge, req);
  res.json({ ok: true });
});

app.post("/api/auth/logout", (req, res) => {
  clearAuthCookie(res, req);
  res.json({ ok: true });
});

app.get("/api/auth/me", (req, res) => {
  const { secret } = getAuthConfig();
  const token = req.cookies?.[COOKIE];
  if (!token || !verifyToken(token, secret)) {
    return res.json({ ok: false });
  }
  res.json({ ok: true });
});

app.put("/api/gallery/:section", authMiddleware, (req, res) => {
  const { section } = req.params;
  if (!isSectionKey(section)) {
    return res.status(400).json({ error: "Unknown section" });
  }
  const { images } = req.body ?? {};
  if (!Array.isArray(images)) {
    return res.status(400).json({ error: "images must be an array" });
  }
  for (const img of images) {
    if (typeof img !== "string" || !img.startsWith(`/vk/${section}/`)) {
      return res.status(400).json({ error: "Invalid image path" });
    }
    if (isForbiddenPath(img)) {
      return res.status(403).json({ error: "Forbidden path" });
    }
  }
  const content = readContent();
  content.gallery[section] = images;
  writeContent(content);
  res.json({ ok: true, images });
});

app.post(
  "/api/gallery/:section/upload",
  authMiddleware,
  (req, res, next) => {
    const { section } = req.params;
    if (!isSectionKey(section)) {
      return res.status(400).json({ error: "Unknown section" });
    }
    next();
  },
  upload.single("file"),
  (req, res) => {
    const { section } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const url = `/vk/${section}/${req.file.filename}`;
    const content = readContent();
    if (!content.gallery[section].includes(url)) {
      content.gallery[section].push(url);
      writeContent(content);
    }
    res.json({ ok: true, url });
  }
);

app.post(
  "/api/gallery/:section/replace",
  authMiddleware,
  upload.single("file"),
  (req, res) => {
    const { section } = req.params;
    const urlPath = req.body?.path;
    if (!isSectionKey(section)) {
      return res.status(400).json({ error: "Unknown section" });
    }
    if (!urlPath || isForbiddenPath(urlPath) || !urlPath.startsWith(`/vk/${section}/`)) {
      return res.status(400).json({ error: "Invalid path" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    res.json({ ok: true, url: urlPath });
  }
);

app.delete("/api/gallery/:section", authMiddleware, (req, res) => {
  const { section } = req.params;
  const { path: urlPath } = req.body ?? {};
  if (!isSectionKey(section)) {
    return res.status(400).json({ error: "Unknown section" });
  }
  if (!urlPath || isForbiddenPath(urlPath)) {
    return res.status(400).json({ error: "Invalid path" });
  }
  const disk = urlToDisk(urlPath);
  if (disk && fs.existsSync(disk)) {
    fs.unlinkSync(disk);
  }
  const content = readContent();
  content.gallery[section] = content.gallery[section].filter((p) => p !== urlPath);
  content.photoStrip = content.photoStrip.filter((p) => p !== urlPath);
  content.exhibitionPicks = content.exhibitionPicks.filter((p) => p.src !== urlPath);
  content.paintingsForSale = content.paintingsForSale.map((p) =>
    p.image === urlPath ? { ...p, image: "" } : p
  );
  if (!content.sectionPreviews) content.sectionPreviews = {};
  if (content.sectionPreviews[section] === urlPath) {
    delete content.sectionPreviews[section];
  }
  writeContent(content);
  res.json({ ok: true });
});

app.put("/api/section-previews/:section", authMiddleware, (req, res) => {
  const { section } = req.params;
  const { preview } = req.body ?? {};
  if (!isSectionKey(section)) {
    return res.status(400).json({ error: "Unknown section" });
  }
  const content = readContent();
  if (!content.sectionPreviews) content.sectionPreviews = {};

  if (preview === null || preview === "") {
    delete content.sectionPreviews[section];
  } else if (typeof preview !== "string") {
    return res.status(400).json({ error: "preview must be a string or null" });
  } else if (!content.gallery[section]?.includes(preview)) {
    return res.status(400).json({ error: "Preview must be an image from this section gallery" });
  } else {
    content.sectionPreviews[section] = preview;
  }

  writeContent(content);
  res.json({ ok: true, preview: content.sectionPreviews[section] ?? null });
});

app.put("/api/exhibition", authMiddleware, (req, res) => {
  const { picks } = req.body ?? {};
  if (!Array.isArray(picks)) {
    return res.status(400).json({ error: "picks must be an array" });
  }
  const content = readContent();
  content.exhibitionPicks = picks;
  writeContent(content);
  res.json({ ok: true });
});

app.put("/api/photo-strip", authMiddleware, (req, res) => {
  const { images } = req.body ?? {};
  if (!Array.isArray(images)) {
    return res.status(400).json({ error: "images must be an array" });
  }
  const content = readContent();
  content.photoStrip = images;
  writeContent(content);
  res.json({ ok: true });
});

app.put("/api/prices", authMiddleware, (req, res) => {
  const { priceGroups } = req.body ?? {};
  if (!Array.isArray(priceGroups)) {
    return res.status(400).json({ error: "priceGroups must be an array" });
  }
  const content = readContent();
  content.priceGroups = priceGroups;
  writeContent(content);
  res.json({ ok: true });
});

app.put("/api/paintings", authMiddleware, (req, res) => {
  const { paintingsForSale } = req.body ?? {};
  if (!Array.isArray(paintingsForSale)) {
    return res.status(400).json({ error: "paintingsForSale must be an array" });
  }
  const content = readContent();
  content.paintingsForSale = paintingsForSale;
  writeContent(content);
  res.json({ ok: true });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

app.listen(PORT, () => {
  getAuthConfig();
  readContent();
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
  console.log(`API listening on :${PORT}`);
  console.log(`Upload root: ${UPLOAD_ROOT}`);
});
