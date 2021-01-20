import Strategy from './Strategy';
import ts from 'typescript'
const factory = ts.factory

export default class ComputedStrategy implements Strategy {
  transform(computed: ts.Node): ts.AccessorDeclaration[] | null {
    if (ts.isPropertyAssignment(computed) && ts.isObjectLiteralExpression(computed.initializer)) {
      return computed.initializer.properties.map(prop => {
        if (ts.isMethodDeclaration(prop)) {
          const name = ts.isIdentifier(prop.name) && prop.name.text
          switch (name) {
            case 'get':
              return factory.createGetAccessorDeclaration(undefined, undefined, computed.name, [], prop.type, prop.body);
            case 'set':
              return factory.createSetAccessorDeclaration(undefined, undefined, computed.name, prop.parameters, prop.body);
            default:
              return null
          }
        }
        return null
      })
    }
    // return factory.createGetAccessorDeclaration(undefined, undefined, computed.name, [], computed.type, computed.body)
    return null
  }
}