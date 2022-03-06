import path from 'path';
import ts from 'typescript';
import {
  getHtmlChildrenOfFile,
  FlattenNode,
  getHtmlChildrenOfString,
} from './html';
import { findNodesOfKind, getFileContentFromSource } from './ast';

export enum TemplateType {
  FILE_REF = 0,
  TEMPLATE_STRING = 1,
}

type TemplateDefinition = {
  type: TemplateType;
  content: string;
};

type RouteInfo = {
  url: string;
  childElements: Array<FlattenNode>;
};

type ComponentInfo = {
  name: string;
  childElements: Array<FlattenNode>;
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
  const templateImport = findNodesOfKind(
    content,
    ts.SyntaxKind.ImportDeclaration,
    source
  ).find(declaration =>
    findNodesOfKind(declaration, ts.SyntaxKind.Identifier, source).find(
      identifier => identifier.getText(source) === importName
    )
  );
  return templateImport
    ?.getChildren(source)
    .find(child => ts.isStringLiteral(child))
    ?.getText(source)
    .replaceAll("'", '');
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
          findNodesOfKind(
            templateValue,
            ts.SyntaxKind.ReturnStatement,
            source
          ).forEach(returnNode => {
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
      const childElements = extractTemplateFromAngularDeclaration(
        node,
        source
      ).flatMap(template => {
        if (template.type === TemplateType.FILE_REF)
          return getHtmlChildrenOfFile(path.join(folderPath, template.content));
        return getHtmlChildrenOfString(template.content);
      });
      componentsNode.push({ name, childElements });
    }

    return componentsNode;
  }, [] as ComponentInfo[]);

  return components;
}

export function getTemplateFromValue(
  templateValue: ts.Node,
  source: ts.SourceFile
): TemplateDefinition | undefined {
  // Reference to html file
  if (ts.isIdentifier(templateValue)) {
    const content = findTemplatePathFromImport(
      templateValue.getText(source),
      source
    );
    return content ? { content, type: TemplateType.FILE_REF } : undefined;
  }

  // Inline Template
  return {
    content: templateValue.getText(source).slice(1, -1),
    type: TemplateType.TEMPLATE_STRING,
  };
}

export function getTemplateValueFromPropertyAssignment(
  templateAssignment: ts.PropertyAssignment,
  source: ts.SourceFile
): ts.Node | undefined {
  return templateAssignment
    .getChildren(source)
    .find(
      child =>
        ts.isStringLiteral(child) ||
        ts.isNoSubstitutionTemplateLiteral(child) ||
        ts.isTemplateExpression(child) ||
        (ts.isIdentifier(child) && child.getText(source) !== 'template')
    );
}

export function getUrlValueFromPropertyAssignment(
  urlAssignment: ts.PropertyAssignment,
  source: ts.SourceFile
): string | undefined {
  return urlAssignment
    .getChildren(source)
    .find(child => ts.isStringLiteral(child))
    ?.getText(source)
    .slice(1, -1);
}

export function getPropertyAssignmentByName(
  expression: ts.ObjectLiteralExpression,
  name: string,
  source: ts.SourceFile
): ts.PropertyAssignment | undefined {
  return findNodesOfKind(
    expression,
    ts.SyntaxKind.PropertyAssignment,
    source
  ).find(
    assignment =>
      ts.isIdentifier(assignment.name) && assignment.name.escapedText === name
  );
}

export function getChildrenFromTemplate(
  template: TemplateDefinition,
  filePath: string
): FlattenNode[] {
  const folderPath = path.dirname(filePath);

  return template.type === TemplateType.FILE_REF
    ? getHtmlChildrenOfFile(path.join(folderPath, template.content))
    : getHtmlChildrenOfString(template.content);
}

export function extractComponentsFromAngularRoute(
  source: ts.SourceFile,
  filePath: string
): RouteInfo[] {
  const content = getFileContentFromSource(source);

  return findNodesOfKind(
    content,
    ts.SyntaxKind.ObjectLiteralExpression,
    source
  ).reduce<RouteInfo[]>((routes, expression) => {
    const urlAssignment = getPropertyAssignmentByName(
      expression,
      'url',
      source
    );
    const templateAssignment = getPropertyAssignmentByName(
      expression,
      'template',
      source
    );
    if (!urlAssignment || !templateAssignment) return routes;

    const url = getUrlValueFromPropertyAssignment(urlAssignment, source);
    const templateValue = getTemplateValueFromPropertyAssignment(
      templateAssignment,
      source
    );

    if (!templateValue) return routes;
    const template = getTemplateFromValue(templateValue, source);

    if (!url || !template) return routes;

    const childElements = getChildrenFromTemplate(template, filePath);

    return routes.concat([{ url, childElements }]);
  }, []);
}
