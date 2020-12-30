import Strategy from './Strategy.js';
import ts from 'typescript'
const factory = ts.factory

export default class MethodStrategy implements Strategy {
  transform (method: ts.MethodDeclaration): ts.MethodDeclaration| null {
    return method
  }
}