import Strategy from './Strategy.js';
import ts from 'typescript'
const factory = ts.factory

@Strategy
export default class ImportStrategy {
  static transform (importStatement: ts.ImportDeclaration): ts.ImportDeclaration | null {
    return importStatement
  }
}