import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DATA_DIR,
  SECTION_KEYS,
  buildAssetVersions,
  vkFileExists,
} from "./paths.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_PATH = path.join(DATA_DIR, "content.json");
const DEFAULTS_PATH = path.join(__dirname, "defaults.json");

function collectMediaUrls(data) {
  const urls = new Set();
  for (const section of SECTION_KEYS) {
    for (const url of data.gallery?.[section] ?? []) {
      if (typeof url === "string") urls.add(url.split("?")[0]);
    }
  }
  for (const url of Object.values(data.sectionPreviews ?? {})) {
    if (typeof url === "string") urls.add(url.split("?")[0]);
  }
  for (const url of data.photoStrip ?? []) {
    if (typeof url === "string") urls.add(url.split("?")[0]);
  }
  for (const pick of data.exhibitionPicks ?? []) {
    if (pick?.src) urls.add(pick.src.split("?")[0]);
  }
  for (const painting of data.paintingsForSale ?? []) {
    if (painting?.image) urls.add(painting.image.split("?")[0]);
  }
  return urls;
}

function attachAssetVersions(data) {
  return {
    ...data,
    assetVersions: buildAssetVersions(collectMediaUrls(data)),
  };
}

function sanitizeContent(data) {
  const gallery = { ...(data.gallery ?? {}) };

  for (const section of SECTION_KEYS) {
    const images = Array.isArray(gallery[section]) ? gallery[section] : [];
    gallery[section] = images.filter((url) => vkFileExists(url));
  }

  const sectionPreviews = { ...(data.sectionPreviews ?? {}) };
  for (const [section, preview] of Object.entries(sectionPreviews)) {
    if (
      !SECTION_KEYS.includes(section) ||
      typeof preview !== "string" ||
      !gallery[section]?.includes(preview) ||
      !vkFileExists(preview)
    ) {
      delete sectionPreviews[section];
    }
  }

  const photoStrip = Array.isArray(data.photoStrip)
    ? data.photoStrip.filter((url) => vkFileExists(url))
    : data.photoStrip;

  const exhibitionPicks = Array.isArray(data.exhibitionPicks)
    ? data.exhibitionPicks.filter((pick) => pick?.src && vkFileExists(pick.src))
    : data.exhibitionPicks;

  const paintingsForSale = Array.isArray(data.paintingsForSale)
    ? data.paintingsForSale.map((p) =>
        p?.image && !vkFileExists(p.image) ? { ...p, image: "" } : p
      )
    : data.paintingsForSale;

  return attachAssetVersions({
    ...data,
    gallery,
    sectionPreviews,
    photoStrip,
    exhibitionPicks,
    paintingsForSale,
  });
}

function contentChanged(before, after) {
  return JSON.stringify(before) !== JSON.stringify(after);
}

export function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readContent() {
  ensureDataDir();
  if (!fs.existsSync(CONTENT_PATH)) {
    const defaults = JSON.parse(fs.readFileSync(DEFAULTS_PATH, "utf8"));
    const sanitized = sanitizeContent(defaults);
    writeContent(sanitized);
    return sanitized;
  }

  const data = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf8"));
  if (!data.sectionPreviews || typeof data.sectionPreviews !== "object") {
    data.sectionPreviews = {};
  }

  const sanitized = sanitizeContent(data);
  if (contentChanged(data, sanitized)) {
    writeContent(sanitized);
  }
  return sanitized;
}

export function writeContent(data) {
  ensureDataDir();
  const tmp = `${CONTENT_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, CONTENT_PATH);
}
