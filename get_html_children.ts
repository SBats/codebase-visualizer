import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { Parent, Root, Element } from 'hast';
import { ValuesType } from 'utility-types';
import { readdirSync, readFileSync } from 'fs';
import path from 'path';

const scriptArguments = process.argv.slice(2);
const parentFolderPath = scriptArguments[0];

type flattenNode = { tagName: string; className: string };

function isHTMLFile(fileName: string): boolean {
  return fileName.split('.').reverse()[0] === 'html';
}

function getAllHTMLFiles(folderPath: string): string[] {
  const entries = readdirSync(folderPath, { withFileTypes: true });
  return entries.flatMap(entry => {
    const filePath = path.resolve(folderPath, entry.name);
    if (entry.isDirectory()) return getAllHTMLFiles(filePath);
    if (isHTMLFile(entry.name)) return filePath;
    return [];
  });
}

function simplifyChild(node: Element): flattenNode {
  return {
    tagName: node.tagName,
    className: JSON.stringify(node.properties?.className),
  };
}

function getFlatenNodeChildren(
  node: ValuesType<Parent['children']>
): Array<flattenNode> {
  if (node.type !== 'element') return [];
  return [simplifyChild(node)].concat(
    node.children?.flatMap(getFlatenNodeChildren) || []
  );
}

function getFlatenTreeChildren(tree: Root): Array<flattenNode> {
  return tree.children.flatMap(getFlatenNodeChildren);
}

function main() {
  try {
    const htmlFiles = getAllHTMLFiles(parentFolderPath);

    const children = htmlFiles.map(filePath => {
      const htmlFile = readFileSync(filePath);

      const ast = unified()
        .use(rehypeParse, { fragment: true })
        .parse(htmlFile);

      return getFlatenTreeChildren(ast);
    });

    console.log(htmlFiles);
    console.log(children);
  } catch (e) {
    console.error(e);
  }
}

main();
