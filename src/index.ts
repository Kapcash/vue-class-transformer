import { RuntimeConfiguration } from './types';
import ts from 'typescript'
import { getAllFilesToUpgrade, FileDescriptor, getSfcDescriptor, extractScriptFromSfc } from './FileReader.js';
import { sourceExtractor } from './extractors/NodeExtractor.js'
import { parseArguments, printHelp } from './ArgumentParser.js';
import VueComponentDescriptor from './VueComponentDescriptor.js'
import VueSfcBuilder from './builders/sfc/SfcBuilders.js';
import VuePropertyDecoratorBuilder from './builders/component/ComponentBuilders.js';
import ComponentDirector from './builders/component/ComponentDirector.js';
import SfcDirector from './builders/sfc/SfcDirector.js';

// ===== MAIN ===== //

let config: RuntimeConfiguration
try {
  config = await parseArguments(process.argv.slice(2))
} catch (err) {
  if (err === false) {
    printHelp()
    process.exit(0)
  } else {
    console.error("Failed to parse the input arguments.", err)
    process.exit(9)
  }
}

// Build related strategies
const componentBuilder = new VuePropertyDecoratorBuilder(config.isNuxt)
const director = new ComponentDirector(componentBuilder, config.propertiesOrder)

const vueFilesToUpgrade: FileDescriptor[] = getAllFilesToUpgrade(config.inputPath)
vueFilesToUpgrade.forEach(upgradeComponent)

/** Transform a Vue SFC to another syntax, defined by a director */
function upgradeComponent(vueFile: FileDescriptor) {
  const vueDescriptor = new VueComponentDescriptor()

  const sfc = getSfcDescriptor(vueFile)
  const tsSource = extractScriptFromSfc(sfc)
  ts.forEachChild(tsSource, sourceExtractor(vueDescriptor))

  componentBuilder.setDescriptor(vueDescriptor)
  const sourceScript = director.build()

  const outputPath = config.overrideFiles ? vueFile.fullPath : `${config.outputDir}${vueFile.nameWithExtension}`
  const sfcBuilder = new VueSfcBuilder(outputPath, sfc, sourceScript)
  const sfcDirector = new SfcDirector(sfcBuilder, config.sfcOrder)
  sfcDirector.buildCustomBlockAtEnd()
}
