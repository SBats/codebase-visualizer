import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { Parent, Root, Element } from 'hast';
import { ValuesType } from 'utility-types';
import { readFileSync } from 'fs';
import getAllFilesOfType from './utilities/system';

const scriptArguments = process.argv.slice(2);
const parentFolderPath = scriptArguments[0];

type FlattenNode = { tagName: string; className: string };

function simplifyChild(node: Element): FlattenNode {
  return {
    tagName: node.tagName,
    className: JSON.stringify(node.properties?.className),
  };
}

function getFlatenNodeChildren(
  node: ValuesType<Parent['children']>
): Array<FlattenNode> {
  if (node.type !== 'element') return [];
  return [simplifyChild(node)].concat(
    node.children?.flatMap(getFlatenNodeChildren) || []
  );
}

function getFlatenTreeChildren(tree: Root): Array<FlattenNode> {
  return tree.children.flatMap(getFlatenNodeChildren);
}

function main() {
  try {
    const htmlFiles = getAllFilesOfType(parentFolderPath, 'html');

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
