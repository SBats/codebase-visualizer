import { readdirSync } from 'fs';
import path from 'path';
import ts from 'typescript';
import { extractComponentNodeFromAngularDeclaration } from './ng1-components/ng1-utilities';

const scriptArguments = process.argv.slice(2);
const parentFolderPath = scriptArguments[0];

function isTSFile(fileName: string): boolean {
  return fileName.split('.').reverse()[0] === 'ts';
}

function getAllTSFiles(folderPath: string): string[] {
  const entries = readdirSync(folderPath, { withFileTypes: true });
  return entries.flatMap(entry => {
    const filePath = path.resolve(folderPath, entry.name);
    if (entry.isDirectory()) return getAllTSFiles(filePath);
    if (isTSFile(entry.name)) return filePath;
    return [];
  });
}

function main() {
  try {
    const tsFiles = getAllTSFiles(parentFolderPath);

    const components = tsFiles.flatMap(filePath => {
      const tsFile = ts.createProgram([filePath], {});
      const source = tsFile.getSourceFile(filePath);
      if (!source) throw new Error(`Cannot find file ${filePath}`);

      return extractComponentNodeFromAngularDeclaration(source);
    });
    console.log(JSON.stringify(components));
  } catch (e) {
    console.error(e);
  }
}

main();
