import ts from 'typescript';

export default abstract class Strategy <T extends ts.Node | ts.Node[]> {
  name = 'unknown data';

  transform(node: ts.Node): T | null {
    try {
      return this._transformNode(node);
    } catch (err) {
      throw new Error(`An error occured while parsing the component ${this.name}.`);
    }
  }

  protected abstract _transformNode(node: ts.Node): T | null;
}
