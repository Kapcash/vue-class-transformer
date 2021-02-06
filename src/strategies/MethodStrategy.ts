import Strategy from './Strategy';
import ts from 'typescript';

export default class MethodStrategy extends Strategy<ts.MethodDeclaration> {
  name = 'methods';
  
  _transformNode (method: ts.MethodDeclaration) {
    return method;
  }
}