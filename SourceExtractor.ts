import ts from "typescript";

export function getExportArgument(node: ts.ExportAssignment): ts.Node {
  let exportArg: ts.Node | null = null
  if (ts.isCallExpression(node.expression) && isVueExtend(node.expression.expression)) {
    exportArg = node.expression.arguments[0]
  } else {
    exportArg = node.expression
  }
  return exportArg
}

export function isVueExtend(node: ts.Node): boolean {
  if (ts.isPropertyAccessExpression(node)) {
    return ts.isIdentifier(node.expression)
      && node.expression.text === 'Vue'
      && node.name.text === 'extend'
  }
  return false
}

export function getVueOptions(node: ts.ExportAssignment) {
  return getExportArgument(node)
}