import { unified } from 'unified';
import rehypeParse from 'rehype-parse';
import { Parent, Root, Element } from 'hast';
import { ValuesType } from 'utility-types';
import { readFileSync } from 'fs';

export type FlattenNode = { tagName: string; className: string };

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

export function getHtmlChildrenOfFile(filePath: string): FlattenNode[] {
  const htmlFile = readFileSync(filePath);

  const ast = unified().use(rehypeParse, { fragment: true }).parse(htmlFile);

  return getFlatenTreeChildren(ast);
}

export function getHtmlChildrenOfString(templateString: string): FlattenNode[] {
  const ast = unified()
    .use(rehypeParse, { fragment: true })
    .parse(templateString);

  return getFlatenTreeChildren(ast);
}
