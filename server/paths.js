import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
export const UPLOAD_ROOT =
  process.env.UPLOAD_ROOT || path.join(__dirname, "..", "public", "vk");
/** Bundled gallery shipped with the site build (not wiped on deploy when vk/ is excluded). */
export const STATIC_VK_ROOT =
  process.env.STATIC_VK_ROOT ||
  path.join(__dirname, "..", "public", "vk");

export const SECTION_KEYS = [
  "zhivopis",
  "kurs",
  "masterskaya",
  "mebel",
  "kartiny",
  "masterclass",
];

const FORBIDDEN_PATHS = ["/founder.png", "founder.png"];

export function isForbiddenPath(urlPath) {
  return FORBIDDEN_PATHS.some(
    (p) => urlPath === p || urlPath.endsWith(p) || urlPath.includes("/founder.")
  );
}

function vkRelative(urlPath) {
  if (typeof urlPath !== "string" || !urlPath.startsWith("/vk/")) return null;
  const rel = urlPath.replace(/^\/vk\//, "");
  if (rel.includes("..")) return null;
  return rel;
}

/** Writable upload path — admin uploads always land here. */
export function uploadDiskPath(urlPath) {
  const rel = vkRelative(urlPath);
  if (!rel || isForbiddenPath(urlPath)) return null;
  const section = rel.split("/")[0];
  if (!SECTION_KEYS.includes(section)) return null;
  const resolved = path.resolve(path.join(UPLOAD_ROOT, rel));
  const rootResolved = path.resolve(UPLOAD_ROOT);
  if (!resolved.startsWith(rootResolved)) return null;
  return resolved;
}

export function staticDiskPath(urlPath) {
  const rel = vkRelative(urlPath);
  if (!rel || isForbiddenPath(urlPath)) return null;
  const resolved = path.resolve(path.join(STATIC_VK_ROOT, rel));
  const rootResolved = path.resolve(STATIC_VK_ROOT);
  if (!resolved.startsWith(rootResolved)) return null;
  return resolved;
}

export function vkFileExists(urlPath) {
  const upload = uploadDiskPath(urlPath);
  if (upload && fs.existsSync(upload)) return true;
  const statik = staticDiskPath(urlPath);
  return Boolean(statik && fs.existsSync(statik));
}

export function nextUploadFilename(section) {
  if (!SECTION_KEYS.includes(section)) {
    throw new Error("Invalid section");
  }

  let max = 0;
  for (const root of [UPLOAD_ROOT, STATIC_VK_ROOT]) {
    const dir = path.join(root, section);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir)) {
      const m = /^(\d+)\.jpe?g$/i.exec(f);
      if (m) max = Math.max(max, Number(m[1]));
    }
  }

  const n = max + 1;
  return `${String(n).padStart(2, "0")}.jpg`;
}

export function uploadSectionDir(section) {
  const dir = path.join(UPLOAD_ROOT, section);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

export function vkAssetVersion(urlPath) {
  if (typeof urlPath !== "string" || !urlPath.startsWith("/vk/")) return 0;
  const clean = urlPath.split("?")[0];
  let mtime = 0;
  const upload = uploadDiskPath(clean);
  if (upload && fs.existsSync(upload)) {
    mtime = Math.max(mtime, fs.statSync(upload).mtimeMs);
  }
  const statik = staticDiskPath(clean);
  if (statik && fs.existsSync(statik)) {
    mtime = Math.max(mtime, fs.statSync(statik).mtimeMs);
  }
  return mtime ? Math.floor(mtime) : 0;
}

export function buildAssetVersions(urls) {
  const versions = {};
  for (const url of urls) {
    if (typeof url !== "string" || !url.startsWith("/vk/")) continue;
    const clean = url.split("?")[0];
    const version = vkAssetVersion(clean);
    if (version) versions[clean] = version;
  }
  return versions;
}
