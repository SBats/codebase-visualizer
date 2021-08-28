import ts from 'typescript';
import {
  extractTemplateFromAngularDeclaration,
  findTemplatePathFromImport,
} from './ng1-utilities';
import importsFixture from '../fixtures/imports';
import templateStringFixture from '../fixtures/template-string';
import templateFunctionFixture from '../fixtures/template-function';
import templateIdentifierFixture from '../fixtures/template-identifier';
import { getFileContentFromSource } from '../utilities/ast';

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
