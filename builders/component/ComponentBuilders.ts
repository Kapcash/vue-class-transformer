import ts from "typescript";
const factory = ts.factory
import PropertyStrategy from "../../strategies/PropertyStrategy.js";
import ComputedStrategy from "../../strategies/ComputedStrategy.js";
import VueComponentDescriptor from "../../VueComponentDescriptor.js";
import DataStrategy from "../../strategies/DataStrategy.js";
import MethodStrategy from "../../strategies/MethodStrategy.js";
import WatchStrategy from "../../strategies/WatchStrategy.js";
import OtherTokenStrategy from "../../strategies/OtherTokenStrategy.js";
import { Alias } from "../../global.js";

export interface ComponentBuilder {
  createImports(): ComponentBuilder;
  createClassComponent(): ComponentBuilder;
  createProperties(): ComponentBuilder;
  createData(): ComponentBuilder;
  createComputed(): ComponentBuilder;
  createHooks(): ComponentBuilder;
  createMethods(): ComponentBuilder;
  createWatchers(): ComponentBuilder;
  createLeft(): ComponentBuilder;
  buildSourceScript(): ts.SourceFile;
}

export class VuePropertyDecoratorBuilder implements ComponentBuilder {
  private _componentDescriptor: VueComponentDescriptor | null = null
  private classMembers: ts.ClassElement[] = []
  private sourceStatements: ts.Statement[] = []

  private getComponentDescriptor(): VueComponentDescriptor {
    if (!this._componentDescriptor) throw new Error("Not VueComponentDescriptor set, we can't build anything without!")
    return this._componentDescriptor
  }

  setDescriptor(descriptor: VueComponentDescriptor) {
    this._componentDescriptor = descriptor
  }
  
  createImports() {
    this.sourceStatements.push(...this.getComponentDescriptor().imports)
    return this
  }
  
  @Alias('props')
  createProperties() {
    const props = this.getComponentDescriptor().props
    const newProps = props.map(prop => {
      return PropertyStrategy.transform(prop)
    }).flat()
    this.classMembers.push(...newProps)
    return this
  }

  @Alias('hooks')
  createHooks() {
    return this
  }
  
  @Alias('data')
  createData() {
    const newData = this.getComponentDescriptor().data.map((data) => {
      return DataStrategy.transform(data)
    })
    this.classMembers.push(...newData)
    return this
  }

  @Alias('computed')
  createComputed() {
    const computed = this.getComponentDescriptor().getters.map(computed => {
      return ComputedStrategy.transform(computed)
    }).flat()
    this.classMembers.push(...computed)
    return this
  }

  @Alias('methods')
  createMethods() {
    const methods = this.getComponentDescriptor().methods.map(method => {
      return MethodStrategy.transform(method)
    })
    this.classMembers.push(...methods)
    return this
  }

  @Alias('watcher')
  createWatchers() {
    const watchers = this.getComponentDescriptor().watchers.map((watcher) => {
      return WatchStrategy.transform(watcher)
    })
    this.classMembers.push(...watchers)
    return this
  }

  @Alias('other')
  createLeft() {
    const otherTokens = this.getComponentDescriptor().otherToken.map(token => {
      return OtherTokenStrategy.transform(token)
    })
    this.classMembers.push(...otherTokens.filter(ts.isMethodDeclaration))
    // const otherProperties: ts.PropertyDeclaration[] = otherTokens
    //   .filter(ts.isPropertyAssignment)
    //   .map(prop => factory.createPropertyDeclaration([], prop.modifiers, prop.name, prop.questionToken, undefined, prop.initializer))
    // this.classMembers.push(...otherProperties)
    return this
  }

  createClassComponent() {
    const newClass = ts.createClassDeclaration([this.decorator], factory.createModifiersFromModifierFlags(ts.ModifierFlags.ExportDefault), this.getComponentDescriptor().capitalizedName, undefined, [this.heritageClause], this.classMembers.flat())
    this.sourceStatements.push(newClass)
    return this
  }

  get heritageClause(): ts.HeritageClause {
    const vueSuperClass = factory.createIdentifier('Vue');
    const extendsExpr = ts.createExpressionWithTypeArguments(undefined, vueSuperClass);
    return factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [extendsExpr]);
  }

  get decorator() {
    let callDecorator: ts.Identifier | ts.Expression = factory.createIdentifier('Component')
    if(this.getComponentDescriptor().componentOptions.length > 0) {
      const classType = factory.createTypeReferenceNode(this.getComponentDescriptor().capitalizedName, []);
      callDecorator = factory.createCallExpression(callDecorator, [classType], this.getComponentDescriptor().componentOptions)
    }
    return factory.createDecorator(callDecorator)
  }

  buildSourceScript () {
    return factory.createSourceFile(this.sourceStatements, factory.createToken(ts.SyntaxKind.EndOfFileToken), null)
  }
}