import fs from "fs"
import { dirname } from "path";
import mkdirp from 'mkdirp'
import ts from "typescript";
import { SFCDescriptor } from "vue-template-compiler";
import { Alias } from "../../types.js";

export interface SfcBuilder {
  createTemplate(): void;
  createScript(): void;
  createStyles(): void;
  createCustomBlocks(): void;
}

export default class VueSfcBuilder implements SfcBuilder {
  constructor(
    private outputPath: string,
    private sfcDescriptor: SFCDescriptor | null,
    private scriptSource: ts.SourceFile | null,
  ) {
    this.createFileAndFolders(outputPath)
  }

  private createFileAndFolders(filePath: string) {
    mkdirp.sync(dirname(filePath))
    fs.writeFileSync(filePath, '');
  }

  @Alias('template')
  createTemplate(): void {
    fs.appendFileSync(this.outputPath, `<${this.sfcDescriptor.template.type}>${this.sfcDescriptor.template.content}</${this.sfcDescriptor.template.type}>\n`)
  }
  
  @Alias('script')
  createScript(): void {
    const scriptSrc = ts.createPrinter().printFile(this.scriptSource)
      fs.appendFileSync(this.outputPath, `<script lang="ts">\n${scriptSrc}</script>\n`)
  }

  @Alias('styles')
  createStyles(): void {
    fs.appendFileSync(this.outputPath, this.sfcDescriptor.styles.map(style => `<${style.type} ${style.lang ? `lang="${style.lang}"` : ''} ${style.scoped ? 'scoped' : ''}>\n${style.content}</${style.type}>\n`).join('/n'))
  }

  @Alias('other')
  createCustomBlocks(): void {
    this.sfcDescriptor.customBlocks.forEach(block => {
      const attrs = Object.entries(block.attrs).map(([key, val]) => `${key}="${val}"`).join(' ')
      fs.appendFileSync(this.outputPath, `<${block.type} ${attrs}>${block.content}</${block.type}>\n`)
    })
  }
}