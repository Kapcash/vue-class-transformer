import Strategy from './Strategy';
import ts from 'typescript'
const factory = ts.factory

export default class ImportStrategy implements Strategy {
  private isVueIdentifier(nameNode: ts.Node): boolean {
    return nameNode && ts.isIdentifier(nameNode) && nameNode.text === 'Vue'
  }

  transform (importStatement: ts.ImportDeclaration): ts.ImportDeclaration | null {
    let updatedStatement = false
    const clause = importStatement.importClause

    // Remove the default import if its 'Vue'
    let defaultImportName = clause.name
    if (this.isVueIdentifier(clause.name)) {
      defaultImportName = undefined
      updatedStatement = true
    }

    // Remove 'Vue' import from named imports
    let elementsWithoutVue = []
    if (clause.namedBindings && ts.isNamedImports(clause.namedBindings)) {
      if (clause.namedBindings.elements.some(elem => this.isVueIdentifier(elem.name))) {
        elementsWithoutVue = clause.namedBindings.elements.filter(elem => !this.isVueIdentifier(elem.name))
        updatedStatement = true
      }
    }

    if (updatedStatement) {
      if (!defaultImportName && elementsWithoutVue.length === 0) {
        return null
      } else {
        const namedElements = elementsWithoutVue.length > 0 ? factory.createNamedImports(elementsWithoutVue) : undefined
        const clauseWithoutVue = factory.createImportClause(false, defaultImportName, namedElements)
        return factory.createImportDeclaration(undefined, undefined, clauseWithoutVue, importStatement.moduleSpecifier)
      }
    } else {
      return importStatement
    }
  }
}