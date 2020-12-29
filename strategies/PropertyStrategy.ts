import Strategy from './Strategy.js';
import ts from 'typescript'
const factory = ts.factory

export default class PropertyStrategy implements Strategy {
  transform (prop: ts.PropertyAssignment): ts.PropertyDeclaration | null {
    const propName = ts.isIdentifier(prop.name) ? prop.name.text : ''

    let typeIdentifier: ts.TypeNode = undefined
    let propParameter = prop.initializer
    if (ts.isAsExpression(prop.initializer)) { // Is typed with "as SomeType"
      // Is typed with the special vue type `as PropOptions<>`
      if (ts.isTypeReferenceNode(prop.initializer.type) && ts.isIdentifier(prop.initializer.type.typeName) && prop.initializer.type.typeName.text === 'PropOptions') {
        // Extract the generic type in `as PropOptions<SomeType>` -> SomeType
        typeIdentifier = prop.initializer.type.typeArguments[0]
        // delete prop.initializer.type
        propParameter = prop.initializer.expression
      }
    } else {
      if (ts.isObjectLiteralExpression(prop.initializer)) {
        const propertyType = prop.initializer.properties
          .filter(ts.isPropertyAssignment)
          .filter(attr => ts.isIdentifier(attr.name))
          .find(attr => (attr.name as ts.Identifier).text.toLowerCase() === 'type')
        if (ts.isIdentifier(propertyType.initializer)) {
          switch (propertyType.initializer.text) {
            case 'Array':
              typeIdentifier = factory.createExpressionWithTypeArguments(propertyType.initializer, [factory.createToken(ts.SyntaxKind.AnyKeyword)])
              break;
            default:
              typeIdentifier = factory.createTypeReferenceNode(propertyType.initializer.text)
              break;
          }
        }
      }
    }
    const callDecorator = factory.createCallExpression(factory.createIdentifier('Prop'), undefined, [propParameter])
    const propDecorator = factory.createDecorator(callDecorator)
    const modifiers = factory.createModifiersFromModifierFlags(ts.ModifierFlags.Readonly)
    return factory.createPropertyDeclaration([propDecorator], modifiers, propName, factory.createToken(ts.SyntaxKind.ExclamationToken), typeIdentifier, undefined)
  }
}