import fs from 'fs';
import ts from 'typescript';
import VueCompiler, { SFCDescriptor } from 'vue-template-compiler'


function isVueFile(filePath: string): boolean {
  return filePath.endsWith('.vue')
} 

/** Recursively get all files from the given folder
 * If the given path is a file, it just returns the file
 * @param path The file or folder path
 * @return All the files present in the folder and its sub-folder, or the file if it's not a folder
 */
function getFilesFromFolder (path = "./") {
  const entries = fs.readdirSync(path, { withFileTypes: true });

  const vueFiles = entries
    .filter(file => !file.isDirectory())
    .map(file => `${path}/${file.name}`)
    .filter(isVueFile);
  const folders = entries.filter(folder => folder.isDirectory());

  for (const folder of folders) {
    vueFiles.push(...getFilesFromFolder(`${path}/${folder.name}`));
  }
  return vueFiles;
}

/** Get all files paths from path and sub-folders */
function getAllFilesPaths (fileOrFolderPath): string[] {
  if (!fs.existsSync(fileOrFolderPath)) throw new Error('Invalid path provided')
  
  if (fs.lstatSync(fileOrFolderPath).isDirectory()) {
    return getFilesFromFolder(fileOrFolderPath)
  } else {
    if (!isVueFile(fileOrFolderPath)) throw new Error('This is not a .vue file!')
    return [fileOrFolderPath]
  };
}

export function getAllFilesToUpgrade (path: string): FileDescriptor[] {
  return getAllFilesPaths(path)
    .map(path => new FileDescriptor(path))
    .filter(file => !!file)
}

export function getSfcDescriptor (file: FileDescriptor): SFCDescriptor | null {
  let sourceStr = fs.readFileSync(file.fullPath, 'utf8')
  
  if (file.isVueFile) {
    return VueCompiler.parseComponent(sourceStr)
  } else {
    return null
  }
}

export function extractScriptFromSfc(sfc: SFCDescriptor): ts.SourceFile {
  return ts.createSourceFile('inline.ts', sfc.script.content, ts.ScriptTarget.ES2020)
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
    const [ _fullPath, path, name, extension ] = fullPath.match(this.MATCH_SCRIPT_FILE_PATH)

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
