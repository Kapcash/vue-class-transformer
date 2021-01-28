import Strategy from './Strategy';
import ts from 'typescript';

export default class MethodStrategy implements Strategy {
  transform (method: ts.MethodDeclaration): ts.MethodDeclaration| null {
    return method;
  }
}