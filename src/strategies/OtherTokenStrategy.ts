import Strategy from './Strategy';
import ts from 'typescript';

export default class OtherTokenStrategy implements Strategy {
  transform (token: ts.Node): ts.Node | null {
    return token;
  }
}