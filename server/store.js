import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "data");
const CONTENT_PATH = path.join(DATA_DIR, "content.json");
const DEFAULTS_PATH = path.join(__dirname, "defaults.json");

export function ensureDataDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function readContent() {
  ensureDataDir();
  if (!fs.existsSync(CONTENT_PATH)) {
    const defaults = JSON.parse(fs.readFileSync(DEFAULTS_PATH, "utf8"));
    writeContent(defaults);
    return defaults;
  }
  const data = JSON.parse(fs.readFileSync(CONTENT_PATH, "utf8"));
  if (!data.sectionPreviews || typeof data.sectionPreviews !== "object") {
    data.sectionPreviews = {};
  }
  return data;
}

export function writeContent(data) {
  ensureDataDir();
  const tmp = `${CONTENT_PATH}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf8");
  fs.renameSync(tmp, CONTENT_PATH);
}
