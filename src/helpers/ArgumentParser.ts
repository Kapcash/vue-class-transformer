import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import { AttributeToken } from '../global';

export interface Configuration {
  overrideFiles: boolean;
  isNuxt: boolean;
  outputDir: string;
  propertiesOrder: AttributeToken[];
}

export interface RuntimeConfiguration extends Configuration {
  inputPaths: string[];
}

export function parseArguments(): RuntimeConfiguration {
  const argv = yargs(hideBin(process.argv))
    .scriptName('vct')
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      default: false,
      description: 'Run with verbose logging',
    })
    .option('order', {
      type: 'array',
      default: ['data', 'computed', 'watcher', 'hooks', 'methods', 'other'],
      description: 'Specifies the generated nodes order. Usage: "--order data computed watcher hooks methods other -- mycomponent.vue"',
    })
    .option('nuxt', {
      alias: 'n',
      type: 'boolean',
      default: false,
      description: 'Imports decorators from \'nuxt-property-decorator\' library. Default is \'vue-property-decorator\'.',
    })
    .option('force', {
      alias: 'f',
      type: 'boolean',
      default: false,
      description: 'Writes the new component scripts in place of the actual vue component script.',
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      default: './generated',
      description: 'The folder used to store the converted vue components.',
    })
    .example([
      ['$0 tests/test.vue', 'Convert a single vue file'],
      ['$0 -n tests/test.vue', 'Convert a single vue file'],
      ['$0 components/**/*', 'Convert all vue files in the folder'],
    ])
    .argv;

  const { _: argPath, nuxt, force, output, order } = argv;
    
  const options: Configuration = {
    isNuxt: nuxt,
    overrideFiles: force,
    outputDir: output,
    propertiesOrder: order as AttributeToken[],
  };

  const inputPaths = argPath as string[];
  const outputDir = options.outputDir.endsWith('/') ? options.outputDir : `${options.outputDir}/`;

  const runtimeConfig: RuntimeConfiguration = {
    ...options,
    outputDir,
    inputPaths,
  };
  
  return runtimeConfig;
}