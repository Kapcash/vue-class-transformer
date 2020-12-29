import Strategy from './Strategy.js';
import ts from 'typescript'
const factory = ts.factory

@Strategy
export default class OtherTokenStrategy {
  static transform (token: ts.Node): ts.Node | null {
    return token
  }
}