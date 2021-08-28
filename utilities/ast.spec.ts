import ts from 'typescript';
import {
  findNodesOfKind,
  findReturnNodes,
  getFileContentFromSource,
} from './ast';
import multiReturnFixture from '../fixtures/multi-return';

test('Find 1 Block statement', () => {
  const sourceFile = ts.createSourceFile(
    'MultiReturnTestFile',
    multiReturnFixture,
    ts.ScriptTarget.ESNext
  );
  const node = getFileContentFromSource(sourceFile);
  expect(findNodesOfKind(node, ts.SyntaxKind.Block, sourceFile).length).toBe(1);
});

test('Find 2 Return statements', () => {
  const sourceFile = ts.createSourceFile(
    'MultiReturnTestFile',
    multiReturnFixture,
    ts.ScriptTarget.ESNext
  );
  const node = getFileContentFromSource(sourceFile);
  expect(findReturnNodes(node, sourceFile).length).toBe(2);
});
