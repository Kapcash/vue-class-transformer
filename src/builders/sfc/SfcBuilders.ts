import fs from "fs"
import ts from 'typescript';
import { SFCDescriptor } from 'vue-template-compiler';
import { Alias } from '../../global';

export interface SfcBuilder {
  sfc: string;
  createTemplate(): void;
  createScript(): void;
  createStyles(): void;
  createCustomBlocks(): void;
}

export default class VueSfcBuilder implements SfcBuilder {
  private fileStringLiterals: string[] = []

  constructor(
    private sfcDescriptor: SFCDescriptor | null,
    private scriptSource: ts.SourceFile | null,
  ) {
  }

  get sfc(): string {
    return this.fileStringLiterals.join('\n')
  }

  @Alias('template')
  createTemplate(): void {
    this.fileStringLiterals.push(`<${this.sfcDescriptor.template.type}>${this.sfcDescriptor.template.content}</${this.sfcDescriptor.template.type}>`)
  }
  
  @Alias('script')
  createScript(): void {
    const scriptSrc = ts.createPrinter().printFile(this.scriptSource)
    this.fileStringLiterals.push(`<script lang="ts">\n${scriptSrc}</script>`)
  }

  @Alias('styles')
  createStyles(): void {
    const styles = this.sfcDescriptor.styles.forEach((style) => {
      const lang = style.lang ? `lang="${style.lang}"` : ''
      const scoped = style.scoped ? 'scoped' : ''
      const styleBlock = `<${style.type} ${lang} ${scoped}>\n${style.content}</${style.type}>\n`
      this.fileStringLiterals.push(styleBlock)
    })
  }

  @Alias('other')
  createCustomBlocks(): void {
    this.sfcDescriptor.customBlocks.forEach(block => {
      const attrs = Object.entries(block.attrs).map(([key, val]) => `${key}="${val}"`).join(' ')
      this.fileStringLiterals.push(`<${block.type} ${attrs}>${block.content}</${block.type}>`)
    })
  }
}