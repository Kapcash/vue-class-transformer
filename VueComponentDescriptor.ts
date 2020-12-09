import ts from 'typescript'
const factory = ts.factory

export default class VueComponentDescriptor {
  private name: string = ''
  components: any = {}
  data: ts.PropertyAssignment[] = []
  watchers: any[] = []
  getters: any[] = []
  props: any[] = []

  constructor() {}

  setName(newName?: string) {
    if (newName) {
      this.name = newName
    }
  }

  get capitalizedName() {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1)
  }

  get componentOptions() {
    const assignments: ts.PropertyAssignment[] = [];

    assignments.push(ts.createPropertyAssignment('components', ts.createObjectLiteral(this.components.initializer.properties)));
    const obj = ts.createObjectLiteral(assignments);
    return obj;
  }

  get createGetters() {
    return this.getters.map(getter => {
      return factory.createGetAccessorDeclaration(undefined, undefined, getter.name, [], getter.type, getter.body);
    })
  }

  get createWatchers() {
    return this.watchers.map(watcher => {
      const watchParameter = factory.createStringLiteral(watcher.name.text, true)
      const callDecorator = factory.createCallExpression(factory.createIdentifier('Watch'), undefined, [watchParameter])
      const watchDecorator = factory.createDecorator(callDecorator)

      const capitalizedWatcherName = watcher.name.text.charAt(0).toUpperCase() + watcher.name.text.slice(1)
      const watchMethodName = `on${capitalizedWatcherName}Update`
      return factory.createMethodDeclaration([watchDecorator], undefined, undefined, watchMethodName, undefined, undefined, watcher.parameters, undefined, watcher.body)
    })
  }

  get createData() {
    return this.data.map(data => {
      if (ts.isAsExpression(data.initializer)) {
        const { type, ...initializer } = data.initializer
        return factory.createPropertyDeclaration([], [], data.name, undefined, type, initializer)
      } else {
        return factory.createPropertyDeclaration([], [], data.name, undefined, undefined, data.initializer)
      }
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

    const componentDecorator = factory.createIdentifier('Component')
    const classType = factory.createTypeReferenceNode(this.capitalizedName, []);
    const callDecorator = factory.createCallExpression(componentDecorator, [classType], [this.componentOptions])
    const decorator = factory.createDecorator(callDecorator)

    const classMembers: any[] = [this.createData, this.createGetters, this.createWatchers].flat()
    const classNode = ts.createClassDeclaration([decorator], undefined, this.capitalizedName, undefined, [heritageClause], classMembers)
    return classNode
  }
}