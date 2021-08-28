import { readdirSync } from 'fs';
import path from 'path';

export default function getAllFilesOfType(
  folderPath: string,
  extension: string
): string[] {
  const entries = readdirSync(folderPath, { withFileTypes: true });
  return entries.flatMap(entry => {
    const filePath = path.resolve(folderPath, entry.name);
    if (entry.isDirectory()) return getAllFilesOfType(filePath, extension);
    if (path.extname(entry.name) === `.${extension}`) return filePath;
    return [];
  });
}
