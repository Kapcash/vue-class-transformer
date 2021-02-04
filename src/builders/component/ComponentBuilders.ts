import ts from 'typescript';
const factory = ts.factory;
import PropertyStrategy from '../../strategies/PropertyStrategy';
import ComputedStrategy from '../../strategies/ComputedStrategy';
import VueComponentDescriptor from '../../extractors/VueComponentDescriptor';
import DataStrategy from '../../strategies/DataStrategy';
import MethodStrategy from '../../strategies/MethodStrategy';
import WatchStrategy from '../../strategies/WatchStrategy';
import OtherTokenStrategy from '../../strategies/OtherTokenStrategy';
import ImportStrategy from '../../strategies/ImportStrategy';
import { Alias } from '../../global';

export abstract class ComponentBuilder {
  protected componentDescriptor: VueComponentDescriptor | null = null;
  protected libraryName = '';

  constructor(vueDescriptor: VueComponentDescriptor, isNuxt = false) {
    this.componentDescriptor = vueDescriptor;
    this.libraryName = `${isNuxt ? 'nuxt' : 'vue'}-property-decorator`;
  }

  abstract createImports(): ComponentBuilder;
  abstract createClassComponent(): ComponentBuilder;
  abstract createProperties(): ComponentBuilder;
  abstract createData(): ComponentBuilder;
  abstract createComputed(): ComponentBuilder;
  abstract createHooks(): ComponentBuilder;
  abstract createMethods(): ComponentBuilder;
  abstract createWatchers(): ComponentBuilder;
  abstract createLeft(): ComponentBuilder;
  abstract buildSourceScript(): ts.SourceFile;
}

export default class VuePropertyDecoratorBuilder extends ComponentBuilder {
  private classMembers: ts.ClassElement[] = [];
  private sourceStatements: ts.Statement[] = [];
  createImports() {
    const { imports } = this.componentDescriptor;
    
    const filteredImports = imports.map(imprt => {
      return new ImportStrategy().transform(imprt);
    }).filter(Boolean);
    
    this.sourceStatements.push(this.newImportDeclaration, ...filteredImports);
    return this;
  }

  get newImportDeclaration () {
    const { watchers, props } = this.componentDescriptor;

    const decoratorImports: ts.ImportSpecifier[] = [
      factory.createImportSpecifier(undefined, factory.createIdentifier('Vue')),
      factory.createImportSpecifier(undefined, factory.createIdentifier('Component')),
    ];
  
    if (watchers.length > 0) {
      decoratorImports.push(factory.createImportSpecifier(undefined, factory.createIdentifier('Watch')));
    }
    if (props.length > 0) {
      decoratorImports.push(factory.createImportSpecifier(undefined, factory.createIdentifier('Prop')));
    }
    
    const importClauses = factory.createImportClause(false, undefined, factory.createNamedImports(decoratorImports));
    return factory.createImportDeclaration(undefined, undefined, importClauses, factory.createStringLiteral(this.libraryName, true));
  }
  
  @Alias('props')
  createProperties() {
    const props = this.componentDescriptor.props;
    const newProps = props.map(prop => {
      return new PropertyStrategy().transform(prop);
    }).flat();
    this.classMembers.push(...newProps);
    return this;
  }

  @Alias('hooks')
  createHooks() {
    return this;
  }
  
  @Alias('data')
  createData() {
    const newData = this.componentDescriptor.data.map((data) => {
      return new DataStrategy().transform(data);
    });
    this.classMembers.push(...newData);
    return this;
  }

  @Alias('computed')
  createComputed() {
    const computed = this.componentDescriptor.getters.map(computed => {
      return new ComputedStrategy().transform(computed);
    }).flat();
    this.classMembers.push(...computed);
    return this;
  }

  @Alias('methods')
  createMethods() {
    const methods = this.componentDescriptor.methods.map(method => {
      return new MethodStrategy().transform(method);
    });
    this.classMembers.push(...methods);
    return this;
  }

  @Alias('watcher')
  createWatchers() {
    const watchers = this.componentDescriptor.watchers.map((watcher) => {
      return new WatchStrategy().transform(watcher);
    });
    this.classMembers.push(...watchers);
    return this;
  }

  @Alias('other')
  createLeft() {
    const otherTokens = this.componentDescriptor.otherToken.map(token => {
      return new OtherTokenStrategy().transform(token);
    });
    const [classMembersLike, notClassMemberLike] = otherTokens.chunk(ts.isMethodDeclaration) as [ts.MethodDeclaration[], ts.PropertyDeclaration[]];
    this.classMembers.push(...classMembersLike);
    this.componentDescriptor.addCustomOptions(...notClassMemberLike);

    // const otherProperties: ts.PropertyDeclaration[] = otherTokens
    //   .filter(ts.isPropertyAssignment)
    //   .map(prop => factory.createPropertyDeclaration([], prop.modifiers, prop.name, prop.questionToken, undefined, prop.initializer))
    // this.classMembers.push(...otherProperties)
    return this;
  }

  createClassComponent() {
    const newClass = ts.createClassDeclaration([this.decorator], factory.createModifiersFromModifierFlags(ts.ModifierFlags.ExportDefault), this.componentDescriptor.capitalizedName, undefined, [this.heritageClause], this.classMembers.flat());
    this.sourceStatements.push(newClass);
    return this;
  }

  get heritageClause(): ts.HeritageClause {
    const vueSuperClass = factory.createIdentifier('Vue');
    const extendsExpr = ts.createExpressionWithTypeArguments(undefined, vueSuperClass);
    return factory.createHeritageClause(ts.SyntaxKind.ExtendsKeyword, [extendsExpr]);
  }

  get decorator() {
    let callDecorator: ts.Identifier | ts.Expression = factory.createIdentifier('Component');
    if(this.componentDescriptor.componentOptions.length > 0) {
      const classType = factory.createTypeReferenceNode(this.componentDescriptor.capitalizedName, []);
      callDecorator = factory.createCallExpression(callDecorator, [classType], this.componentDescriptor.componentOptions);
    }
    return factory.createDecorator(callDecorator);
  }

  buildSourceScript () {
    return factory.createSourceFile(this.sourceStatements, factory.createToken(ts.SyntaxKind.EndOfFileToken), null);
  }
}