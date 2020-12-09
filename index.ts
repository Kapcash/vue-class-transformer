import fs from 'fs'  
import vueCompiler from 'vue-template-compiler'
import ts from 'typescript'
import VueComponentDescriptor from './VueComponentDescriptor.js'

// const filePath = path.resolve(_.first(process.argv.slice(2)))
const filePath = './test.vue'
const file = fs.readFileSync(filePath, 'utf8') 

const sfcFile = vueCompiler.parseComponent(file)

const source = ts.createSourceFile(
  'inline.ts',
  sfcFile.script!.content,
  ts.ScriptTarget.ES2020
)
  
const program = ts.createProgram([filePath], {})
const checker = program.getTypeChecker()
const printer = ts.createPrinter()

const sfcClass = new VueComponentDescriptor()
sfcClass.setName(filePath.match(/\/(.*)\.vue/)[1])

const sfcVisitor: ts.Visitor = (node: any): ts.VisitResult<ts.Node> => {
  function extractProperties(dataNode: any): any[] {
    return dataNode.initializer.properties
  }

  switch ((node.name as ts.Identifier)?.text) {
    case 'name':
      sfcClass.setName(node.initializer.text)
      break;
    case 'data':
      sfcClass.data = node.body.statements[0].expression.properties
      break;
    case 'watch':
      sfcClass.watchers = extractProperties(node)
      break;
    case 'computed':
      sfcClass.getters = extractProperties(node)
      break;
    case 'components':
      sfcClass.components = node
      break;
    default:
      break;
  }
  return node
}

const vueOptionToClassTransformer: ts.TransformerFactory<any> = context => {
  const visit: ts.Visitor = (node: any): ts.VisitResult<ts.Node> => {
    node = ts.visitEachChild(node, visit, context)
    const isExport = node.kind === ts.SyntaxKind.ExportAssignment

    if (isExport) {
      const sfcOptions = node.expression.arguments[0]

      const exportNodeExpr = node.expression.expression
      const isVueExtends = exportNodeExpr.expression?.kind === ts.SyntaxKind.Identifier
        && exportNodeExpr.expression?.text === 'Vue'
        && exportNodeExpr.name?.kind === ts.SyntaxKind.Identifier
        && exportNodeExpr.name?.text === 'extends'
  
      if (isVueExtends) {
        ts.visitEachChild(sfcOptions, sfcVisitor, context)
        const imports = sfcClass.getImportDecorators()
        return [imports, sfcClass.toClass()]
      }
    }
    return node
  }
  return node => ts.visitNode(node, visit)
}

const ast = ts.transform(source, [vueOptionToClassTransformer])

writeOutput(ast)

function writeOutput(ast: ts.TransformationResult<any>) {
  // Create our output folder
  const outputDir = './generated'
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir)
  }
  
  // Write pretty printed transformed typescript to output directory
  fs.writeFileSync(
    `${writeOutput}/out.ts`,
    printer.printFile(ast.transformed[0])
  )
}
