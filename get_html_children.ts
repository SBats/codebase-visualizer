import { unified } from 'unified'
import { readSync } from 'to-vfile'
import rehypeParse from 'rehype-parse'
import { Parent, Root, Element } from 'hast';
import { ValuesType } from 'utility-types';

const scriptArguments = process.argv.slice(2);
const filePath = scriptArguments[0];

type flattenNode = { tagName: String; className: String };

function simplifyChild(node: Element): flattenNode {
  return { tagName: node.tagName, className: JSON.stringify(node.properties?.className) }
}

function getFlatenNodeChildren(node: ValuesType<Parent['children']>): Array<flattenNode> {
  if (node.type !== 'element') return [];
  return [simplifyChild(node)].concat(node.children?.flatMap(getFlatenNodeChildren) || [])
}

function getFlatenTreeChildren(tree: Root): Array<flattenNode> {
  return tree.children.flatMap(getFlatenNodeChildren);
}

function main() {
  try {
      const htmlFile = readSync(filePath)

      const ast = unified()
        .use(rehypeParse, { fragment: true })
        .parse(htmlFile)

      console.log(getFlatenTreeChildren(ast));
  } catch (e) {
      console.error(e);
  }
}

main()
