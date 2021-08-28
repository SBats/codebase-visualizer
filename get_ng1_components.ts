import ts from 'typescript';
import { extractComponentNodeFromAngularDeclaration } from './ng1-components/ng1-utilities';

const scriptArguments = process.argv.slice(2);
const filePath = scriptArguments[0];

function main() {
  try {
    const program = ts.createProgram([filePath], {});
    const source = program.getSourceFile(filePath);
    if (!source) throw new Error(`Cannot find file ${filePath}`);

    const componentsInfo = extractComponentNodeFromAngularDeclaration(source);
    console.log(JSON.stringify(componentsInfo));
  } catch (e) {
    console.error(e);
  }
}

main();
