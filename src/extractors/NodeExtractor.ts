import ts from 'typescript'
import VueComponentDescriptor from '../VueComponentDescriptor.js';
import { getVueOptions } from './SourceExtractor.js'

export const sourceExtractor = (vueDescriptor: VueComponentDescriptor) => (node: ts.Node) => {
  // Handle imports
  if (ts.isImportDeclaration(node)) {
    vueDescriptor.addImport(node)
  } else {
    // Handle Vue.extend
    if (ts.isExportAssignment(node)) {
      const sfcOptions = getVueOptions(node)
      ts.forEachChild(sfcOptions, nodeExtractor(vueDescriptor))
    }
  }
}

export const nodeExtractor = (vueDescriptor: VueComponentDescriptor) => (node: ts.ObjectLiteralElementLike) => {
  if (ts.isIdentifier(node.name)) {
    switch (node.name.text) {
      case 'name':
        vueDescriptor.setName(extractName(node))
        break;
      case 'computed':
        vueDescriptor.setGetters(extractComputed(node))
        break;
      case 'methods':
        vueDescriptor.setMethods(extractMethods(node))
        break;
      case 'data':
        vueDescriptor.setData(extractData(node))
        break;
      case 'props':
        vueDescriptor.setProps([...extractProperties(node)])
        break;
      case 'watch':
        vueDescriptor.setWatchers([...extractProperties(node)])
        break;
      case 'components':
        vueDescriptor.setComponents([...extractProperties(node)])
        break;
      case 'mixins':
        vueDescriptor.setMixins([...extractProperties(node)])
        break;
      case 'directives':
        vueDescriptor.setDirectives([...extractProperties(node)])
        break;
      default:
        vueDescriptor.addOtherToken(node)
        break;
    }
  }
}

function extractProperties (node: ts.ObjectLiteralElement): ts.NodeArray<any> | null {
  if (ts.isPropertyAssignment(node) && ts.isObjectLiteralExpression(node.initializer)) {
    return node.initializer.properties
  }
  console.error(`Unable to extract properties from node`, node)
}

function extractName (node: ts.ObjectLiteralElement): string {
  if (ts.isPropertyAssignment(node) && (ts.isIdentifier(node.initializer) || ts.isStringLiteral(node.initializer))) {
    return node.initializer.text
  }
  console.error('Unable to extract properties from "name"!')
}

function extractMethods(node: ts.ObjectLiteralElement) {
  if (ts.isPropertyAssignment(node) && ts.isObjectLiteralExpression(node.initializer)) {
    return node.initializer.properties.filter(ts.isMethodDeclaration)
  }
  console.error('Unable to extract properties from "methods"!')
}

function extractComputed(node: ts.ObjectLiteralElement): ts.ObjectLiteralElementLike[] {
  if (ts.isPropertyAssignment(node) && ts.isObjectLiteralExpression(node.initializer)) {
    return node.initializer.properties.filter(ts.isPropertyAssignment)
  }
  console.error('Unable to extract properties from "methods"!')
}

function extractData (node: ts.ObjectLiteralElement) {
  if (ts.isMethodDeclaration(node)) {
    const assigments: ts.Node[] = node.body.statements.filter(ts.isVariableStatement).map(assign => assign.declarationList.declarations).flat()
    const returnStmt = node.body.statements.find(ts.isReturnStatement)
    if (ts.isObjectLiteralExpression(returnStmt.expression)) {
      assigments.push(...returnStmt.expression.properties.filter(statement => !ts.isShorthandPropertyAssignment(statement)))
    }
    return ts.createNodeArray(assigments.filter(ts.isVariableDeclaration))
  }
  console.error('Unable to extract properties from "data"!')
}