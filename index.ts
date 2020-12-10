import fs from 'fs'
import vueCompiler from 'vue-template-compiler'
import ts from 'typescript'
import VueComponentDescriptor from './VueComponentDescriptor.js'
import { AssignedExport } from 'typescript-parser';

/** Main program */
function run() {
  const filePath = process.argv.slice(2)[0]
  const matchedFileName = filePath.match(/^(?:.*\/)?(.+)\.(vue|ts|js)$/)
  if (!matchedFileName) { throw Error('Invalid file') }

  const componentNameFromFileName = matchedFileName[1]
  const isVueFile = matchedFileName[2] === 'vue'
  
  let sourceStr = fs.readFileSync(filePath, 'utf8')
  
  if (isVueFile) {
    sourceStr = vueCompiler.parseComponent(sourceStr).script.content
  }
  
  const tsSource = ts.createSourceFile('inline.ts', sourceStr, ts.ScriptTarget.ES2020)
    
  const sfcClass = new VueComponentDescriptor()
  sfcClass.setName(componentNameFromFileName)

  const ast = ts.transform(tsSource, [vueOptionToClassTransformer(sfcClass)])
  writeOutput(ast)
}

const sfcVisitor = (sfcDescriptor: VueComponentDescriptor): ts.Visitor => (node: ts.NamedDeclaration): ts.VisitResult<ts.Node> => {
  const extractProperties = (dataNode: ts.PropertyAssignment): ts.NodeArray<any> | null => {
    if (ts.isObjectLiteralExpression(dataNode.initializer)) {
      return dataNode.initializer.properties
    }
    return null
  }

  if (ts.isIdentifier(node.name)) {
    switch (node.name.text) {
      case 'name':
        if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.initializer)) {
          sfcDescriptor.setName(node.initializer.text)
        }
        break;
      case 'data':
        if (ts.isMethodDeclaration(node)) {
          const assigments: ts.Node[] = node.body.statements.filter(ts.isVariableStatement).map(assign => assign.declarationList.declarations).flat()
          const returnStmt = node.body.statements.find(ts.isReturnStatement)
          if (ts.isObjectLiteralExpression(returnStmt.expression)) {
            assigments.push(...returnStmt.expression.properties.filter(statement => !ts.isShorthandPropertyAssignment(statement)))
          }
          sfcDescriptor.setData(assigments)
        }
        break;
      case 'watch':
        if (ts.isPropertyAssignment(node)) {
          sfcDescriptor.setWatchers(extractProperties(node))
        }
        break;
      case 'computed':
        if (ts.isPropertyAssignment(node)) {
          sfcDescriptor.setGetters(extractProperties(node))
        }
        break;
      case 'props':
        if (ts.isPropertyAssignment(node)) {
          sfcDescriptor.setProps(extractProperties(node))
        }
        break;
      case 'methods':
        if (ts.isPropertyAssignment(node)) {
          sfcDescriptor.setMethods(extractProperties(node))
        }
        break;
      case 'components':
        if (ts.isPropertyAssignment(node)) {
          sfcDescriptor.setComponents(extractProperties(node))
        }
        break;
      default:
        sfcDescriptor.addOtherTokenMethods(node)
        break;
    }
  }
  return node
}

const vueOptionToClassTransformer = (sfcDescriptor: VueComponentDescriptor): ts.TransformerFactory<any> => context => {
  const visit: ts.Visitor = (node: any): ts.VisitResult<ts.Node> => {
    if (ts.isExportAssignment(node) && ts.isCallExpression(node.expression)) {
      const exportedMember = node.expression
      
      if (ts.isPropertyAccessExpression(exportedMember.expression)) {
        const exportNodeExpr = exportedMember.expression
        const isVueExtends = ts.isIdentifier(exportNodeExpr.expression)
        && exportNodeExpr.expression?.text === 'Vue'
        && exportNodeExpr.name?.text === 'extends'
        
        if (isVueExtends) {
          const sfcOptions = exportedMember.arguments[0]
          ts.visitEachChild(sfcOptions, sfcVisitor(sfcDescriptor), context)
  
          // TODO Move new import statement to top of the file
          return [sfcDescriptor.getImportDecorators(), sfcDescriptor.toClass()]
        }
      }
    } else {
      node = ts.visitEachChild(node, visit, context)
    }
    return node
  }
  return node => ts.visitNode(node, visit)
}

function writeOutput(ast: ts.TransformationResult<any>) {
  // Create our output folder
  const outputDir = './generated'
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }
  
  // Write pretty printed transformed typescript to output directory
  fs.writeFileSync(
    './generated/out.ts',
    ts.createPrinter().printFile(ast.transformed[0])
  )
}

run()