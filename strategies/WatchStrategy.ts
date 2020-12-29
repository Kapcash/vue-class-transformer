import Strategy from './Strategy.js';
import ts from 'typescript'
const factory = ts.factory

@Strategy
export default class WatchStrategy {
  static transform (watcher: ts.ObjectLiteralElementLike): ts.MethodDeclaration | null {
    if (ts.isIdentifier(watcher.name) || ts.isStringLiteral(watcher.name)) {
      const watchParameter = factory.createStringLiteral(watcher.name.text, true)
      const callDecorator = factory.createCallExpression(factory.createIdentifier('Watch'), undefined, [watchParameter])
      const watchDecorator = factory.createDecorator(callDecorator)
      
      const capitalizedWatcherName = watcher.name.text.charAt(0).toUpperCase() + watcher.name.text.slice(1)
      const watchMethodName = `on${capitalizedWatcherName}Update`

      let parameters, body
      if (ts.isPropertyAssignment(watcher) && ts.isFunctionExpression(watcher.initializer)) {
        parameters = watcher.initializer.parameters
        body = watcher.initializer.body
      } else if (ts.isMethodDeclaration(watcher)) {
        parameters = watcher.parameters
        body = watcher.body
      }
      return factory.createMethodDeclaration([watchDecorator], undefined, undefined, watchMethodName, undefined, undefined, parameters, undefined, body)
    }
  }
}