import P from 'pino';
import { getHtmlChildrenOfFile } from './utilities/html';
import getAllFilesOfType from './utilities/system';

const scriptArguments = process.argv.slice(2);
const parentFolderPath = scriptArguments[0];
const logger = P();

function main() {
  try {
    const htmlFiles = getAllFilesOfType(parentFolderPath, 'html');
    const children = htmlFiles.map(getHtmlChildrenOfFile);

    logger.info(htmlFiles);
    logger.info(children);
  } catch (e) {
    logger.error(e);
  }
}

main();
