import minimist from 'minimist'
import chalk from 'chalk';
import { AttributeToken, SFCToken } from '../global.js';

export interface Configuration {
  overrideFiles: boolean;
  isNuxt: boolean;
  outputDir: string;
  sfcOrder: SFCToken[];
  propertiesOrder: AttributeToken[];
}

export interface RuntimeConfiguration extends Configuration {
  inputPath: string;
}

export async function parseArguments(args): Promise<RuntimeConfiguration> {
  // Arguments parsing
  const argv = minimist(args, {
    boolean: ['n', 'f', 'h'],
    alias: {
      n: 'nuxt',
      h: 'help',
      f: 'force',
      c: 'config',
      o: 'output',
    },
    default: {
      n: false,
      f: false,
      o: './generated',
    }
  })

  const { _: argPath, config: configPath, help, nuxt, force, output } = argv
  
  if (help) {
    return Promise.reject(false)
  }
    
  let options: Configuration = {
    isNuxt: nuxt,
    overrideFiles: force,
    outputDir: output,
    sfcOrder: ['script', 'template', 'styles', 'other'],
    propertiesOrder: ['data', 'props', 'watcher', 'hooks', 'methods', 'computed', 'other'],
  }

  if (configPath) {
    const configAbsPath = `${process.cwd()}/${configPath}`
    try {
      const configFile: Configuration = (await import(configAbsPath)).default
      options = { ...options, ...configFile }
    } catch (err) {
      console.error(`Can't find the configuration file at ${configAbsPath}.`, err)
    }
  }
  
  const inputPath = argPath[0]
  const outputDir = options.outputDir.endsWith('/') ? options.outputDir : `${options.outputDir}/`

  const runtimeConfig: RuntimeConfiguration = {
    ...options,
    outputDir,
    inputPath,
  }
  
  return runtimeConfig;
}

export function printHelp() {
  const info = console.log;
  info(`${chalk.bold('Syntax:')}   vts [options] [file|folder path]`)
  
  info('')

  info(`Example:  vts -n -f ./src/test.vue`)
  info(`Example:  vts -o dist/ ./src/components/`)
  
  info('')

  info(chalk.bold(`Options:`))
  info(` -n, --nuxt          Import decorators from 'nuxt-property-decorator' library. Default is 'vue-property-decorator'.`)
  info(` -f, --force         Replace converted files in place instead of created new files.`)
  info(` -o, --output        Path to the output folder. Ignored if option --force is used.`)
  info(` -c, --config         Path to a configuration file. The configuration file options override CLI options if they collide.`)
  info(` -h, --help          Print this helper.`)
  info(` -v, --version       Print the CLI current version.`)
  
  info('')

  info(`See the github README.md for more information: https://github.com/Kapcash/vue-typescript-converter#readme`)
}