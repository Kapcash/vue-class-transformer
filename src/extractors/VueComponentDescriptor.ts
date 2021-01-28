import ts from 'typescript';
const factory = ts.factory;

export default class VueComponentDescriptor  {
  imports: ts.ImportDeclaration[] = [];
  name = '';
  data: ts.NodeArray<ts.VariableDeclaration>;
  components: ts.ObjectLiteralElementLike[] = [];
  mixins: ts.ObjectLiteralElementLike[] = [];
  directives: ts.ObjectLiteralElementLike[] = [];
  watchers: ts.ObjectLiteralElementLike[] = [];
  getters: ts.ObjectLiteralElementLike[] = [];
  props: ts.PropertyAssignment[] = [];
  methods: ts.MethodDeclaration[] = [];
  otherToken: ts.ObjectLiteralElementLike[] = [];

  addImport(importNode: ts.ImportDeclaration) {
    if (ts.isStringLiteral(importNode.moduleSpecifier) && (importNode.moduleSpecifier.text === 'nuxt-property-decorator')) {
      return;
    }
    this.imports.push(importNode);
  }

  setGetters(getterNode: ts.ObjectLiteralElementLike[]) {
    if (getterNode) this.getters = getterNode;
  }

  setName(newName?: string) {
    if (newName) this.name = newName;
  }

  setData(data?: ts.NodeArray<ts.VariableDeclaration>) {
    if (data) this.data = data;
  }

  setWatchers(watchers?: ts.ObjectLiteralElementLike[]) {
    if (watchers) this.watchers = watchers;
  }

  setProps(props?: ts.PropertyAssignment[]) {
    if (props) this.props = props;
  }

  setMethods(methods?: ts.MethodDeclaration[]) {
    if (methods) this.methods = methods;
  }

  addOtherToken(token?: ts.ObjectLiteralElementLike) {
    if (token) this.otherToken = [...this.otherToken, token];
  }

  setComponents(components?: ts.ObjectLiteralElementLike[]) {
    if (components) this.components = components;
  }

  setMixins(mixins?: ts.ObjectLiteralElementLike[]) {
    if (mixins) this.mixins = mixins;
  }

  setDirectives(directives?: ts.ObjectLiteralElementLike[]) {
    if (directives) this.directives = directives;
  }

  get capitalizedName() {
    return this.name.charAt(0).toUpperCase() + this.name.slice(1);
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
}