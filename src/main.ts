import ts from "typescript";
import { SFCDescriptor } from "vue-template-compiler";
import { sourceExtractor } from "./extractors/NodeExtractor";
import VueComponentDescriptor from "./extractors/VueComponentDescriptor";
import { Configuration } from "./helpers/ArgumentParser";
import { FileDescriptor, getSfcDescriptor, replaceVueScript, extractScriptFromSfc } from "./helpers/FileReader";
import VuePropertyDecoratorBuilder from "./builders/component/ComponentBuilders";
import ComponentDirector from "./builders/component/ComponentDirector";

/** Transform a Vue SFC to another syntax, defined by a director */
export function upgradeComponent(config: Configuration) {
  return function (vueFile: FileDescriptor) {
    const sfc = getSfcDescriptor(vueFile)
    const sourceScript = convertScript(config, sfc)

    const outputPath = config.overrideFiles ? vueFile.fullPath : `${config.outputDir}${vueFile.nameWithExtension}`

    replaceVueScript(vueFile.fullPath, outputPath, sfc.script, sourceScript)
  }
}

/** Convert the given SFC descriptor's script */
export function convertScript(config: Configuration, sfc: SFCDescriptor): string {
  const vueDescriptor = new VueComponentDescriptor()

  const tsSource = extractScriptFromSfc(sfc)

  // For every first level child in the source, we extract all the info we need
  ts.forEachChild(tsSource, sourceExtractor(vueDescriptor))
  
  const componentBuilder = new VuePropertyDecoratorBuilder(config.isNuxt)
  componentBuilder.setDescriptor(vueDescriptor)
  const director = new ComponentDirector(componentBuilder, config.propertiesOrder)
  const newScript = director.build()

  return ts.createPrinter().printFile(newScript)
}