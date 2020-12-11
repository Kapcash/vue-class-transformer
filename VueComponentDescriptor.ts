import ts from 'typescript'
const factory = ts.factory

export default class VueComponentDescriptor {
  private name: string = ''
  private data: ts.Node[] = []
  private components: ts.NodeArray<any> = factory.createNodeArray()
  private mixins: ts.NodeArray<any> = factory.createNodeArray()
  private directives: ts.NodeArray<any> = factory.createNodeArray()
  private watchers: ts.NodeArray<any> = factory.createNodeArray()
  private getters: ts.NodeArray<any> = factory.createNodeArray()
  private props: ts.NodeArray<any> = factory.createNodeArray()
  private methods: ts.NodeArray<any> = factory.createNodeArray()
  private otherToken: ts.NodeArray<ts.Node> = factory.createNodeArray()

  constructor() {}

  setName(newName?: string) {
    if (newName) this.name = newName
  }

  setGetters(getters?: ts.NodeArray<any>) {
    if (getters) this.getters = getters
  }

  setData(data?: ts.Node[]) {
    if (data) this.data = data
  }

  setWatchers(watchers?: ts.NodeArray<any>) {
    if (watchers) this.watchers = watchers
  }

  setProps(props?: ts.NodeArray<any>) {
    if (props) this.props = props
  }

  setMethods(methods?: ts.NodeArray<any>) {
    if (methods) this.methods = methods
  }

  addOtherTokenMethods(token?: ts.Node) {
    if (token) this.otherToken = factory.createNodeArray([...this.otherToken, token])
  }

  setComponents(components?: ts.NodeArray<any>) {
    if (components) this.components = components
  }

  setMixins(mixins?: ts.NodeArray<any>) {
    if (mixins) this.mixins = mixins
  }

  setDirectives(directives?: ts.NodeArray<any>) {
    if (directives) this.directives = directives
  }

  get capitalizedName() {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1)
  }

  get componentOptions() {
    const assignments: ts.PropertyAssignment[] = [];

    if (this.components.length > 0) {
      assignments.push(ts.createPropertyAssignment('components', ts.createObjectLiteral(this.components)));
    }
    if (this.mixins.length > 0) {
      assignments.push(ts.createPropertyAssignment('mixins', ts.createObjectLiteral(this.mixins)));
    }
    if (this.directives.length > 0) {
      assignments.push(ts.createPropertyAssignment('directives', ts.createObjectLiteral(this.directives)));
    }
    const objParameters = assignments.length > 0 ? factory.createObjectLiteralExpression(assignments) : null;
      
    return [objParameters].filter(Boolean);
  }

  get newComputed() {
    return this.getters.map(getter => {
      if (ts.isPropertyAssignment(getter) && ts.isObjectLiteralExpression(getter.initializer)) {
        return getter.initializer.properties.map(prop => {
          if (ts.isMethodDeclaration(prop)) {
            const name = ts.isIdentifier(prop.name) && prop.name.text
            switch (name) {
              case 'get':
                return factory.createGetAccessorDeclaration(undefined, undefined, getter.name, [], prop.type, prop.body);
              case 'set':
                return factory.createSetAccessorDeclaration(undefined, undefined, getter.name, prop.parameters, prop.body);
              default:
                return null
            }
          }
          return null
        })
      }
      return factory.createGetAccessorDeclaration(undefined, undefined, getter.name, [], getter.type, getter.body);
    }).flat()
  }

  get newWatchers() {
    return this.watchers.map(watcher => {
      const watchParameter = factory.createStringLiteral(watcher.name.text, true)
      const callDecorator = factory.createCallExpression(factory.createIdentifier('Watch'), undefined, [watchParameter])
      const watchDecorator = factory.createDecorator(callDecorator)

      const capitalizedWatcherName = watcher.name.text.charAt(0).toUpperCase() + watcher.name.text.slice(1)
      const watchMethodName = `on${capitalizedWatcherName}Update`
      return factory.createMethodDeclaration([watchDecorator], undefined, undefined, watchMethodName, undefined, undefined, watcher.parameters, undefined, watcher.body)
    })
  }

  get newData() {
    return this.data.map((data: any) => {
      if (ts.isAsExpression(data.initializer)) {
        const { type, ...initializer } = data.initializer
        return factory.createPropertyDeclaration([], [], data.name, undefined, type, initializer)
      } else {
        return factory.createPropertyDeclaration([], [], data.name, undefined, data.type, data.initializer)
      }
    })
  }

  get newMethods() {
    return this.methods
  }

  get newProps() {
    return this.props.map(prop => {
      let typeIdentifier = undefined
      let propParameter = prop.initializer
      if (ts.isAsExpression(prop.initializer)) {
        if (prop.initializer.type.typeName.text === 'PropOptions') {
          typeIdentifier = prop.initializer.type.typeArguments[0]
          delete prop.initializer.type
          propParameter = prop.initializer.expression
        }
      } else {
        const propertyType = prop.initializer.properties.find(attr => attr.name.text.toLowerCase() === 'type')
        switch (propertyType.initializer.text) {
          case 'Array':
            typeIdentifier = factory.createExpressionWithTypeArguments(factory.createIdentifier(propertyType.initializer.text), [factory.createToken(ts.SyntaxKind.AnyKeyword)])
            break;
          default:
            typeIdentifier = factory.createIdentifier(propertyType.initializer.text)
            break;
        }
      }
      const callDecorator = factory.createCallExpression(factory.createIdentifier('Prop'), undefined, [propParameter])
      const propDecorator = factory.createDecorator(callDecorator)
      const modifiers = factory.createModifiersFromModifierFlags(ts.ModifierFlags.Readonly)
      return factory.createPropertyDeclaration([propDecorator], modifiers, prop.name.text, factory.createToken(ts.SyntaxKind.ExclamationToken), typeIdentifier, undefined)
    })
  }

  getImportDecorators() {
    const imports = [
      factory.createImportSpecifier(undefined, factory.createIdentifier('Vue')),
      factory.createImportSpecifier(undefined, factory.createIdentifier('Component'))
    ]

    if (this.watchers.length > 0) {
      imports.push(factory.createImportSpecifier(undefined, factory.createIdentifier('Watch')))
    }
    if (this.props.length > 0) {
      imports.push(factory.createImportSpecifier(undefined, factory.createIdentifier('Prop')))
    }
    
    const importClauses = factory.createImportClause(false, undefined, factory.createNamedImports(imports))
    return factory.createImportDeclaration(undefined, undefined, importClauses, factory.createStringLiteral('nuxt-property-decorator', true))
  }

  toClass() {
    const vueSuperClass = factory.createIdentifier('Vue');
    const extendsExpr = ts.createExpressionWithTypeArguments(undefined, vueSuperClass);
    const heritageClause = factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [extendsExpr]);

    let callDecorator: ts.Identifier | ts.Expression = factory.createIdentifier('Component')
    if(this.componentOptions.length > 0) {
      const classType = factory.createTypeReferenceNode(this.capitalizedName, []);
      callDecorator = factory.createCallExpression(callDecorator, [classType], this.componentOptions)
    }
    const decorator = factory.createDecorator(callDecorator)

    const classMembers: any[] = [this.newData, this.newProps, this.newComputed, this.newWatchers, this.newMethods, this.otherToken].flat()
    const classNode = ts.createClassDeclaration([decorator], factory.createModifiersFromModifierFlags(ts.ModifierFlags.ExportDefault), this.capitalizedName, undefined, [heritageClause], classMembers)
    return classNode
  }
}