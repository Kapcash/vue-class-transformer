import fs from 'fs';
import { dirname } from "path";
import mkdirp from 'mkdirp'
import ts from 'typescript';
import * as VueCompiler from 'vue-template-compiler'
import { SFCDescriptor, SFCBlock } from 'vue-template-compiler'

export function getAllFilesToUpgrade(inputPaths: string[]): FileDescriptor[] {
  const vueFiles = inputPaths
    .map(path => new FileDescriptor(path))
    .filter(file => file.isVueFile);
  if (vueFiles.length <= 0) { throw new Error("This path doesn't include any .vue file!"); }
  return vueFiles;
}

/** Extract the Vue SFC descriptor from an input file */
export function getSfcDescriptor (file: FileDescriptor): SFCDescriptor | null {
  let sourceStr = fs.readFileSync(file.fullPath, 'utf8')
  
  if (file.isVueFile) {
    return VueCompiler.parseComponent(sourceStr)
  } else {
    return null
  }
}

/** Extract the component script as a typescript AST */
export function extractScriptFromSfc(sfc: SFCDescriptor): ts.SourceFile {
  return ts.createSourceFile('inline.ts', sfc.script.content, ts.ScriptTarget.ES2020)
}

/**
 * Replace the Vue SFC script by another. Can create a new duplicated file instead of replacing the existing input.
 * @param filePath The input file path to replace the script
 * @param outputPath The output file path to write the new file. May be equal to the input path.
 * @param scriptBlock The Vue SFC block from the input file
 * @param scriptString The new script to write to the output file / replace existing script
 */
export function replaceVueScript(filePath: string, outputPath: string, scriptBlock: SFCBlock, scriptString: string) {
  mkdirp.sync(dirname(outputPath))
  const fd = fs.openSync(filePath, 'r')

  const stats = fs.fstatSync(fd);

  const beforeSize = scriptBlock.start
  const beforeBuffer = Buffer.alloc(beforeSize)
  fs.readSync(fd, beforeBuffer, null, beforeSize, null)

  const afterSize = stats.size - scriptBlock.end
  const afterBuffer = Buffer.alloc(afterSize)
  fs.readSync(fd, afterBuffer, null, afterSize, scriptBlock.end)

  const scriptBuffer = Buffer.from(scriptString, 'utf8')

  fs.writeFileSync(outputPath, Buffer.concat([beforeBuffer, scriptBuffer, afterBuffer]), { encoding: 'utf-8' })
}

/** A class descripting a file main attributes */
export class FileDescriptor {
  /** @see https://regex101.com/r/skRAGV/1 */
  private MATCH_SCRIPT_FILE_PATH = /^(.*\/)?(.+)\.(vue|ts|js)$/

  fullPath: string = ''
  path: string = ''
  name: string = ''
  extension: string = ''
  
  constructor(fullPath: string) {
    const [ _fullPath, path, name, extension ] = fullPath.match(this.MATCH_SCRIPT_FILE_PATH) || []

    if (!_fullPath) return null

    this.fullPath = fullPath
    this.path = path
    this.name = name
    this.extension = extension
  }

  get isVueFile(): boolean {
    return this.extension === 'vue'
  }

  get nameWithExtension(): string {
    return `${this.name}.${this.extension}`
  }
}