import Strategy from './Strategy.js';
import ts from 'typescript'
const factory = ts.factory

export default class OtherTokenStrategy implements Strategy {
  transform (token: ts.Node): ts.Node | null {
    return token
  }
}