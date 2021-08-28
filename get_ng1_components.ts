import ts from 'typescript';
import { extractComponentNodeFromAngularDeclaration } from './ng1-components/ng1-utilities';
import getAllFilesOfType from './utilities/system';

const scriptArguments = process.argv.slice(2);
const parentFolderPath = scriptArguments[0];

function main() {
  try {
    const tsFiles = getAllFilesOfType(parentFolderPath, 'ts');

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
