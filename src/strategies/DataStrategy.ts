import Strategy from './Strategy';
import ts from 'typescript';
const factory = ts.factory;

export default class DataStrategy extends Strategy<ts.PropertyDeclaration> {
  name = 'data';

  _transformNode (data: any) {
    if (ts.isAsExpression(data.initializer)) {
      const { type, ...initializer } = data.initializer;
      return factory.createPropertyDeclaration([], [], data.name, undefined, type, initializer);
    } else {
      return factory.createPropertyDeclaration([], [], data.name, undefined, data.type, data.initializer);
    }
  }
}