import ts from "typescript";
import { SFCDescriptor } from "vue-template-compiler";
import { ESLint, Linter } from 'eslint'
import { sourceExtractor } from "./extractors/NodeExtractor";
import VueComponentDescriptor from "./extractors/VueComponentDescriptor";
import { Configuration } from "./helpers/ArgumentParser";
import { FileDescriptor, getSfcDescriptor, replaceVueScript, extractScriptFromSfc } from "./helpers/FilesHelper";
import VuePropertyDecoratorBuilder from "./builders/component/ComponentBuilders";
import ComponentDirector from "./builders/component/ComponentDirector";
import eslintBaseConfig from './eslint.config'

/** Converts a Vue SFC script to a class based syntax */
export async function upgradeComponent(vueFile: FileDescriptor) {
  const sfc = getSfcDescriptor(vueFile)
  const sourceScript = convertScript(sfc)

  const outputPath = global.config.overrideFiles ? vueFile.fullPath : `${global.config.outputDir}${vueFile.nameWithExtension}`

  const prettyScript = await lintScript(sourceScript)

  replaceVueScript(vueFile.fullPath, outputPath, sfc.script, prettyScript || sourceScript)
}

/** Convert the given SFC descriptor's script */
export function convertScript(sfc: SFCDescriptor): string {
  const tsSource = extractScriptFromSfc(sfc)
  
  const vueDescriptor = new VueComponentDescriptor()
  // For every first level child in the source, we extract all the info we need
  ts.forEachChild(tsSource, sourceExtractor(vueDescriptor))
  
  const componentBuilder = new VuePropertyDecoratorBuilder(global.config.isNuxt)
  componentBuilder.setDescriptor(vueDescriptor)
  const director = new ComponentDirector(componentBuilder, global.config.propertiesOrder)
  const newScript = director.build()

  return ts.createPrinter().printFile(newScript)
}

export async function lintScript(sourceScript: string): Promise<string> {
  const baseConfig: Linter.Config = {
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    rules: eslintBaseConfig,
  }

  const eslint = new ESLint({
    fix: true,
    baseConfig,
  });

  return (await eslint.lintText(sourceScript))[0].output;
}