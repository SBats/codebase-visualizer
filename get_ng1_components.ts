import ts from 'typescript';
import { findReturnNodes, getFileContentFromSource } from './utilities';

enum TemplateType {
  FILE_REF = 0,
  TEMPLATE_STRING = 1,
}

type TemplateDefinition = {
  type: TemplateType;
  content: string;
};

type ComponentInfo = {
  name: string;
  templates: Array<TemplateDefinition>;
};

const scriptArguments = process.argv.slice(2);
const filePath = scriptArguments[0];

function getComponentNameIfComponent(node: ts.Node, source: ts.SourceFile) {
  const nodeChildren = node.getChildren(source);

  const argument = nodeChildren
    .find(child => child.kind === ts.SyntaxKind.SyntaxList)
    ?.getChildren(source)
    .find(
      child => child.kind === ts.SyntaxKind.StringLiteral
    ) as ts.StringLiteral;

  const identifier = nodeChildren
    .find(child => child.kind === ts.SyntaxKind.PropertyAccessExpression)
    ?.getChildren(source)
    .find(child => child.kind === ts.SyntaxKind.Identifier) as ts.Identifier;

  return identifier.escapedText === 'component'
    ? argument.getText(source)
    : null;
}

function findTemplatePathFromImport(importName: string, source: ts.SourceFile) {
  const content = getFileContentFromSource(source);
  const imports = content
    .getChildren(source)
    .filter(child => child.kind === ts.SyntaxKind.ImportDeclaration)
    .flatMap(child => child.getChildren(source))
    .reduce();
  // group imports and file paths
}

function extractTemplateFromAngularDeclaration(
  node: ts.Node,
  source: ts.SourceFile
) {
  return node
    .getChildren(source)
    .filter(child => child.kind === ts.SyntaxKind.ObjectLiteralExpression)
    .flatMap(objectLiteralExpression =>
      objectLiteralExpression.getChildren(source)
    )
    .filter(child => child.kind === ts.SyntaxKind.PropertyAssignment)
    .reduce((templates: Array<TemplateDefinition>, propertyAssignment) => {
      const children = propertyAssignment.getChildren(source);
      if (
        children[0].kind === ts.SyntaxKind.Identifier &&
        (children[0] as ts.Identifier).escapedText === 'template'
      ) {
        const templateType = children[1].kind;
        switch (templateType) {
          case ts.SyntaxKind.Identifier:
            // Build template file path based on import name and file being processed
            templates.push({
              type: TemplateType.FILE_REF,
              content: findTemplatePathFromImport(
                (children[1] as ts.Identifier).escapedText,
                source
              ),
            });
            break;
          case ts.SyntaxKind.ArrayLiteralExpression:
            // Find returns and for each build a template
            findReturnNodes(children[1], source).forEach(returnNode => {
              const identifier = returnNode.getChildren()[0] as ts.Identifier;
              templates.push({
                type: TemplateType.FILE_REF,
                content: findTemplatePathFromImport(
                  identifier.escapedText,
                  source
                ),
              });
            });
            break;
          default:
            templates.push({
              type: TemplateType.TEMPLATE_STRING,
              content: children[1].getFullText(),
            });
            break;
        }
      }
      return templates;
    }, []);
}

function extractComponentNodeFromAngularDeclaration(source: ts.SourceFile) {
  const content = getFileContentFromSource(source);

  const componentsDeclarations = content
    .getChildren(source)
    .filter(node => node.kind === ts.SyntaxKind.ExpressionStatement)
    .flatMap(node => node.getChildren(source))
    .filter(node => node.kind === ts.SyntaxKind.CallExpression);

  const components = componentsDeclarations.reduce((componentsNode, node) => {
    const name = getComponentNameIfComponent(node, source);

    if (name) {
      const templates = extractTemplateFromAngularDeclaration(node, source);
      componentsNode.push({ name, templates });
    }

    return componentsNode;
  }, [] as ComponentInfo[]);

  console.log(components);
}

function main() {
  try {
    const program = ts.createProgram([filePath], {});
    const source = program.getSourceFile(filePath);
    if (!source) throw new Error(`Cannot find file ${filePath}`);

    extractComponentNodeFromAngularDeclaration(source);
  } catch (e) {
    console.error(e);
  }
}

main();
