import ts from 'typescript'
import VueSfcBuilder from './builders/sfc/SfcBuilders.js';
import { VuePropertyDecoratorBuilder } from './builders/component/ComponentBuilders.js';
import VueComponentDescriptor from './VueComponentDescriptor.js'
import { getAllFilesToUpgrade, FileDescriptor, getSfcDescriptor, extractScriptFromSfc } from './FileReader.js';
import ComponentDirector from './builders/component/ComponentDirector.js';
import SfcDirector from './builders/sfc/SfcDirector.js';
import { sourceExtractor } from './nodeExtractor.js'
import { AttributeToken, SFCToken } from 'global.js';

// ===== MAIN ===== //

// Arguments parsing
const argPath = process.argv.slice(2)[0]
const OUTPUT_DIR = './generated/'
const overrideFiles: boolean = true
const sfcOrder: SFCToken[] = ['script', 'template', 'styles', 'other']
const propertiesOrder: AttributeToken[] = ['data', 'watcher', 'props', 'hooks', 'methods', 'computed', 'other']

// Build related strategies
const componentBuilder = new VuePropertyDecoratorBuilder()
const director = new ComponentDirector(componentBuilder, propertiesOrder)

const vueFilesToUpgrade: FileDescriptor[] = getAllFilesToUpgrade(argPath)
vueFilesToUpgrade.forEach(upgradeComponent)

/** Transform a Vue SFC to another syntax, defined by a director */
function upgradeComponent(vueFile: FileDescriptor) {
  const vueDescriptor = new VueComponentDescriptor()

  const sfc = getSfcDescriptor(vueFile)
  const tsSource = extractScriptFromSfc(sfc)
  ts.forEachChild(tsSource, sourceExtractor(vueDescriptor))

  componentBuilder.setDescriptor(vueDescriptor)
  const sourceScript = director.build()

  const outputPath = overrideFiles ? `${OUTPUT_DIR}${vueFile.nameWithExtension}` : vueFile.fullPath
  const sfcBuilder = new VueSfcBuilder(outputPath, sfc, sourceScript)
  const sfcDirector = new SfcDirector(sfcBuilder, sfcOrder)
  sfcDirector.buildCustomBlockAtEnd()
}
