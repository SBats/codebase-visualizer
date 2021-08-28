import { getHtmlChildrenOfFile } from './utilities/html';
import getAllFilesOfType from './utilities/system';

const scriptArguments = process.argv.slice(2);
const parentFolderPath = scriptArguments[0];

function main() {
  try {
    const htmlFiles = getAllFilesOfType(parentFolderPath, 'html');
    const children = htmlFiles.map(getHtmlChildrenOfFile);

    console.log(htmlFiles);
    console.log(children);
  } catch (e) {
    console.error(e);
  }
}

main();
