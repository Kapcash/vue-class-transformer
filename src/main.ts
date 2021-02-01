import ts from 'typescript';
import { ESLint, Linter } from 'eslint';
import { sourceExtractor } from './extractors/NodeExtractor';
import VueComponentDescriptor from './extractors/VueComponentDescriptor';
import { FileDescriptor, replaceVueScript, extractScriptFromSfc } from './helpers/FilesHelper';
import VuePropertyDecoratorBuilder from './builders/component/ComponentBuilders';
import ComponentDirector from './builders/component/ComponentDirector';
import eslintBaseConfig from './eslint.config';

/** Converts a Vue SFC script to a class based syntax */
export async function upgradeComponent(vueFile: FileDescriptor) {
  const { sourceScript, tsScriptDescriptor, start, end } = convertScript(vueFile);

  const scriptFile = isNaN(start) ? tsScriptDescriptor : vueFile;
  const outputPath = global.config.overrideFiles ? scriptFile.fullPath : `${global.config.outputDir}${scriptFile.nameWithExtension}`;

  const prettyScript = await lintScript(sourceScript);

  replaceVueScript(scriptFile.fullPath, outputPath, prettyScript || sourceScript, start, end);
}

/** Convert the given SFC descriptor's script */
export function convertScript(vueFile: FileDescriptor) {
  const { sourceScript, tsScriptPath, start, end } = extractScriptFromSfc(vueFile);
  
  const vueDescriptor = new VueComponentDescriptor();
  // For every first level child in the source, we extract all the info we need
  ts.forEachChild(sourceScript, sourceExtractor(vueDescriptor));
  
  const componentBuilder = new VuePropertyDecoratorBuilder(global.config.isNuxt);
  componentBuilder.setDescriptor(vueDescriptor);
  const director = new ComponentDirector(componentBuilder, global.config.propertiesOrder);
  const newScript = director.build();

  return {
    sourceScript: ts.createPrinter().printFile(newScript),
    tsScriptDescriptor: new FileDescriptor(tsScriptPath),
    start,
    end,
  };
}

async function lintScript(sourceScript: string): Promise<string> {
  // FIXME: Webpack loading the parser doesn't work on production bundle (including all compiled node_modules, not as external)
  const baseConfig: Linter.Config = {
    parser: '@typescript-eslint/parser',
    plugins: [
      '@typescript-eslint',
    ],
    rules: eslintBaseConfig,
  };
  
  const eslint = new ESLint({
    fix: true,
    useEslintrc: false,
    baseConfig,
  });

  const lintedScript = await eslint.lintText(sourceScript);

  return lintedScript[0].output;
}