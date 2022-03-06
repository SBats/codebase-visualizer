import ts from 'typescript';
import {
  extractTemplateFromAngularDeclaration,
  findTemplatePathFromImport,
  getTemplateFromValue,
  getTemplateValueFromPropertyAssignment,
  TemplateType,
} from './ng1';
import importsFixture from '../fixtures/imports';
import templateFromAssignmentFixture from '../fixtures/template-from-assignment';
import templateStringFixture from '../fixtures/template-string';
import templateFunctionFixture from '../fixtures/template-function';
import templateIdentifierFixture from '../fixtures/template-identifier';
import templateValueFixture from '../fixtures/template-value';
import { findNodesOfKind, getFileContentFromSource } from './ast';

describe('findTemplatePathFromImport', () => {
  test('Find a relative path', () => {
    const sourceFile = ts.createSourceFile(
      'ImportsFixtureFile',
      importsFixture,
      ts.ScriptTarget.ESNext
    );
    expect(findTemplatePathFromImport('templateA', sourceFile)).toBe(
      './relative/template-a.html'
    );
  });

  test('Find an absolute path', () => {
    const sourceFile = ts.createSourceFile(
      'ImportsFixtureFile',
      importsFixture,
      ts.ScriptTarget.ESNext
    );
    expect(findTemplatePathFromImport('templateB', sourceFile)).toBe(
      'absolute/templateb.html'
    );
  });
});

describe('extractTemplateFromAngularDeclaration', () => {
  test('extract a template string', () => {
    const sourceFile = ts.createSourceFile(
      'TemplateStringFixtureFile',
      templateStringFixture,
      ts.ScriptTarget.ESNext
    );
    const callExpression = getFileContentFromSource(sourceFile)
      .getChildren(sourceFile)
      .filter(node => node.kind === ts.SyntaxKind.ExpressionStatement)
      .flatMap(node => node.getChildren(sourceFile))
      .filter(node => node.kind === ts.SyntaxKind.CallExpression)[0];
    expect(
      extractTemplateFromAngularDeclaration(callExpression, sourceFile)
    ).toEqual([
      {
        type: 1,
        content: `
      <div />
    `,
      },
    ]);
  });

  test('extract multiple templates from a function', () => {
    const sourceFile = ts.createSourceFile(
      'TemplateFunctionFixtureFile',
      templateFunctionFixture,
      ts.ScriptTarget.ESNext
    );
    const callExpression = getFileContentFromSource(sourceFile)
      .getChildren(sourceFile)
      .filter(node => node.kind === ts.SyntaxKind.ExpressionStatement)
      .flatMap(node => node.getChildren(sourceFile))
      .filter(node => node.kind === ts.SyntaxKind.CallExpression)[0];
    expect(
      extractTemplateFromAngularDeclaration(callExpression, sourceFile)
    ).toEqual([
      {
        type: 0,
        content: './templateA.html',
      },
      {
        type: 0,
        content: './templateB.html',
      },
    ]);
  });

  test('extract a single templates from an identifier', () => {
    const sourceFile = ts.createSourceFile(
      'TemplateIdentifierFixtureFile',
      templateIdentifierFixture,
      ts.ScriptTarget.ESNext
    );
    const callExpression = getFileContentFromSource(sourceFile)
      .getChildren(sourceFile)
      .filter(node => node.kind === ts.SyntaxKind.ExpressionStatement)
      .flatMap(node => node.getChildren(sourceFile))
      .filter(node => node.kind === ts.SyntaxKind.CallExpression)[0];
    expect(
      extractTemplateFromAngularDeclaration(callExpression, sourceFile)
    ).toEqual([
      {
        type: 0,
        content: './templateA.html',
      },
    ]);
  });
});

describe('getTemplateFromValue', () => {
  let sourceFile: ts.SourceFile;
  let assignations: ts.PropertyAssignment[];

  beforeAll(() => {
    sourceFile = ts.createSourceFile(
      'TemplateFromAssignmentFixtureFile',
      templateFromAssignmentFixture,
      ts.ScriptTarget.ESNext
    );
    assignations = findNodesOfKind(
      sourceFile,
      ts.SyntaxKind.PropertyAssignment,
      sourceFile
    );
  });

  test('returns a reference to html file', () => {
    expect(
      getTemplateFromValue(assignations[0].getChildAt(2), sourceFile)
    ).toEqual({ content: './template.html', type: TemplateType.FILE_REF });
  });

  test('returns the template string', () => {
    expect(
      getTemplateFromValue(assignations[1].getChildAt(2), sourceFile)
    ).toEqual({
      content: '<div>INLINE_STRING_TEMPLATE</div>',
      type: TemplateType.TEMPLATE_STRING,
    });
  });
});

describe('getTemplateValueFromPropertyAssignment', () => {
  let sourceFile: ts.SourceFile;
  let assignations: ts.PropertyAssignment[];

  beforeAll(() => {
    sourceFile = ts.createSourceFile(
      'TemplateFromAssignmentFixtureFile',
      templateFromAssignmentFixture,
      ts.ScriptTarget.ESNext
    );
    assignations = findNodesOfKind(
      sourceFile,
      ts.SyntaxKind.PropertyAssignment,
      sourceFile
    );
  });

  test("returns if it's an identifier", () => {
    const expectedNode = assignations[0].getChildAt(2);
    expect(
      getTemplateValueFromPropertyAssignment(assignations[0], sourceFile)
    ).toEqual(expectedNode);
    expect(expectedNode.kind).toEqual(ts.SyntaxKind.Identifier);
  });
  test("returns if it's a string literal", () => {
    const expectedNode = assignations[1].getChildAt(2);
    expect(
      getTemplateValueFromPropertyAssignment(assignations[1], sourceFile)
    ).toEqual(expectedNode);
    expect(expectedNode.kind).toEqual(ts.SyntaxKind.StringLiteral);
  });

  test("returns if it's a template string", () => {
    const expectedNode = assignations[2].getChildAt(2);
    expect(
      getTemplateValueFromPropertyAssignment(assignations[2], sourceFile)
    ).toEqual(expectedNode);
    expect(expectedNode.kind).toEqual(
      ts.SyntaxKind.NoSubstitutionTemplateLiteral
    );
  });
  test("returns if it's a template string with substitution", () => {
    const expectedNode = assignations[3].getChildAt(2);
    expect(
      getTemplateValueFromPropertyAssignment(assignations[3], sourceFile)
    ).toEqual(expectedNode);
    expect(expectedNode.kind).toEqual(ts.SyntaxKind.TemplateExpression);
  });
});
