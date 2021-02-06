import Strategy from './Strategy';
import ts from 'typescript';

export default class OtherTokenStrategy extends Strategy<ts.Node> {
  name = 'custom token';
  
  _transformNode (token: ts.Node) {
    return token;
  }
}