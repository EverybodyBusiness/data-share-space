import { randomUUID } from "crypto";
import fs from "fs/promises";
import path from "path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "uploads";

function getUploadRoot(): string {
  return path.resolve(process.cwd(), UPLOAD_DIR);
}

export interface StoredFileInfo {
  storedName: string;
  storagePath: string;
  sizeBytes: number;
}

export async function saveFile(
  categoryId: string,
  transactionId: string,
  originalName: string,
  buffer: Buffer
): Promise<StoredFileInfo> {
  const ext = path.extname(originalName);
  const storedName = `${randomUUID()}${ext}`;
  const relPath = path.join(categoryId, transactionId, storedName);
  const fullPath = path.join(getUploadRoot(), relPath);

  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, buffer);

  return {
    storedName,
    storagePath: relPath,
    sizeBytes: buffer.length,
  };
}

export async function readFile(storagePath: string): Promise<Buffer> {
  const fullPath = path.join(getUploadRoot(), storagePath);
  return fs.readFile(fullPath);
}

export async function deleteDirectory(dirPath: string): Promise<void> {
  const fullPath = path.join(getUploadRoot(), dirPath);
  await fs.rm(fullPath, { recursive: true, force: true });
}
