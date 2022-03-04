import ts from 'typescript';
import P from 'pino';
import { extractComponentNodeFromAngularDeclaration } from './utilities/ng1';
import getAllFilesOfType from './utilities/system';

const scriptArguments = process.argv.slice(2);
const parentFolderPath = scriptArguments[0];
const logger = P();

function main() {
  try {
    const tsFiles = getAllFilesOfType(parentFolderPath, 'ts');

    const components = tsFiles.flatMap(filePath => {
      const tsFile = ts.createProgram([filePath], {});
      const source = tsFile.getSourceFile(filePath);
      if (!source) throw new Error(`Cannot find file ${filePath}`);

      return extractComponentNodeFromAngularDeclaration(source, filePath);
    });
    logger.info(components);
  } catch (e) {
    logger.error(e as string);
  }
}

main();
