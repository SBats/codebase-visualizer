import ts from 'typescript';

export function getFileContentFromSource(source: ts.SourceFile): ts.Node {
  return source
    .getChildren(source)
    .filter(node => node.kind === ts.SyntaxKind.SyntaxList)[0];
}

export function findNodesOfKind<T extends ts.SyntaxKind>(
  node: ts.Node,
  kind: T,
  sourceFile?: ts.SourceFile
): Array<ts.Node> {
  const children = node.getChildren(sourceFile);
  return children.flatMap(child => {
    let result = [];
    if (child.kind === kind) result.push(child);
    if (child.getChildCount(sourceFile) > 0)
      result = result.concat(findNodesOfKind(child, kind, sourceFile));
    return result;
  });
}

export function findReturnNodes(
  node: ts.Node,
  sourceFile?: ts.SourceFile
): Array<ts.ReturnStatement> {
  return findNodesOfKind(
    node,
    ts.SyntaxKind.ReturnStatement,
    sourceFile
  ) as Array<ts.ReturnStatement>;
}
