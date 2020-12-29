import Strategy from './Strategy.js';
import ts from 'typescript'
const factory = ts.factory

@Strategy
export default class DataStrategy {
  static transform (data: any): ts.PropertyDeclaration | null {
    if (ts.isAsExpression(data.initializer)) {
      const { type, ...initializer } = data.initializer
      return factory.createPropertyDeclaration([], [], data.name, undefined, type, initializer)
    } else {
      return factory.createPropertyDeclaration([], [], data.name, undefined, data.type, data.initializer)
    }
  }
}