import ts from 'typescript';
import { findNodesOfKind, getFileContentFromSource } from './ast';
import multiReturnFixture from '../fixtures/multi-return';

test('Find 4 Block statements', () => {
  const sourceFile = ts.createSourceFile(
    'MultiReturnTestFile',
    multiReturnFixture,
    ts.ScriptTarget.ESNext
  );
  const node = getFileContentFromSource(sourceFile);
  expect(findNodesOfKind(node, ts.SyntaxKind.Block, sourceFile).length).toBe(4);
});

test('Find 2 Return statements', () => {
  const sourceFile = ts.createSourceFile(
    'MultiReturnTestFile',
    multiReturnFixture,
    ts.ScriptTarget.ESNext
  );
  const node = getFileContentFromSource(sourceFile);
  expect(
    findNodesOfKind(node, ts.SyntaxKind.ReturnStatement, sourceFile).length
  ).toBe(2);
});
