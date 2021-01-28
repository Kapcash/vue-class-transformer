import ts from 'typescript';

export default interface Strategy {
  transform(node: ts.Node): ts.Node | ts.Node[]
}
