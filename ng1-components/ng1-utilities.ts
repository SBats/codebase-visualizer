import path from 'path';
import ts from 'typescript';
import { findReturnNodes, getFileContentFromSource } from '../utilities/ast';

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

export function getComponentNameIfComponent(
  node: ts.Node,
  source: ts.SourceFile
): string | null {
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

  return identifier.getText(source) === 'component'
    ? argument.getText(source).slice(1, -1)
    : null;
}

export function findTemplatePathFromImport(
  importName: string,
  source: ts.SourceFile
): string | undefined {
  const content = getFileContentFromSource(source);
  const imports = content
    .getChildren(source)
    .filter(child => child.kind === ts.SyntaxKind.ImportDeclaration)
    .map(importDeclaration => {
      const parts = importDeclaration.getChildren(source);
      const identifier = parts
        .find(part => part.kind === ts.SyntaxKind.ImportClause)
        ?.getText(source);
      const templatePath = parts
        .find(part => part.kind === ts.SyntaxKind.StringLiteral)
        ?.getText(source)
        .replaceAll("'", '');
      return { identifier, templatePath };
    });
  return imports.find(fileImport => fileImport.identifier === importName)
    ?.templatePath;
}

export function extractTemplateFromAngularDeclaration(
  node: ts.Node,
  source: ts.SourceFile
): TemplateDefinition[] {
  const objectProperties = node
    .getChildren(source)
    .filter(child => child.kind === ts.SyntaxKind.SyntaxList)
    .flatMap(child => child.getChildren(source))
    .filter(child => child.kind === ts.SyntaxKind.ObjectLiteralExpression)
    .flatMap(objectLiteralExpression =>
      objectLiteralExpression.getChildren(source)
    )
    .filter(child => child.kind === ts.SyntaxKind.SyntaxList)
    .flatMap(child => child.getChildren(source))
    .filter(child => child.kind === ts.SyntaxKind.PropertyAssignment);

  return objectProperties.reduce(
    (templates: Array<TemplateDefinition>, propertyAssignment) => {
      const children = propertyAssignment.getChildren(source);
      const propertyIdentifier = children[0];

      if (propertyIdentifier?.getText(source) !== 'template') return templates;
      const templateValue = children
        .slice(1)
        .find(child =>
          [
            ts.SyntaxKind.Identifier,
            ts.SyntaxKind.ArrayLiteralExpression,
            ts.SyntaxKind.NoSubstitutionTemplateLiteral,
            ts.SyntaxKind.TemplateExpression,
          ].includes(child.kind)
        );

      if (!templateValue) return templates;
      const templateType = templateValue?.kind;
      switch (templateType) {
        case ts.SyntaxKind.Identifier:
          // Build template file path based on import name and file being processed
          templates.push({
            type: TemplateType.FILE_REF,
            content:
              findTemplatePathFromImport(
                (templateValue as ts.Identifier).getText(source),
                source
              ) || '',
          });
          break;
        case ts.SyntaxKind.ArrayLiteralExpression:
          // Find returns and for each build a template
          findReturnNodes(templateValue, source).forEach(returnNode => {
            const returnIdentifier = returnNode
              .getChildren(source)
              .find(child => child.kind === ts.SyntaxKind.Identifier);
            if (returnIdentifier) {
              templates.push({
                type: TemplateType.FILE_REF,
                content:
                  findTemplatePathFromImport(
                    returnIdentifier.getText(source),
                    source
                  ) || '',
              });
            }
          });
          break;
        case ts.SyntaxKind.NoSubstitutionTemplateLiteral:
        case ts.SyntaxKind.TemplateExpression:
          templates.push({
            type: TemplateType.TEMPLATE_STRING,
            content: templateValue.getText(source).slice(1, -1),
          });
          break;
        default:
          console.error('Unknown kind');
      }
      return templates;
    },
    []
  );
}

export function extractComponentNodeFromAngularDeclaration(
  source: ts.SourceFile,
  filePath: string
): ComponentInfo[] {
  const content = getFileContentFromSource(source);
  const folderPath = path.dirname(filePath);

  const componentsDeclarations = content
    .getChildren(source)
    .filter(node => node.kind === ts.SyntaxKind.ExpressionStatement)
    .flatMap(node => node.getChildren(source))
    .filter(node => node.kind === ts.SyntaxKind.CallExpression);

  const components = componentsDeclarations.reduce((componentsNode, node) => {
    const name = getComponentNameIfComponent(node, source);

    if (name) {
      const templates = extractTemplateFromAngularDeclaration(node, source).map(
        template => {
          if (template.type === TemplateType.FILE_REF)
            return {
              type: template.type,
              content: path.join(folderPath, template.content),
            };
          return template;
        }
      );
      componentsNode.push({ name, templates });
    }

    return componentsNode;
  }, [] as ComponentInfo[]);

  return components;
}
