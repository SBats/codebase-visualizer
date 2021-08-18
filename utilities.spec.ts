import ts from 'typescript';
import {
  findNodesOfKind,
  findReturnNodes,
  getFileContentFromSource,
} from './utilities';
import multiReturnAST from './fixtures/multi-return.ast';

test('Find 1 Block statement', () => {
  const sourceFile = ts.createSourceFile(
    'MultiReturnTestFile',
    multiReturnAST,
    ts.ScriptTarget.ESNext
  );
  const node = getFileContentFromSource(sourceFile);
  expect(findNodesOfKind(node, ts.SyntaxKind.Block, sourceFile).length).toBe(1);
});

test('Find 2 Return statements', () => {
  const sourceFile = ts.createSourceFile(
    'MultiReturnTestFile',
    multiReturnAST,
    ts.ScriptTarget.ESNext
  );
  const node = getFileContentFromSource(sourceFile);
  expect(findReturnNodes(node, sourceFile).length).toBe(2);
});
