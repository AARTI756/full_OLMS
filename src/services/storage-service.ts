import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const STORAGE_ROOT = path.join(process.cwd(), "storage", "resumes");

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function ensureStorageRoot() {
  await fs.mkdir(STORAGE_ROOT, { recursive: true });
}

export interface StoredFileMetadata {
  storagePath: string;
  storageKey: string;
  fileName: string;
  mimeType: string;
  size: number;
}

export async function saveUploadedFile(file: File): Promise<StoredFileMetadata> {
  await ensureStorageRoot();

  const fileName = sanitizeFileName(file.name);
  const storageKey = `${randomUUID()}-${fileName}`;
  const storagePath = path.join(STORAGE_ROOT, storageKey);
  const buffer = Buffer.from(await file.arrayBuffer());

  await fs.writeFile(storagePath, buffer, { mode: 0o600 });

  return {
    storagePath,
    storageKey,
    fileName,
    mimeType: file.type || "application/octet-stream",
    size: buffer.length,
  };
}

export async function readStoredFile(storagePath: string) {
  const normalized = path.resolve(storagePath);
  if (!normalized.startsWith(path.resolve(STORAGE_ROOT))) {
    throw new Error("Invalid storage path");
  }

  const buffer = await fs.readFile(normalized);
  const stats = await fs.stat(normalized);

  return {
    buffer,
    size: stats.size,
  };
}

export async function deleteStoredFile(storagePath: string) {
  const normalized = path.resolve(storagePath);
  if (!normalized.startsWith(path.resolve(STORAGE_ROOT))) {
    throw new Error("Invalid storage path");
  }

  await fs.rm(normalized, { force: true });
}
