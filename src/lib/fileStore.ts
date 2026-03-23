import fs from "fs";
import path from "path";

/**
 * Simple file-based JSON store for server-side data persistence.
 * Used as a fallback when Supabase is not configured, so all devices
 * share the same data via the API layer.
 *
 * Data is stored in /data/<collection>.json at the project root.
 */

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function filePath(collection: string): string {
  // Sanitize collection name
  const safe = collection.replace(/[^a-zA-Z0-9_-]/g, "");
  return path.join(DATA_DIR, `${safe}.json`);
}

export function readCollection<T = Record<string, unknown>>(collection: string): T[] {
  ensureDir();
  const fp = filePath(collection);
  if (!fs.existsSync(fp)) return [];
  try {
    const raw = fs.readFileSync(fp, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCollection<T>(collection: string, data: T[]): void {
  ensureDir();
  const fp = filePath(collection);
  fs.writeFileSync(fp, JSON.stringify(data, null, 2), "utf-8");
}

export function appendToCollection<T extends Record<string, unknown>>(collection: string, item: T): T {
  const items = readCollection<T>(collection);
  items.push(item);
  writeCollection(collection, items);
  return item;
}

export function updateInCollection<T extends Record<string, unknown>>(
  collection: string,
  id: string,
  updates: Partial<T>,
  idField = "id"
): T | null {
  const items = readCollection<T>(collection);
  const idx = items.findIndex((item) => item[idField] === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...updates, updated_at: new Date().toISOString() };
  writeCollection(collection, items);
  return items[idx];
}

export function deleteFromCollection(collection: string, id: string, idField = "id"): boolean {
  const items = readCollection(collection);
  const filtered = items.filter((item) => item[idField] !== id);
  if (filtered.length === items.length) return false;
  writeCollection(collection, filtered);
  return true;
}

export function findInCollection<T extends Record<string, unknown>>(
  collection: string,
  predicate: (item: T) => boolean
): T | undefined {
  return readCollection<T>(collection).find(predicate);
}
