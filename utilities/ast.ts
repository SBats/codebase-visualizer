import ts from 'typescript';

export function getFileContentFromSource(source: ts.SourceFile): ts.Node {
  return source
    .getChildren(source)
    .filter(node => node.kind === ts.SyntaxKind.SyntaxList)[0];
}

// type KindToNodeMapping = {
//   [ts.SyntaxKind.ReturnStatement]: ts.ReturnStatement
//   [ts.SyntaxKind.CallExpression]: ts.CallExpression
//   [ts.SyntaxKind.PropertyAssignment]: ts.PropertyAssignment
//   [ts.SyntaxKind.ObjectLiteralExpression]: ts.ObjectLiteralExpression
//   [ts.SyntaxKind.Identifier]: ts.Identifier
//   [ts.SyntaxKind.ImportDeclaration]: ts.ImportDeclaration
//   [ts.SyntaxKind.Block]: ts.Block
// }

export function findChildOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.Identifier,
  sourceFile?: ts.SourceFile
): ts.Identifier | undefined;
export function findChildOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.StringLiteral,
  sourceFile?: ts.SourceFile
): ts.StringLiteral | undefined;
export function findChildOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.ObjectLiteralExpression,
  sourceFile?: ts.SourceFile
): ts.ObjectLiteralExpression | undefined;
export function findChildOfKind(
  node: ts.Node,
  kind: number,
  sourceFile?: ts.SourceFile
): unknown | undefined {
  return node.getChildren(sourceFile).find(child => child.kind === kind);
}

export function findNodesOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.VariableDeclaration,
  sourceFile?: ts.SourceFile
): Array<ts.VariableDeclaration>;
export function findNodesOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.PropertyAccessExpression,
  sourceFile?: ts.SourceFile
): Array<ts.PropertyAccessExpression>;
export function findNodesOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.Block,
  sourceFile?: ts.SourceFile
): Array<ts.Block>;
export function findNodesOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.CallExpression,
  sourceFile?: ts.SourceFile
): Array<ts.CallExpression>;
export function findNodesOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.PropertyAssignment,
  sourceFile?: ts.SourceFile
): Array<ts.PropertyAssignment>;
export function findNodesOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.ObjectLiteralExpression,
  sourceFile?: ts.SourceFile
): Array<ts.ObjectLiteralExpression>;
export function findNodesOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.Identifier,
  sourceFile?: ts.SourceFile
): Array<ts.Identifier>;
export function findNodesOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.ImportDeclaration,
  sourceFile?: ts.SourceFile
): Array<ts.ImportDeclaration>;
export function findNodesOfKind(
  node: ts.Node,
  kind: ts.SyntaxKind.ReturnStatement,
  sourceFile?: ts.SourceFile
): Array<ts.ReturnStatement>;
export function findNodesOfKind(
  node: ts.Node,
  kind: number,
  sourceFile?: ts.SourceFile
): Array<unknown> {
  const children = node.getChildren(sourceFile);
  return children.flatMap(child => {
    let result = [];
    if (child.kind === kind) result.push(child);
    if (child.getChildCount(sourceFile) > 0)
      result = result.concat(findNodesOfKind(child, kind, sourceFile));
    return result;
  });
}
