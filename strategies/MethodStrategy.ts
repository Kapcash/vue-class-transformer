import Strategy from './Strategy.js';
import ts from 'typescript'
const factory = ts.factory

@Strategy
export default class MethodStrategy {
  static transform (method: ts.MethodDeclaration): ts.MethodDeclaration| null {
    return method
  }
}