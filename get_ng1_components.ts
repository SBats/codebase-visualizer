import ts from "typescript"

const scriptArguments = process.argv.slice(2);
const filePath = scriptArguments[0];

function extractComponentNode(source: ts.SourceFile) {
    const content = source.getChildren(source).filter(node => node.kind === 338)[0]
    const components = content.getChildren(source)
        .filter(node => node.kind === ts.SyntaxKind.ExpressionStatement)
        .flatMap(node => node.getChildren(source))
        .filter(node => node.kind === ts.SyntaxKind.CallExpression)
        .reduce((components, node) => {
            const nodeChildren = node.getChildren(source)
            const argument = nodeChildren.find(child => child.kind === ts.SyntaxKind.SyntaxList)?.getChildren(source).find(child => child.kind === ts.SyntaxKind.StringLiteral) as ts.StringLiteral
            const identifier = nodeChildren.find(child => child.kind === ts.SyntaxKind.PropertyAccessExpression)?.getChildren(source).find(child => child.kind === ts.SyntaxKind.Identifier) as ts.Identifier
            if (identifier.escapedText === 'component') components.push(argument.getText(source));
            return components
        }, [] as string[])

    console.log(components);
}


function main() {
    try {
        const program = ts.createProgram([filePath], {});
        const source = program.getSourceFile(filePath);
        if (!source) throw new Error(`Cannot find file ${filePath}`);

        extractComponentNode(source);
    } catch (e) {
        console.error(e);
    }
  }

  main()
