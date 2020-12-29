import ts from "typescript";

function StaticImplements<T>() {
  return <U extends T>(constructor: U) => {constructor};
}

interface Strategy {
  transform(node: ts.Node): ts.Node | ts.Node[]
}

export default StaticImplements<Strategy>()